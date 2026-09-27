public sealed record WorkerRun(List<string> Log, int Processed, int Failed);

public static class Worker
{
    public static async Task<WorkerRun> RunAsync(string[] jobs)
    {
        using var stopping = new CancellationTokenSource();
        var token = stopping.Token;
        var log = new List<string> { "start" };
        var processed = 0;
        var failed = 0;

        foreach (var job in jobs)
        {
            if (token.IsCancellationRequested)
            {
                break;
            }

            try
            {
                await ProcessAsync(job, stopping);
                processed++;
                log.Add($"done {job}");
            }
            catch (OperationCanceledException) when (token.IsCancellationRequested)
            {
                // The host is stopping: exit quietly, this is not a failure.
                log.Add($"cancelled {job}");
                break;
            }
            catch (Exception ex)
            {
                // Includes a timeout's TaskCanceledException while we are still running.
                failed++;
                log.Add($"error {job}: {ex.Message}");
            }
        }

        log.Add($"stopped: {processed} done, {failed} failed");
        return new WorkerRun(log, processed, failed);
    }

    private static async Task ProcessAsync(string job, CancellationTokenSource host)
    {
        await Task.Yield();
        if (job == "shutdown")
        {
            host.Cancel();
        }

        host.Token.ThrowIfCancellationRequested();

        if (job.StartsWith("fail")) throw new InvalidOperationException($"{job} exploded");
        if (job.StartsWith("timeout")) throw new TaskCanceledException($"{job} timed out");
    }
}
