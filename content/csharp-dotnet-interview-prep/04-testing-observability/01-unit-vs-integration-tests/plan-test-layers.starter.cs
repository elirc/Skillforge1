public sealed record Behavior(string Name, string[] Touches);
public sealed record TestPlan(string Behavior, string Layer);

public static class TestPlanner
{
    // Choose the cheapest test layer that can still prove each behavior.
    // Touches lists what the behavior depends on. Pick the FIRST rule that applies:
    //   1. touches "browser"                                          -> "e2e"
    //   2. touches any of "http", "routing", "di", "auth", "ef-core",
    //      "database", "serialization" (framework wiring you own)     -> "integration"
    //   3. touches any of "clock", "random", "external-api"
    //      (things you cannot control in a fast test)                  -> "unit-with-fake"
    //   4. anything else, including no touches at all                 -> "unit"
    //
    // Return the plan ordered from cheapest to most expensive layer
    // (unit, unit-with-fake, integration, e2e). Behaviors on the same layer keep
    // their input order - this is the test pyramid, read top to bottom.
    public static List<TestPlan> PlanTests(Behavior[] behaviors)
    {
        return behaviors.Select(behavior => new TestPlan(behavior.Name, "unit")).ToList();
    }
}
