using System.Globalization;
using System.Reflection;
using System.Runtime.Loader;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;

namespace Skillforge.CsharpRunner;

/// <summary>
/// Compiles a learner submission in memory and invokes the requested static
/// method once per test case.
/// </summary>
public sealed class Sandbox
{
    private const int MaxCapturedOutput = 8 * 1024;
    private const int LearnerStackBytes = 4 * 1024 * 1024;

    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        Converters = { new JsonStringEnumConverter() },
    };

    /// <summary>
    /// Kept in its own syntax tree so the learner's file keeps line 1 at line 1
    /// and compile diagnostics point at what they actually typed.
    /// </summary>
    private const string GlobalUsings =
        "global using System;\n" +
        "global using System.Collections.Generic;\n" +
        "global using System.Linq;\n" +
        "global using System.Threading;\n" +
        "global using System.Threading.Tasks;\n";

    private readonly List<MetadataReference> _references;

    public Sandbox()
    {
        var trusted = (string?)AppContext.GetData("TRUSTED_PLATFORM_ASSEMBLIES") ?? "";
        _references = trusted
            .Split(Path.PathSeparator, StringSplitOptions.RemoveEmptyEntries)
            .Where(path => path.EndsWith(".dll", StringComparison.OrdinalIgnoreCase))
            .Select(path => (MetadataReference)MetadataReference.CreateFromFile(path))
            .ToList();
    }

    /// <summary>
    /// Roslyn's first compilation costs ~15-20s of JIT. Paying it before the
    /// process announces itself as ready keeps it off the learner's first Run.
    /// </summary>
    public void Warmup()
    {
        var assembly = Compile("public static class Warmup { public static int Identity(int value) => value; }", out _);
        assembly?.GetTypes()
            .SelectMany(type => type.GetMethods(BindingFlags.Public | BindingFlags.Static))
            .FirstOrDefault(method => method.Name == "Identity")
            ?.Invoke(null, new object?[] { 1 });
    }

    private Assembly? Compile(string code, out List<CompileError> errors)
    {
        errors = new List<CompileError>();

        var parseOptions = new CSharpParseOptions(LanguageVersion.Latest);
        var trees = new[]
        {
            CSharpSyntaxTree.ParseText(GlobalUsings, parseOptions, path: "GlobalUsings.cs"),
            CSharpSyntaxTree.ParseText(code, parseOptions, path: "Submission.cs"),
        };

        var compilation = CSharpCompilation.Create(
            "Submission_" + Guid.NewGuid().ToString("N"),
            trees,
            _references,
            new CSharpCompilationOptions(
                OutputKind.DynamicallyLinkedLibrary,
                optimizationLevel: OptimizationLevel.Release,
                allowUnsafe: false));

        using var peStream = new MemoryStream();
        var result = compilation.Emit(peStream);

        if (!result.Success)
        {
            foreach (var diagnostic in result.Diagnostics.Where(d => d.Severity == DiagnosticSeverity.Error))
            {
                var position = diagnostic.Location.GetLineSpan().StartLinePosition;
                errors.Add(new CompileError
                {
                    Id = diagnostic.Id,
                    Message = diagnostic.Id == "CS8805"
                        ? "Write a class with a public static method rather than top-level statements."
                        : diagnostic.GetMessage(CultureInfo.InvariantCulture),
                    Line = position.Line + 1,
                    Column = position.Character + 1,
                });
            }
            return null;
        }

        peStream.Position = 0;
        // Collectible so repeated submissions in one process can be unloaded.
        var context = new AssemblyLoadContext("submission", isCollectible: true);
        return context.LoadFromStream(peStream);
    }

    public RunResponse Run(RunRequest request)
    {
        var assembly = Compile(request.Code, out var compileErrors);
        if (assembly is null)
        {
            return new RunResponse { Results = new List<TestResult>(), Passed = false, CompileErrors = compileErrors };
        }

        List<MethodInfo> candidates;
        try
        {
            candidates = assembly.GetTypes()
                .SelectMany(type => type.GetMethods(BindingFlags.Public | BindingFlags.Static))
                .Where(candidate => candidate.Name == request.FunctionName)
                .ToList();
        }
        catch (ReflectionTypeLoadException exception)
        {
            return Failure(request, "Could not load the submitted types: " + exception.Message);
        }

        if (candidates.Count == 0)
        {
            return Failure(request, "Expected a public static method named " + request.FunctionName + ".");
        }

        if (candidates.Count > 1)
        {
            // Untyped JSON arguments cannot choose between overloads.
            return Failure(
                request,
                "Found " + candidates.Count + " public static methods named " + request.FunctionName + "; define exactly one.");
        }

        var method = candidates[0];
        foreach (var parameter in method.GetParameters())
        {
            if (parameter.IsOut || parameter.ParameterType.IsByRef)
            {
                return Failure(request, request.FunctionName + " must not use ref or out parameters.");
            }
        }

        var results = new List<TestResult>();
        var budget = TimeSpan.FromMilliseconds(request.ExecutionTimeoutMs <= 0 ? 2000 : request.ExecutionTimeoutMs);
        var output = new StringBuilder();

        foreach (var test in request.Tests)
        {
            var outcome = RunSingle(method, test, budget, output);
            results.Add(outcome.Result);

            if (outcome.TimedOut)
            {
                // A .NET thread cannot be aborted, so the runaway test is still
                // burning CPU. Report what we have and let the host exit.
                foreach (var skipped in request.Tests.Skip(results.Count))
                {
                    results.Add(new TestResult
                    {
                        Name = skipped.Name,
                        Passed = false,
                        Expected = skipped.Expected,
                        Actual = null,
                        Error = "Skipped after an earlier test timed out.",
                        Hidden = skipped.Hidden,
                    });
                }

                return new RunResponse { Results = results, Passed = false, TimedOut = true, Stdout = Truncate(output) };
            }
        }

        return new RunResponse
        {
            Results = results,
            Passed = results.All(result => result.Passed),
            Stdout = Truncate(output),
        };
    }

    private static string? Truncate(StringBuilder output)
    {
        if (output.Length == 0) return null;
        return output.Length <= MaxCapturedOutput
            ? output.ToString()
            : output.ToString(0, MaxCapturedOutput) + "\n... output truncated ...";
    }

    private static (TestResult Result, bool TimedOut) RunSingle(
        MethodInfo method,
        TestCase test,
        TimeSpan budget,
        StringBuilder output)
    {
        var expected = test.Expected;
        object? returned = null;
        Exception? thrown = null;

        // Learner code runs on its own thread so a slow test can be given up on,
        // and with a bounded stack so runaway recursion fails fast.
        var worker = new Thread(() =>
        {
            var captured = new StringWriter();
            var previousOut = Console.Out;
            try
            {
                // Console.WriteLine in learner code must never reach stdout:
                // that stream carries the JSON protocol.
                Console.SetOut(captured);

                var parameters = method.GetParameters();
                if (parameters.Length != test.Args.Count)
                {
                    throw new ArgumentException(
                        method.Name + " takes " + parameters.Length + " argument(s) but the test supplies " +
                        test.Args.Count + ".");
                }

                var arguments = new object?[parameters.Length];
                for (var i = 0; i < parameters.Length; i++)
                {
                    arguments[i] = test.Args[i].Deserialize(parameters[i].ParameterType, SerializerOptions);
                }

                returned = UnwrapAsync(method.Invoke(null, arguments), method.ReturnType);
            }
            catch (Exception exception)
            {
                thrown = exception;
            }
            finally
            {
                Console.SetOut(previousOut);
                lock (output)
                {
                    output.Append(captured.ToString());
                }
            }
        }, LearnerStackBytes)
        {
            IsBackground = true,
        };

        worker.Start();

        if (!worker.Join(budget))
        {
            return (new TestResult
            {
                Name = test.Name,
                Passed = false,
                Expected = expected,
                Actual = null,
                Error = "Execution timed out.",
                Hidden = test.Hidden,
            }, true);
        }

        if (thrown is not null)
        {
            // Reflection wraps whatever the learner's code threw.
            var real = thrown is TargetInvocationException { InnerException: not null } wrapper
                ? wrapper.InnerException!
                : thrown;

            return (new TestResult
            {
                Name = test.Name,
                Passed = false,
                Expected = expected,
                Actual = null,
                Error = real.GetType().Name + ": " + real.Message,
                Hidden = test.Hidden,
            }, false);
        }

        try
        {
            var actual = JsonSerializer.SerializeToElement(returned, SerializerOptions);
            return (new TestResult
            {
                Name = test.Name,
                Passed = JsonCompare.DeepEquals(actual, expected),
                Expected = expected,
                Actual = actual,
                Hidden = test.Hidden,
            }, false);
        }
        catch (Exception exception)
        {
            return (new TestResult
            {
                Name = test.Name,
                Passed = false,
                Expected = expected,
                Actual = null,
                Error = "Could not compare the returned value: " + exception.Message,
                Hidden = test.Hidden,
            }, false);
        }
    }

    /// <summary>
    /// Lets an exercise be written as an async Task, which the .NET course
    /// needs. The declared return type decides how to unwrap: an `async Task`
    /// is a `Task&lt;VoidTaskResult&gt;` at runtime, so testing `IsGenericType`
    /// on the instance would surface that private struct as `{}`.
    /// </summary>
    private static object? UnwrapAsync(object? returned, Type returnType)
    {
        if (returned is null) return null;

        if (typeof(Task).IsAssignableFrom(returnType))
        {
            var task = (Task)returned;
            task.GetAwaiter().GetResult();
            return returnType.IsGenericType ? returnType.GetProperty("Result")!.GetValue(task) : null;
        }

        if (returnType == typeof(ValueTask))
        {
            ((ValueTask)returned).GetAwaiter().GetResult();
            return null;
        }

        if (returnType.IsGenericType && returnType.GetGenericTypeDefinition() == typeof(ValueTask<>))
        {
            // Route through Task so the result can be read without generics.
            var asTask = (Task)returnType.GetMethod("AsTask")!.Invoke(returned, null)!;
            asTask.GetAwaiter().GetResult();
            return asTask.GetType().GetProperty("Result")!.GetValue(asTask);
        }

        return returned;
    }

    private static RunResponse Failure(RunRequest request, string message) => new()
    {
        Results = request.Tests.Select(test => new TestResult
        {
            Name = test.Name,
            Passed = false,
            Expected = test.Expected,
            Actual = null,
            Error = message,
            Hidden = test.Hidden,
        }).ToList(),
        Passed = false,
    };
}
