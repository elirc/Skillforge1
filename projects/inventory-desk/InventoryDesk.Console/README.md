Start here before the web project. This console lab uses only the .NET base class library.

```
dotnet run --project InventoryDesk.Console -- InventoryDesk.Console/sample.csv
```

1. Type `list`, then `adjust PEN -1`, then `list`. The count changes from 5 to 4. Try reserving more stock than exists and confirm the count stays 4. Changes are intentionally in memory until the program exits.
2. Read `InventoryBook.cs`. Extend the command interface with a `find SKU` command. Acceptance: unknown SKUs have a useful message; lookup is case insensitive; reading never changes state.
3. Trace the CSV importer before extending it. Quoted commas, escaped quotes, and embedded newlines are supported. The exact header is `sku,name,quantity`; duplicate SKUs and invalid quantities reject the entire import.
4. Add a `category` column. Update the record, parser contract, fixtures, and regression tests together. Acceptance: old malformed rows leave the current inventory unchanged; an empty category has a stated policy.
5. Run `dotnet test InventoryDesk.Tests --filter ConsoleTests`. Add a regression for integer overflow and one for a trailing empty CSV field.

Review rubric: separate parsing from stock rules and terminal I/O; validate before mutation; keep errors specific; explain why splitting CSV at every comma fails for the sample name. Reflection: which in-memory guarantees stop being sufficient when two HTTP requests update persistent stock concurrently?
