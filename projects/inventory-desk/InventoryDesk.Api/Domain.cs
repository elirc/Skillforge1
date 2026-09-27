namespace InventoryDesk;

public sealed class DeskUser
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
}
public sealed class Product
{
    public int Id { get; set; }
    public string OwnerId { get; set; } = "";
    public string Sku { get; set; } = "";
    public string Name { get; set; } = "";
    public int PriceCents { get; set; }
    public int Stock { get; set; }
    public int Version { get; set; } = 1;
}
public sealed class AuditEntry
{
    public long Id { get; set; }
    public string OwnerId { get; set; } = "";
    public int ProductId { get; set; }
    public string Action { get; set; } = "";
    public int? Delta { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
public sealed class IdempotencyReceipt
{
    public string OwnerId { get; set; } = "";
    public string Key { get; set; } = "";
    public string Fingerprint { get; set; } = "";
    public string ResponseJson { get; set; } = "";
}
public sealed record Credentials(string Email, string Password);
public sealed record CreateProduct(string Sku, string Name, int PriceCents, int Stock);
public sealed record EditProduct(string Sku, string Name, int PriceCents, int Version);
public sealed record AdjustStock(int Delta, int Version, string IdempotencyKey);
public sealed record ProductView(int Id, string Sku, string Name, int PriceCents, int Stock, int Version)
{
    public static ProductView From(Product product) => new(product.Id, product.Sku, product.Name, product.PriceCents, product.Stock, product.Version);
}
public static class StockRules
{
    public static bool CanAdjust(int stock, int delta) => (long)stock + delta is >= 0 and <= int.MaxValue;
    public static Dictionary<string, string[]> Validate(string? sku, string? name, int priceCents, int stock = 0)
    {
        var errors = new Dictionary<string, string[]>();
        if (string.IsNullOrWhiteSpace(sku) || sku.Trim().Length > 40) errors["sku"] = ["SKU must contain 1 to 40 characters."];
        if (string.IsNullOrWhiteSpace(name) || name.Trim().Length > 120) errors["name"] = ["Name must contain 1 to 120 characters."];
        if (priceCents < 0) errors["priceCents"] = ["Price must be zero or greater."];
        if (stock < 0) errors["stock"] = ["Stock must be zero or greater."];
        return errors;
    }
}
