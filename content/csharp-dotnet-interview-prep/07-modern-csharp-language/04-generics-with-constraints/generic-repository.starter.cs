#nullable enable

public interface IEntity
{
    string Id { get; }
}

public sealed record Product(string Id, string Name, decimal Price) : IEntity;
public sealed record Supplier(string Id, string Name, int Rating) : IEntity;
public sealed record Report(List<string> ProductIds, List<string> SupplierIds, string? Cheapest, string? TopRated);

// One repository type serves every entity. The constraint `T : class, IEntity`
// is what lets the code read item.Id and return null for "not found".
public sealed class Repository<T> where T : class, IEntity
{
    private readonly Dictionary<string, T> _items = new(StringComparer.Ordinal);

    // TODO: insert, or replace the existing item with the same Id (last write wins).
    public void Upsert(T item)
    {
    }

    // TODO: every item, ordered by Id (ordinal).
    public List<T> All() => new List<T>();
}

public static class Inventory
{
    // TODO: return the item with the smallest key, or null when there are none.
    // On a tie keep the EARLIER item. The constraint `TKey : IComparable<TKey>`
    // is what makes key.CompareTo(...) available.
    private static TItem? MinBy<TItem, TKey>(IEnumerable<TItem> items, Func<TItem, TKey> key)
        where TItem : class
        where TKey : IComparable<TKey>
    {
        return null;
    }

    // Load both entity lists into their own Repository<T>, then report:
    //   ProductIds / SupplierIds - the stored Ids, ordered by Id
    //   Cheapest                 - Name of the lowest-priced stored product
    //   TopRated                 - Name of the highest-rated stored supplier
    // Ties go to the lower Id. Either name is null when its repository is empty.
    // (The harness calls one non-generic public method, so the generic work
    // lives in the helpers above.)
    public static Report Build(Product[] products, Supplier[] suppliers)
    {
        var productRepo = new Repository<Product>();
        foreach (var product in products) productRepo.Upsert(product);

        var supplierRepo = new Repository<Supplier>();
        foreach (var supplier in suppliers) supplierRepo.Upsert(supplier);

        var cheapest = MinBy(productRepo.All(), p => p.Price);
        var topRated = MinBy(supplierRepo.All(), s => -s.Rating);

        return new Report(
            productRepo.All().Select(p => p.Id).ToList(),
            supplierRepo.All().Select(s => s.Id).ToList(),
            cheapest?.Name,
            topRated?.Name);
    }
}
