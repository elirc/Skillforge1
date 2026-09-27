using InventoryDesk.ConsoleLab;
using Xunit;
namespace InventoryDesk.Tests;
public sealed class ConsoleTests
{
    [Fact] public void QuotedCsvSupportsCommasQuotesAndNewlines()
    {
        var rows = Csv.Read("sku,name,quantity\r\nA,\"Blue, \"\"fine\"\"\npen\",2\r\n");
        Assert.Equal(2, rows.Count); Assert.Equal("Blue, \"fine\"\npen", rows[1][1]);
    }
    [Fact] public void ImportErrorsLeavePreviousInventoryIntact()
    {
        var book = new InventoryBook(); Assert.True(book.Import("sku,name,quantity\nA,Pen,2").Applied);
        var result = book.Import("sku,name,quantity\nB,Pad,3\nB,Duplicate,4\nC,Invalid,-1");
        Assert.False(result.Applied); Assert.Equal(2, result.Errors.Length); Assert.Equal("A", Assert.Single(book.Items).Sku);
    }
    [Fact] public void StockAdjustmentPreservesQuantityOnRejection()
    {
        var book = new InventoryBook(); book.Import("sku,name,quantity\nA,Pen,2");
        Assert.False(book.Adjust("A", -3)); Assert.Equal(2, book.Items[0].Quantity); Assert.True(book.Adjust("a", -2)); Assert.Equal(0, book.Items[0].Quantity);
        Assert.False(book.Adjust("missing", 1));
    }
    [Theory]
    [InlineData("\"unterminated")]
    [InlineData("a,\"closed\"junk,b")]
    [InlineData("a,un\"quoted,b")]
    public void MalformedCsvIsRejected(string csv) => Assert.Throws<FormatException>(() => Csv.Read(csv));
    [Fact] public void OverflowCannotWrapStockAndTrailingEmptyFieldsArePreserved()
    {
        var book = new InventoryBook(); Assert.True(book.Import("sku,name,quantity\nA,Pen,2147483647").Applied);
        Assert.False(book.Adjust("A", 1)); Assert.Equal(int.MaxValue, book.Items[0].Quantity);
        Assert.False(book.Import("sku,name,quantity\nB,Pad,2147483648").Applied);
        Assert.Equal(new[] { "A", "Pen", "" }, Assert.Single(Csv.Read("A,Pen,")));
    }
}
