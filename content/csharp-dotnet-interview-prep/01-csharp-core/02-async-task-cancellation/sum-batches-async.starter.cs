public static class Batches
{
    // Given: simulates one unit of independent async work.
    public static async Task<int> SumBatchAsync(int[] batch)
    {
        await Task.Yield();
        return batch.Sum();
    }

    // Sum every batch. The batches are independent, so start them all and wait
    // once with Task.WhenAll rather than awaiting each one in turn.
    public static async Task<int> SumBatchesAsync(int[][] batches)
    {
        throw new NotImplementedException();
    }
}
