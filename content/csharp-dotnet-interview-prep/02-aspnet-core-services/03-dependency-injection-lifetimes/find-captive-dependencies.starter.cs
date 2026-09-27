public sealed record Registration(string Service, string Lifetime, string[] Dependencies);

public static class ScopeValidator
{
    // Model ASP.NET Core's scope validation. Lifetime is "Singleton", "Scoped" or
    // "Transient"; Dependencies are the constructor parameters (service names).
    //
    // A captive dependency is a Singleton that ends up holding a Scoped service.
    // For each Singleton, in registration order:
    //   - follow its dependencies depth-first, in declared order;
    //   - reaching a Scoped service is a problem: record the path joined with " -> ",
    //     e.g. "ReminderScheduler -> AppDbContext", and stop that branch;
    //   - walk THROUGH a Transient dependency (it lives as long as the singleton that
    //     holds it), e.g. "Cache -> Renderer -> AppDbContext";
    //   - do not walk into another Singleton: it is checked as its own root;
    //   - skip services that are not registered, and never visit the same service
    //     twice while checking one root (dependency cycles must not loop forever).
    // Service names are unique. Return the problems in the order they are found.
    public static List<string> FindCaptiveDependencies(Registration[] registrations)
    {
        return new List<string>();
    }
}
