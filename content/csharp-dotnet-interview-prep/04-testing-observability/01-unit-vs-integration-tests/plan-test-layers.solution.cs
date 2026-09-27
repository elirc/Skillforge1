public sealed record Behavior(string Name, string[] Touches);
public sealed record TestPlan(string Behavior, string Layer);

public static class TestPlanner
{
    private static readonly string[] FrameworkWiring = { "http", "routing", "di", "auth", "ef-core", "database", "serialization" };
    private static readonly string[] OutsideYourControl = { "clock", "random", "external-api" };
    private static readonly string[] CostOrder = { "unit", "unit-with-fake", "integration", "e2e" };

    public static List<TestPlan> PlanTests(Behavior[] behaviors)
    {
        return behaviors
            .Select(behavior => new TestPlan(behavior.Name, LayerFor(behavior.Touches)))
            // OrderBy is stable, so behaviors on the same layer keep their input order.
            .OrderBy(plan => Array.IndexOf(CostOrder, plan.Layer))
            .ToList();
    }

    private static string LayerFor(string[] touches)
    {
        if (touches.Contains("browser")) return "e2e";
        if (touches.Any(touch => FrameworkWiring.Contains(touch))) return "integration";
        if (touches.Any(touch => OutsideYourControl.Contains(touch))) return "unit-with-fake";
        return "unit";
    }
}
