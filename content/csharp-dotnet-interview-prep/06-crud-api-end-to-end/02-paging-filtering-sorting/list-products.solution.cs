public sealed record Product(string Id, string Name, string Category, decimal Price, DateTime CreatedAt);
public sealed record ListQuery(string? Search, string? Category, string? Sort, int? Page, int? PageSize);
public sealed record PagedResult(List<string> Ids, int Page, int PageSize, int TotalCount, int TotalPages);

public static class ProductList
{
    public static PagedResult List(Product[] products, ListQuery query)
    {
        var page = Math.Max(1, query.Page ?? 1);
        var pageSize = Math.Clamp(query.PageSize ?? 20, 1, 100);

        // Filter.
        IEnumerable<Product> rows = products;
        var search = query.Search?.Trim();
        if (!string.IsNullOrEmpty(search))
        {
            rows = rows.Where(product => product.Name.Contains(search, StringComparison.OrdinalIgnoreCase));
        }

        var category = query.Category?.Trim();
        if (!string.IsNullOrEmpty(category))
        {
            rows = rows.Where(product => string.Equals(product.Category, category, StringComparison.OrdinalIgnoreCase));
        }

        // Sort, from an allowlist only.
        var sort = (query.Sort ?? "").Trim().ToLowerInvariant();
        var descending = sort.StartsWith('-');
        var field = descending ? sort[1..] : sort;

        IOrderedEnumerable<Product> ordered = field switch
        {
            "price" => descending ? rows.OrderByDescending(p => p.Price) : rows.OrderBy(p => p.Price),
            "created" => descending ? rows.OrderByDescending(p => p.CreatedAt) : rows.OrderBy(p => p.CreatedAt),
            "name" when descending => rows.OrderByDescending(p => p.Name, StringComparer.OrdinalIgnoreCase),
            _ => rows.OrderBy(p => p.Name, StringComparer.OrdinalIgnoreCase),
        };

        // A unique tie-breaker makes the order, and therefore every page, deterministic.
        var filtered = ordered.ThenBy(p => p.Id, StringComparer.Ordinal).ToList();

        var totalCount = filtered.Count;
        var totalPages = (totalCount + pageSize - 1) / pageSize;
        var skip = (long)(page - 1) * pageSize;
        var ids = skip >= totalCount
            ? new List<string>()
            : filtered.Skip((int)skip).Take(pageSize).Select(p => p.Id).ToList();

        return new PagedResult(ids, page, pageSize, totalCount, totalPages);
    }
}
