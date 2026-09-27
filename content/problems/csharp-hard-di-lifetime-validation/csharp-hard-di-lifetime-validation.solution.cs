public sealed record Registration(string Service, string Lifetime, List<string> Dependencies);

public static class ContainerValidator
{
    public static List<string> Validate(List<Registration> registrations)
    {
        // Last registration wins, as with IServiceCollection.
        var services = new Dictionary<string, Registration>();
        foreach (var registration in registrations) services[registration.Service] = registration;

        var errors = new HashSet<string>();

        foreach (var service in services.Values)
        {
            foreach (var dependency in service.Dependencies)
            {
                if (!services.ContainsKey(dependency)) errors.Add($"{service.Service} depends on missing {dependency}");
            }
        }

        foreach (var singleton in services.Values.Where(s => s.Lifetime == "Singleton"))
        {
            var visited = new HashSet<string>();
            var stack = new Stack<string>(singleton.Dependencies);
            while (stack.Count > 0)
            {
                var name = stack.Pop();
                if (!visited.Add(name) || !services.TryGetValue(name, out var dependency)) continue;
                if (dependency.Lifetime == "Scoped") errors.Add($"{singleton.Service} (Singleton) captures {name} (Scoped)");
                else if (dependency.Lifetime == "Transient")
                {
                    foreach (var next in dependency.Dependencies) stack.Push(next);
                }
            }
        }

        foreach (var service in services.Values)
        {
            var visited = new HashSet<string>();
            var stack = new Stack<string>(service.Dependencies);
            while (stack.Count > 0)
            {
                var name = stack.Pop();
                if (name == service.Service)
                {
                    errors.Add($"{service.Service} is part of a cycle");
                    break;
                }
                if (!visited.Add(name) || !services.TryGetValue(name, out var dependency)) continue;
                foreach (var next in dependency.Dependencies) stack.Push(next);
            }
        }

        return errors.OrderBy(message => message, StringComparer.Ordinal).ToList();
    }
}
