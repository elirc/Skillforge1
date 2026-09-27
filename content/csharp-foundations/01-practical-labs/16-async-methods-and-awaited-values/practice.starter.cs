
public static class Exercise
{
    public static async Task<int> DoubleLater(int value)
    {
        await Task.Yield(); return 0;
    }
}
