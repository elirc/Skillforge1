using System.Globalization;
using System.Text;
namespace InventoryDesk.ConsoleLab;
public sealed record StockItem(string Sku, string Name, int Quantity);
public sealed record ImportResult(bool Applied, string[] Errors);
public sealed class InventoryBook
{
    private readonly Dictionary<string, StockItem> items = new(StringComparer.OrdinalIgnoreCase);
    public IReadOnlyList<StockItem> Items => items.Values.OrderBy(item => item.Sku, StringComparer.Ordinal).ToArray();
    public bool Adjust(string sku, int delta)
    {
        if (!items.TryGetValue(sku, out var item)) return false;
        var next = (long)item.Quantity + delta;
        if (next is < 0 or > int.MaxValue) return false;
        items[sku] = item with { Quantity = (int)next }; return true;
    }
    // All-or-nothing import: validation finishes before replacing any inventory.
    public ImportResult Import(string csv)
    {
        var staged = new Dictionary<string, StockItem>(StringComparer.OrdinalIgnoreCase);
        var errors = new List<string>();
        IReadOnlyList<string[]> rows;
        try { rows = Csv.Read(csv); } catch (FormatException error) { return new(false, [error.Message]); }
        if (rows.Count == 0 || !rows[0].SequenceEqual(new[] { "sku", "name", "quantity" })) return new(false, ["Header must be sku,name,quantity."]);
        for (var i = 1; i < rows.Count; i++)
        {
            var row = rows[i];
            if (row.Length != 3 || string.IsNullOrWhiteSpace(row[0]) || string.IsNullOrWhiteSpace(row[1]) || !int.TryParse(row[2], NumberStyles.None, CultureInfo.InvariantCulture, out var quantity)) { errors.Add($"Record {i + 1}: expected SKU, name, and a nonnegative integer quantity."); continue; }
            var sku = row[0].Trim().ToUpperInvariant();
            if (!staged.TryAdd(sku, new(sku, row[1].Trim(), quantity))) errors.Add($"Record {i + 1}: duplicate SKU {sku}.");
        }
        if (errors.Count > 0) return new(false, errors.ToArray());
        items.Clear(); foreach (var item in staged) items.Add(item.Key, item.Value);
        return new(true, []);
    }
}
public static class Csv
{
    // Handles commas, escaped quotes and newlines inside quoted fields.
    public static IReadOnlyList<string[]> Read(string text)
    {
        var rows = new List<string[]>(); var fields = new List<string>(); var field = new StringBuilder();
        var quoted = false; var closed = false; var started = false;
        for (var i = 0; i < text.Length; i++)
        {
            var c = text[i];
            if (quoted)
            {
                if (c == '"' && i + 1 < text.Length && text[i + 1] == '"') { field.Append('"'); i++; }
                else if (c == '"') { quoted = false; closed = true; }
                else field.Append(c);
                continue;
            }
            if (c == ',' || c is '\r' or '\n')
            {
                fields.Add(field.ToString()); field.Clear(); closed = false; started = false;
                if (c != ',') { rows.Add(fields.ToArray()); fields.Clear(); if (c == '\r' && i + 1 < text.Length && text[i + 1] == '\n') i++; }
            }
            else if (c == '"' && !started && field.Length == 0) { quoted = true; started = true; }
            else if (closed || c == '"') throw new FormatException("Malformed quoted CSV field.");
            else { field.Append(c); started = true; }
        }
        if (quoted) throw new FormatException("Unclosed quoted CSV field.");
        if (started || closed || field.Length > 0 || fields.Count > 0) { fields.Add(field.ToString()); rows.Add(fields.ToArray()); }
        return rows;
    }
}
