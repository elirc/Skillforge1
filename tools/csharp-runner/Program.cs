using System.Globalization;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Skillforge.CsharpRunner;

// A long-lived host: one JSON request per stdin line, one JSON response per
// stdout line. Roslyn's first compile costs ~15-20s of JIT, so spawning a
// process per request would be unusable; the caller keeps this one warm.
//
// Learner code runs in-process with full trust. An infinite loop or a stack
// overflow cannot be recovered from here, so the Node side owns the hard
// timeout: it kills this process and starts a new one.

CultureInfo.DefaultThreadCurrentCulture = CultureInfo.InvariantCulture;
CultureInfo.DefaultThreadCurrentUICulture = CultureInfo.InvariantCulture;

// Node speaks UTF-8. On Windows a redirected console otherwise defaults to the
// active code page, which mangles any non-ASCII character in either direction.
var utf8 = new UTF8Encoding(false);
var protocolOut = new StreamWriter(Console.OpenStandardOutput(), utf8) { AutoFlush = false };
Console.SetIn(new StreamReader(Console.OpenStandardInput(), utf8));

// The protocol owns the real stdout, so nothing the learner writes can ever
// reach it: Console.Out is permanently a sink, and each run swaps in a capture
// buffer on top of that sink.
Console.SetOut(TextWriter.Null);

var serializerOptions = new JsonSerializerOptions
{
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
};

var sandbox = new Sandbox();
sandbox.Warmup();

// Announce readiness only after warmup, so the caller starts its execution
// budget against a genuinely warm process.
protocolOut.WriteLine(JsonSerializer.Serialize(new { ready = true }));
protocolOut.Flush();

string? line;
while ((line = Console.In.ReadLine()) is not null)
{
    if (line.Length == 0) continue;

    string payload;
    var timedOut = false;

    try
    {
        var request = JsonSerializer.Deserialize<RunRequest>(line)
                      ?? throw new InvalidOperationException("Empty request.");
        var response = sandbox.Run(request);
        timedOut = response.TimedOut;
        payload = JsonSerializer.Serialize(new { ok = true, response }, serializerOptions);
    }
    catch (Exception exception)
    {
        payload = JsonSerializer.Serialize(new { ok = false, error = exception.GetType().Name + ": " + exception.Message });
    }

    protocolOut.WriteLine(payload);
    protocolOut.Flush();

    if (timedOut)
    {
        // The runaway thread is still running and cannot be stopped. The
        // response is already flushed, so exit and let the caller respawn.
        return 3;
    }
}

return 0;
