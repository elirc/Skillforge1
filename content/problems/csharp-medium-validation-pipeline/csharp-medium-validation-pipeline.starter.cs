public sealed record CreateCustomer(string? Name, string? Email, int? Age, string? Country, string? PostalCode);

public static class CustomerValidator
{
    // Return field -> messages. Stop at the first failing rule per field, and only
    // check PostalCode when Country is supported.
    public static Dictionary<string, List<string>> Validate(CreateCustomer request)
    {
        throw new NotImplementedException();
    }
}
