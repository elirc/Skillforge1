using System.Text.RegularExpressions;

// What the client may send. There is deliberately no Id, CreatedAt or IsDeleted:
// fields the client must not control are simply not part of the contract.
public sealed record CreateProductRequest(string? Name, string? Sku, decimal Price, string[]? Tags);

// What the client gets back.
public sealed record ProductDto(string Id, string Sku, string Name, decimal Price, List<string> Tags);

public sealed record CreateResult(int Status, Dictionary<string, List<string>> Errors, ProductDto? Product);

public static class CreateProductHandler
{
    // Implement POST /products: normalize, validate, check for conflicts, map to a DTO.
    //
    // Normalize:
    //   Name  - trim.     Sku - trim, then upper-case (invariant).
    //   Tags  - trim + lower-case each, drop empty ones, remove duplicates (keep first
    //           occurrence order). A null Tags array means no tags.
    //
    // Validate the normalized values. Errors is keyed by field name, like
    // ValidationProblemDetails, and a field may collect several messages:
    //   Name  - "Name is required."  or  "Name must be at most 100 characters."
    //   Sku   - "Sku is required."   or  "Sku must be 3-20 letters, digits or dashes."
    //           (pattern ^[A-Z0-9-]{3,20}$)
    //   Price - "Price must be greater than zero."  or
    //           "Price must have at most two decimal places."
    //   Tags  - "At most 5 tags are allowed."  (counted after de-duplication)
    //   Any error -> Status 400, Product null.
    //
    // Conflict (only once the request is valid): the Sku already exists in
    // existingSkus (compare ignoring case) -> 409 with Errors { "Sku": ["Sku already exists."] }.
    //
    // Success -> 201, Errors {} (empty), and a ProductDto whose Id is "prd_" + the
    // lower-cased Sku, carrying the normalized Sku, Name and Tags and the Price.
    public static CreateResult Create(CreateProductRequest request, string[] existingSkus)
    {
        return new CreateResult(201, new Dictionary<string, List<string>>(), null);
    }
}
