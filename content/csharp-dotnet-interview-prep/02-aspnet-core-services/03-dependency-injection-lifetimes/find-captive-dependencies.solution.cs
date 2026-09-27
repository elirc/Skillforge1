public sealed record Registration(string Service, string Lifetime, string[] Dependencies);

public static class ScopeValidator
{
    public static List<string> FindCaptiveDependencies(Registration[] registrations)
    {
        var byName = registrations.ToDictionary(registration => registration.Service);
        var problems = new List<string>();

        foreach (var root in registrations.Where(registration => registration.Lifetime == "Singleton"))
        {
            var visited = new HashSet<string> { root.Service };
            Walk(root, new List<string> { root.Service }, byName, visited, problems);
        }

        return problems;
    }

    private static void Walk(
        Registration current,
        List<string> path,
        Dictionary<string, Registration> byName,
        HashSet<string> visited,
        List<string> problems)
    {
        foreach (var dependency in current.Dependencies)
        {
            if (!visited.Add(dependency)) continue;
            if (!byName.TryGetValue(dependency, out var registration)) continue;

            path.Add(dependency);
            if (registration.Lifetime == "Scoped")
            {
                // The singleton would hold this scoped instance for the life of the app.
                problems.Add(string.Join(" -> ", path));
            }
            else if (registration.Lifetime == "Transient")
            {
                // A transient built for a singleton lives as long as that singleton,
                // so whatever the transient depends on is captured too.
                Walk(registration, path, byName, visited, problems);
            }
            // Another singleton is validated as its own root.
            path.RemoveAt(path.Count - 1);
        }
    }
}
