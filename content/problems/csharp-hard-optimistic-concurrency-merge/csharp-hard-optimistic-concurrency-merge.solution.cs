public sealed record Row(int Id, int Version, string Title, int Quantity);
public sealed record Update(int Id, int ExpectedVersion, string? Title, int? Quantity);
public sealed record MergeResult(List<string> Outcomes, List<Row> Rows);

public static class ConcurrencyMerge
{
    public static MergeResult ApplyUpdates(List<Row> rows, List<Update> updates)
    {
        var current = rows.ToDictionary(row => row.Id);
        var changedAt = rows.ToDictionary(
            row => row.Id,
            row => new Dictionary<string, int> { ["Title"] = row.Version, ["Quantity"] = row.Version });
        var outcomes = new List<string>();

        foreach (var update in updates)
        {
            if (!current.TryGetValue(update.Id, out var row))
            {
                outcomes.Add($"{update.Id}: not found");
                continue;
            }
            if (update.ExpectedVersion > row.Version)
            {
                outcomes.Add($"{update.Id}: invalid version {update.ExpectedVersion}");
                continue;
            }

            var touched = new List<string>();
            if (update.Title is not null) touched.Add("Title");
            if (update.Quantity is not null) touched.Add("Quantity");
            if (touched.Count == 0)
            {
                outcomes.Add($"{update.Id}: no changes");
                continue;
            }

            var history = changedAt[update.Id];
            var conflicts = touched.Where(field => history[field] > update.ExpectedVersion).ToList();
            if (conflicts.Count > 0)
            {
                outcomes.Add($"{update.Id}: conflict on {string.Join(", ", conflicts)}");
                continue;
            }

            var next = row with
            {
                Version = row.Version + 1,
                Title = update.Title ?? row.Title,
                Quantity = update.Quantity ?? row.Quantity,
            };
            foreach (var field in touched) history[field] = next.Version;
            current[update.Id] = next;
            outcomes.Add($"{update.Id}: applied v{next.Version}");
        }

        return new MergeResult(outcomes, rows.Select(row => current[row.Id]).ToList());
    }
}
