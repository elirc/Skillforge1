#nullable enable

public sealed record Address(string City, string? Region);
public sealed record Contact(string Name, string? Email, string? Phone, Address? Address);

public static class Contacts
{
    // Build one display label per contact: "<name> <channel> - <location>".
    //
    // - Name is declared non-nullable, but this data came from JSON, and the
    //   deserializer does not enforce annotations. Skip any contact whose Name is
    //   null or whitespace. Otherwise use the trimmed name.
    // - channel: "<email>" (trimmed and lower-cased) when Email has text,
    //   otherwise "<phone>" (trimmed) when Phone has text, otherwise "<no contact>".
    // - location: "City, Region" when Region has text, "City" when it does not,
    //   and "unknown location" when Address is null.
    //
    // Example: "Ada Lovelace <ada@example.com> - London, England"
    public static List<string> Labels(Contact[] contacts)
    {
        var labels = new List<string>();
        foreach (var contact in contacts)
        {
            // This compiles with only warnings, then throws at run time on a null Address.
            labels.Add($"{contact.Name} <{contact.Email}> - {contact.Address!.City}");
        }

        return labels;
    }
}
