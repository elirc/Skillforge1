public sealed record Product(string Sku, string Name, decimal Price, string Currency);
public sealed record PriceEdit(string Sku, decimal NewPrice);
public sealed record EditResult(List<Product> Catalog, List<string> ChangedSkus, int DuplicatesRemoved);

public static class Catalog
{
    // Apply a batch of price edits to an immutable catalog.
    //
    // 1. Remove rows that are exact duplicates (equal in EVERY property), keeping
    //    the first occurrence. Records already compare by value, so you do not
    //    need a custom comparer. DuplicatesRemoved is how many rows you dropped.
    // 2. Apply the edits in order. An edit targets every row with that Sku; build
    //    the new row with a `with` expression instead of mutating anything.
    //    Unknown SKUs are ignored.
    // 3. ChangedSkus lists, in catalog order and without repeats, the SKUs whose
    //    final row is NOT equal to the row they started as. Setting a price to
    //    its current value, or changing it and then changing it back, is not a
    //    change.
    public static EditResult ApplyEdits(Product[] catalog, PriceEdit[] edits)
    {
        var rows = catalog.ToList();
        foreach (var edit in edits)
        {
            // TODO: replace matching rows using `with`.
        }

        return new EditResult(rows, new List<string>(), 0);
    }
}
