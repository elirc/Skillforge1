
public static class Exercise
{
    public static bool CanReserve(int stock, int requested)
    {
        if (requested <= 0) return false; return requested <= stock;
    }
}
