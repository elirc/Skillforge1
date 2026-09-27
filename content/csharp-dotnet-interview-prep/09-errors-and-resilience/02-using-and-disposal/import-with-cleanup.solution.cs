public sealed class Connection : IAsyncDisposable
{
    private readonly List<string> _log;

    public Connection(List<string> log)
    {
        _log = log;
        _log.Add("open db");
    }

    public void Save(string file, int rows) => _log.Add($"save {file} ({rows} rows)");

    public async ValueTask DisposeAsync()
    {
        await Task.Yield();
        _log.Add("close db");
    }
}

public sealed class FileReader : IDisposable
{
    private readonly string _file;
    private readonly List<string> _log;

    public FileReader(string file, List<string> log)
    {
        _file = file;
        _log = log;
        _log.Add($"open {file}");
    }

    public int ReadRows()
    {
        if (_file.Contains("corrupt")) throw new System.IO.IOException($"{_file} is unreadable");
        if (_file.Contains("fatal")) throw new InvalidOperationException($"{_file} broke the parser");
        return _file.Length;
    }

    public void Dispose() => _log.Add($"close {_file}");
}

public static class Importer
{
    public static async Task<List<string>> ImportAsync(string[] files)
    {
        var log = new List<string>();
        try
        {
            await ImportCoreAsync(files, log);
            log.Add("done");
        }
        catch (InvalidOperationException ex)
        {
            log.Add($"abort: {ex.Message}");
        }

        return log;
    }

    private static async Task ImportCoreAsync(string[] files, List<string> log)
    {
        // Disposed when the method exits, however it exits.
        await using var connection = new Connection(log);

        foreach (var file in files)
        {
            try
            {
                // A using declaration disposes at the end of the enclosing block,
                // which is the try block, so the reader closes before the catch runs.
                using var reader = new FileReader(file, log);
                connection.Save(file, reader.ReadRows());
            }
            catch (System.IO.IOException ex)
            {
                log.Add($"skip {file}: {ex.Message}");
            }
        }
    }
}
