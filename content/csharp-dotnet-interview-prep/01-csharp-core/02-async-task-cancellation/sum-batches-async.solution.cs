public static class Batches
{
    public static async Task<int> SumBatchAsync(int[] batch)
    {
        await Task.Yield();
        return batch.Sum();
    }

    public static async Task<int> SumBatchesAsync(int[][] batches)
    {
        var totals = await Task.WhenAll(batches.Select(SumBatchAsync));
        return totals.Sum();
    }
}
