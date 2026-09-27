// Provided resources. Each one writes to the shared log when it opens and closes.
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

    // A file name containing "corrupt" is unreadable (IOException, skip it);
    // one containing "fatal" is a bug (InvalidOperationException, abort the import).
    // Otherwise the row count is the file name's length.
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
    // Provided entry point: runs the import and records how it ended.
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

    // TODO: make cleanup exception-safe.
    // - Open ONE Connection for the whole import with `await using`.
    // - For each file, open a FileReader with `using`, read its rows and save them.
    // - An IOException skips that file: log "skip <file>: <message>" and continue.
    //   The reader must already be closed when the skip is logged.
    // - Anything else propagates, but every reader and the connection must still
    //   be closed first, innermost first.
    private static async Task ImportCoreAsync(string[] files, List<string> log)
    {
        var connection = new Connection(log);
        foreach (var file in files)
        {
            var reader = new FileReader(file, log);
            connection.Save(file, reader.ReadRows());
            reader.Dispose();
        }

        await connection.DisposeAsync();
    }
}
