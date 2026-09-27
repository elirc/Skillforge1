public sealed record Product(string Id, string Name, string Category, decimal Price, DateTime CreatedAt);
public sealed record ListQuery(string? Search, string? Category, string? Sort, int? Page, int? PageSize);
public sealed record PagedResult(List<string> Ids, int Page, int PageSize, int TotalCount, int TotalPages);

public static class ProductList
{
    // Implement GET /products?search=&category=&sort=&page=&pageSize=
    //
    // 1. Defaults and bounds: Page defaults to 1 and is at least 1. PageSize
    //    defaults to 20 and is clamped to 1..100. Report the values you USED.
    // 2. Filter (trim the inputs; null or blank means "no filter"):
    //      Search   - Name contains it, ignoring case.
    //      Category - Category equals it, ignoring case.
    // 3. Sort from an ALLOWLIST: "name", "price", "created" (CreatedAt), each
    //    optionally prefixed with "-" for descending, matched ignoring case.
    //    Anything else, including null, sorts by name ascending. Compare names
    //    ignoring case. ALWAYS finish with Id ascending (ordinal) as a tie-breaker.
    // 4. TotalCount is the filtered count; TotalPages = ceil(TotalCount / PageSize)
    //    (0 when nothing matches). Ids holds the requested page, empty past the end.
    public static PagedResult List(Product[] products, ListQuery query)
    {
        return new PagedResult(products.Select(p => p.Id).ToList(), 1, 20, products.Length, 1);
    }
}
