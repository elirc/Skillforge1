using InventoryDesk.ConsoleLab;
var book = new InventoryBook();
if (args.Length != 1) { System.Console.Error.WriteLine("Usage: dotnet run --project InventoryDesk.Console -- <inventory.csv>"); return 1; }
try
{
    var result = book.Import(await File.ReadAllTextAsync(args[0]));
    if (!result.Applied) { foreach (var error in result.Errors) System.Console.Error.WriteLine(error); return 1; }
    System.Console.WriteLine("Commands: list | adjust SKU DELTA | quit. Changes are in memory for this session.");
    while (true)
    {
        System.Console.Write("> "); var line = System.Console.ReadLine(); if (line is null || line.Trim() == "quit") break;
        var words = line.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (words is ["list"]) foreach (var item in book.Items) System.Console.WriteLine($"{item.Sku}\t{item.Name}\t{item.Quantity}");
        else if (words is ["adjust", var sku, var amount] && int.TryParse(amount, out var delta)) System.Console.WriteLine(book.Adjust(sku, delta) ? "Adjusted." : "Rejected: unknown SKU or invalid resulting quantity.");
        else System.Console.WriteLine("Use list, adjust SKU DELTA, or quit.");
    }
    return 0;
}
catch (IOException error) { System.Console.Error.WriteLine(error.Message); return 1; }
