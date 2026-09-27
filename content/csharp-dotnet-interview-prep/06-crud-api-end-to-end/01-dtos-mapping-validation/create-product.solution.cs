using System.Text.RegularExpressions;

// What the client may send. There is deliberately no Id, CreatedAt or IsDeleted:
// fields the client must not control are simply not part of the contract.
public sealed record CreateProductRequest(string? Name, string? Sku, decimal Price, string[]? Tags);

// What the client gets back.
public sealed record ProductDto(string Id, string Sku, string Name, decimal Price, List<string> Tags);

public sealed record CreateResult(int Status, Dictionary<string, List<string>> Errors, ProductDto? Product);

public static class CreateProductHandler
{
    public static CreateResult Create(CreateProductRequest request, string[] existingSkus)
    {
        var errors = new Dictionary<string, List<string>>();

        void AddError(string field, string message)
        {
            if (!errors.TryGetValue(field, out var messages))
            {
                messages = new List<string>();
                errors[field] = messages;
            }
            messages.Add(message);
        }

        // Normalize first, then validate the normalized values.
        var name = request.Name?.Trim() ?? "";
        var sku = request.Sku?.Trim().ToUpperInvariant() ?? "";
        var tags = (request.Tags ?? Array.Empty<string>())
            .Select(tag => tag.Trim().ToLowerInvariant())
            .Where(tag => tag.Length > 0)
            .Distinct()
            .ToList();

        if (name.Length == 0) AddError("Name", "Name is required.");
        else if (name.Length > 100) AddError("Name", "Name must be at most 100 characters.");

        if (sku.Length == 0) AddError("Sku", "Sku is required.");
        else if (!Regex.IsMatch(sku, "^[A-Z0-9-]{3,20}$")) AddError("Sku", "Sku must be 3-20 letters, digits or dashes.");

        if (request.Price <= 0) AddError("Price", "Price must be greater than zero.");
        else if (decimal.Round(request.Price, 2) != request.Price) AddError("Price", "Price must have at most two decimal places.");

        if (tags.Count > 5) AddError("Tags", "At most 5 tags are allowed.");

        if (errors.Count > 0)
        {
            return new CreateResult(400, errors, null);
        }

        // Uniqueness needs data, so it is checked after the request is known to be valid.
        if (existingSkus.Any(existing => string.Equals(existing, sku, StringComparison.OrdinalIgnoreCase)))
        {
            var conflict = new Dictionary<string, List<string>> { ["Sku"] = new List<string> { "Sku already exists." } };
            return new CreateResult(409, conflict, null);
        }

        var product = new ProductDto("prd_" + sku.ToLowerInvariant(), sku, name, request.Price, tags);
        return new CreateResult(201, new Dictionary<string, List<string>>(), product);
    }
}
