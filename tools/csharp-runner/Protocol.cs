using System.Text.Json;
using System.Text.Json.Serialization;

namespace Skillforge.CsharpRunner;

/// <summary>One test case: invoke the exercise method with <c>Args</c> and compare to <c>Expected</c>.</summary>
public sealed class TestCase
{
    [JsonPropertyName("name")] public string Name { get; set; } = "";
    [JsonPropertyName("args")] public List<JsonElement> Args { get; set; } = new();
    [JsonPropertyName("expected")] public JsonElement Expected { get; set; }
    [JsonPropertyName("hidden")] public bool Hidden { get; set; }
}

/// <summary>A submission to compile and run. One JSON object per line on stdin.</summary>
public sealed class RunRequest
{
    [JsonPropertyName("code")] public string Code { get; set; } = "";
    [JsonPropertyName("functionName")] public string FunctionName { get; set; } = "";
    [JsonPropertyName("tests")] public List<TestCase> Tests { get; set; } = new();

    /// <summary>Budget for the learner's code only; compilation is not counted.</summary>
    [JsonPropertyName("executionTimeoutMs")] public int ExecutionTimeoutMs { get; set; }
}

public sealed class TestResult
{
    [JsonPropertyName("name")] public string Name { get; set; } = "";
    [JsonPropertyName("passed")] public bool Passed { get; set; }
    [JsonPropertyName("expected")] public object? Expected { get; set; }
    [JsonPropertyName("actual")] public object? Actual { get; set; }
    [JsonPropertyName("error")] public string? Error { get; set; }
    [JsonPropertyName("hidden")] public bool Hidden { get; set; }
}

/// <summary>
/// Mirrors the TypeScript <c>SandboxResponse</c>, plus the two things C# has and
/// JavaScript does not: a compile step that can fail before any test runs, and
/// captured console output.
/// </summary>
public sealed class RunResponse
{
    [JsonPropertyName("results")] public List<TestResult> Results { get; set; } = new();
    [JsonPropertyName("passed")] public bool Passed { get; set; }
    [JsonPropertyName("compileErrors")] public List<CompileError>? CompileErrors { get; set; }
    [JsonPropertyName("stdout")] public string? Stdout { get; set; }

    /// <summary>Set when learner code overran its budget; the host exits afterwards.</summary>
    [JsonPropertyName("timedOut")] public bool TimedOut { get; set; }
}

public sealed class CompileError
{
    [JsonPropertyName("id")] public string Id { get; set; } = "";
    [JsonPropertyName("message")] public string Message { get; set; } = "";
    [JsonPropertyName("line")] public int Line { get; set; }
    [JsonPropertyName("column")] public int Column { get; set; }
}
