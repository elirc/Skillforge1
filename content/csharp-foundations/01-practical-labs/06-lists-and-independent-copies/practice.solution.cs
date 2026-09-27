
public static class Exercise
{
    public static List<int> AppendCopy(List<int> source, int value)
    {
        var copy = new List<int>(source); copy.Add(value); return copy;
    }
}
