public sealed record Registration(string Service, string Lifetime, List<string> Dependencies);

public static class ContainerValidator
{
    // Report missing dependencies, singletons that capture scoped services
    // (directly or through transients), and services that are part of a cycle.
    public static List<string> Validate(List<Registration> registrations)
    {
        throw new NotImplementedException();
    }
}
