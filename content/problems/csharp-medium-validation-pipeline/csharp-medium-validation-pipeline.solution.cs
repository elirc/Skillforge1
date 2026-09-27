public sealed record CreateCustomer(string? Name, string? Email, int? Age, string? Country, string? PostalCode);

public static class CustomerValidator
{
    private static readonly string[] SupportedCountries = { "US", "CA", "GB" };

    public static Dictionary<string, List<string>> Validate(CreateCustomer request)
    {
        var errors = new Dictionary<string, List<string>>();
        void Fail(string field, string message)
        {
            if (!errors.TryGetValue(field, out var list)) errors[field] = list = new List<string>();
            list.Add(message);
        }

        if (string.IsNullOrWhiteSpace(request.Name)) Fail("Name", "Name is required.");
        else if (request.Name.Length > 50) Fail("Name", "Name must be at most 50 characters.");

        if (string.IsNullOrWhiteSpace(request.Email)) Fail("Email", "Email is required.");
        else if (!IsEmail(request.Email)) Fail("Email", "Email is not valid.");

        if (request.Age is null) Fail("Age", "Age is required.");
        else if (request.Age < 18 || request.Age > 120) Fail("Age", "Age must be between 18 and 120.");

        var country = request.Country;
        if (country is null || !SupportedCountries.Contains(country))
        {
            Fail("Country", "Country is not supported.");
        }
        else if (!IsPostalCode(country, request.PostalCode ?? ""))
        {
            Fail("PostalCode", $"PostalCode is not valid for {country}.");
        }

        return errors;
    }

    private static bool IsEmail(string email)
    {
        var at = email.IndexOf('@');
        if (at <= 0 || at != email.LastIndexOf('@') || email.Any(char.IsWhiteSpace)) return false;
        var domain = email[(at + 1)..];
        var dot = domain.IndexOf('.');
        return dot > 0 && !domain.EndsWith('.');
    }

    private static bool IsPostalCode(string country, string code) => country switch
    {
        "US" => code.Length == 5 && code.All(char.IsAsciiDigit),
        "CA" => code.Length == 7
            && char.IsAsciiLetterUpper(code[0]) && char.IsAsciiDigit(code[1]) && char.IsAsciiLetterUpper(code[2])
            && code[3] == ' '
            && char.IsAsciiDigit(code[4]) && char.IsAsciiLetterUpper(code[5]) && char.IsAsciiDigit(code[6]),
        "GB" => !string.IsNullOrWhiteSpace(code),
        _ => false,
    };
}
