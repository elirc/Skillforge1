#nullable enable

public interface IEntity
{
    string Id { get; }
}

public sealed record Product(string Id, string Name, decimal Price) : IEntity;
public sealed record Supplier(string Id, string Name, int Rating) : IEntity;
public sealed record Report(List<string> ProductIds, List<string> SupplierIds, string? Cheapest, string? TopRated);

public sealed class Repository<T> where T : class, IEntity
{
    private readonly Dictionary<string, T> _items = new(StringComparer.Ordinal);

    public void Upsert(T item) => _items[item.Id] = item;

    public List<T> All() => _items.Values.OrderBy(item => item.Id, StringComparer.Ordinal).ToList();
}

public static class Inventory
{
    private static TItem? MinBy<TItem, TKey>(IEnumerable<TItem> items, Func<TItem, TKey> key)
        where TItem : class
        where TKey : IComparable<TKey>
    {
        TItem? best = null;
        TKey? bestKey = default;
        foreach (var item in items)
        {
            var candidate = key(item);
            // Strictly less than: an equal key keeps the earlier item.
            if (best is null || candidate.CompareTo(bestKey!) < 0)
            {
                best = item;
                bestKey = candidate;
            }
        }

        return best;
    }

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
