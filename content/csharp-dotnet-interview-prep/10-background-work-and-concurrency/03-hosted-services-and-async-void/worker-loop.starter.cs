public sealed record WorkerRun(List<string> Log, int Processed, int Failed);

public static class Worker
{
    // Model a BackgroundService.ExecuteAsync loop. `stopping` plays the role of
    // the host's stoppingToken.
    //
    // - Log "start" first.
    // - Before each job, stop looping if shutdown has been requested.
    // - Await ProcessAsync (provided). On success: Processed++, log "done <job>".
    // - If it throws OperationCanceledException BECAUSE THE HOST IS STOPPING
    //   (stopping.Token.IsCancellationRequested), that is a graceful shutdown,
    //   not an error: log "cancelled <job>" and leave the loop.
    // - Any other exception, including a TaskCanceledException from a timeout
    //   while the host is still running, is one failed job: Failed++, log
    //   "error <job>: <message>", and KEEP GOING. One bad message must not kill
    //   the worker.
    // - Log "stopped: <processed> done, <failed> failed" last.
    public static async Task<WorkerRun> RunAsync(string[] jobs)
    {
        using var stopping = new CancellationTokenSource();
        var log = new List<string> { "start" };
        var processed = 0;
        var failed = 0;

        foreach (var job in jobs)
        {
            try
            {
                await ProcessAsync(job, stopping);
                processed++;
                log.Add($"done {job}");
            }
            catch (Exception ex)
            {
                // Treats shutdown like any other failure and never stops.
                failed++;
                log.Add($"error {job}: {ex.Message}");
            }
        }

        log.Add($"stopped: {processed} done, {failed} failed");
        return new WorkerRun(log, processed, failed);
    }

    // Provided. The job "shutdown" simulates the host stopping in the middle of
    // a job; "fail..." jobs throw; "timeout..." jobs time out on their own.
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
