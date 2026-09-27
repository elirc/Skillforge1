#nullable enable

public sealed record Address(string City, string? Region);
public sealed record Contact(string Name, string? Email, string? Phone, Address? Address);

public static class Contacts
{
    public static List<string> Labels(Contact[] contacts)
    {
        var labels = new List<string>();
        foreach (var contact in contacts)
        {
            // Annotations are compile-time only; validate at the boundary.
            string? name = contact.Name;
            if (string.IsNullOrWhiteSpace(name))
            {
                continue;
            }

            var channel = !string.IsNullOrWhiteSpace(contact.Email)
                ? $"<{contact.Email.Trim().ToLowerInvariant()}>"
                : !string.IsNullOrWhiteSpace(contact.Phone)
                    ? $"<{contact.Phone.Trim()}>"
                    : "<no contact>";

            var location = contact.Address switch
            {
                null => "unknown location",
                { Region: { } region } when !string.IsNullOrWhiteSpace(region) => $"{contact.Address.City}, {region}",
                _ => contact.Address.City,
            };

            labels.Add($"{name.Trim()} {channel} - {location}");
        }

        return labels;
    }
}
