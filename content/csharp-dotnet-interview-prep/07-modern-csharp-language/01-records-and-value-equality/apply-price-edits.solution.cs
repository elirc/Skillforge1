public sealed record Product(string Sku, string Name, decimal Price, string Currency);
public sealed record PriceEdit(string Sku, decimal NewPrice);
public sealed record EditResult(List<Product> Catalog, List<string> ChangedSkus, int DuplicatesRemoved);

public static class Catalog
{
    public static EditResult ApplyEdits(Product[] catalog, PriceEdit[] edits)
    {
        // Distinct() uses the record's compiler-generated value equality.
        var original = catalog.Distinct().ToList();
        var current = original.ToList();

        foreach (var edit in edits)
        {
            for (var i = 0; i < current.Count; i++)
            {
                if (current[i].Sku == edit.Sku)
                {
                    // Non-destructive mutation: a copy with one property changed.
                    current[i] = current[i] with { Price = edit.NewPrice };
                }
            }
        }

        var changed = original
            .Zip(current, (before, after) => (before, after))
            .Where(pair => pair.before != pair.after)
            .Select(pair => pair.before.Sku)
            .Distinct()
            .ToList();

        return new EditResult(current, changed, catalog.Length - original.Count);
    }
}
