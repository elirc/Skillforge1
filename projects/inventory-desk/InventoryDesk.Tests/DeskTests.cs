using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using InventoryDesk;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.Configuration;
using Xunit;

public sealed class DeskFactory : WebApplicationFactory<Program>
{
    private readonly string directory = Path.Combine(Path.GetTempPath(), "inventory-desk-test-" + Guid.NewGuid().ToString("N"));
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        Directory.CreateDirectory(directory);
        builder.UseContentRoot(Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "../../../../InventoryDesk.Api")));
        builder.UseEnvironment("Testing");
        builder.ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(new Dictionary<string,string?> { ["Inventory:DatabasePath"] = Path.Combine(directory,"test.db") }));
    }
    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing); SqliteConnection.ClearAllPools();
        if (Directory.Exists(directory) && Path.GetDirectoryName(Path.GetFullPath(directory)) == Path.GetFullPath(Path.GetTempPath()).TrimEnd(Path.DirectorySeparatorChar) && Path.GetFileName(directory).StartsWith("inventory-desk-test-")) Directory.Delete(directory, true);
    }
    public async Task<HttpClient> Learner(string email = "ada@example.test")
    {
        var client = CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });
        await Token(client);
        (await client.PostAsJsonAsync("/api/register", new Credentials(email,"a-long-local-password"))).EnsureSuccessStatusCode();
        (await client.PostAsJsonAsync("/api/login", new Credentials(email,"a-long-local-password"))).EnsureSuccessStatusCode();
        await Token(client);
        return client;
    }
    public static async Task Token(HttpClient client)
    {
        var data = await client.GetFromJsonAsync<JsonElement>("/api/session");
        client.DefaultRequestHeaders.Remove("X-CSRF-TOKEN");
        client.DefaultRequestHeaders.Add("X-CSRF-TOKEN",data.GetProperty("csrfToken").GetString());
    }
}

public sealed class DomainTests
{
    [Theory, Trait("Milestone","01")]
    [InlineData(5,3,true),InlineData(5,-5,true),InlineData(5,-6,false),InlineData(int.MaxValue,1,false)]
    public void Stock_boundaries_are_explicit(int stock,int delta,bool expected) => Assert.Equal(expected,StockRules.CanAdjust(stock,delta));
    [Fact, Trait("Milestone","04")]
    public void Validation_reports_all_invalid_fields() => Assert.Equal(4,StockRules.Validate(" ","",-1,-2).Count);
}
public sealed class HttpTests
{
    private static async Task<ProductView> Create(HttpClient client,string sku="BOOK",int stock=5)
    {
        var response = await client.PostAsJsonAsync("/api/products",new CreateProduct(sku,"Notebook",250,stock));
        Assert.Equal(HttpStatusCode.Created,response.StatusCode);
        return (await response.Content.ReadFromJsonAsync<ProductView>())!;
    }
    [Fact, Trait("Milestone","02"), Trait("Milestone","03")]
    public async Task Crud_persists_and_reads_real_sqlite_rows()
    {
        using var factory = new DeskFactory(); using var client = await factory.Learner();
        var created = await Create(client);
        Assert.Equal(created,await client.GetFromJsonAsync<ProductView>($"/api/products/{created.Id}"));
        var update = await client.PutAsJsonAsync($"/api/products/{created.Id}",new EditProduct("BOOK","Updated notebook",300,created.Version));
        update.EnsureSuccessStatusCode(); var edited = (await update.Content.ReadFromJsonAsync<ProductView>())!;
        Assert.Equal(2,edited.Version); Assert.Equal(300,edited.PriceCents);
        Assert.Equal(HttpStatusCode.NoContent,(await client.DeleteAsync($"/api/products/{created.Id}?version={edited.Version}")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound,(await client.GetAsync($"/api/products/{created.Id}")).StatusCode);
    }
    [Fact, Trait("Milestone","04")]
    public async Task Invalid_input_has_problem_details_and_does_not_create_a_row()
    {
        using var factory = new DeskFactory(); using var client = await factory.Learner();
        var response = await client.PostAsJsonAsync("/api/products",new CreateProduct("","",-1,-1));
        Assert.Equal(HttpStatusCode.BadRequest,response.StatusCode);
        Assert.Equal("application/problem+json",response.Content.Headers.ContentType?.MediaType);
        Assert.True((await response.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("errors").TryGetProperty("stock",out _));
        Assert.Equal(0,(await client.GetFromJsonAsync<JsonElement>("/api/products")).GetProperty("total").GetInt32());
    }
    [Fact, Trait("Milestone","05")]
    public async Task Ownership_and_authentication_protect_every_product()
    {
        using var factory = new DeskFactory(); using var alice = await factory.Learner("alice@example.test"); using var bob = await factory.Learner("bob@example.test"); using var anonymous = factory.CreateClient();
        var product = await Create(alice);
        Assert.Equal(HttpStatusCode.Unauthorized,(await anonymous.GetAsync("/api/products")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound,(await bob.GetAsync($"/api/products/{product.Id}")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound,(await bob.PutAsJsonAsync($"/api/products/{product.Id}",new EditProduct("BOOK","stolen",1,1))).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound,(await bob.DeleteAsync($"/api/products/{product.Id}?version=1")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound,(await bob.PostAsJsonAsync($"/api/products/{product.Id}/adjust",new AdjustStock(-1,1,"attempt"))).StatusCode);
        Assert.Equal(0,(await bob.GetFromJsonAsync<JsonElement>("/api/products")).GetProperty("total").GetInt32());
    }
    [Fact, Trait("Milestone","05")]
    public async Task Mutation_requires_a_valid_antiforgery_token()
    {
        using var factory = new DeskFactory(); using var client = await factory.Learner(); client.DefaultRequestHeaders.Remove("X-CSRF-TOKEN");
        Assert.Equal(HttpStatusCode.BadRequest,(await client.PostAsJsonAsync("/api/products",new CreateProduct("A","A",1,1))).StatusCode);
    }
    [Fact, Trait("Milestone","07")]
    public async Task Paging_filtering_and_ordering_have_a_stable_contract()
    {
        using var factory = new DeskFactory(); using var client = await factory.Learner(); await Create(client,"B"); await Create(client,"A"); await Create(client,"C");
        var result = await client.GetFromJsonAsync<JsonElement>("/api/products?page=2&pageSize=1&sort=sku");
        Assert.Equal(3,result.GetProperty("total").GetInt32()); Assert.Equal("B",result.GetProperty("items")[0].GetProperty("sku").GetString());
        var filtered = await client.GetFromJsonAsync<JsonElement>("/api/products?q=C"); Assert.Equal(1,filtered.GetProperty("total").GetInt32());
    }
    [Fact, Trait("Milestone","08")]
    public async Task Stale_edit_returns_conflict_without_overwriting()
    {
        using var factory = new DeskFactory(); using var client = await factory.Learner(); var product = await Create(client);
        (await client.PutAsJsonAsync($"/api/products/{product.Id}",new EditProduct("BOOK","first writer",300,1))).EnsureSuccessStatusCode();
        Assert.Equal(HttpStatusCode.Conflict,(await client.PutAsJsonAsync($"/api/products/{product.Id}",new EditProduct("BOOK","lost update",400,1))).StatusCode);
        Assert.Equal("first writer",(await client.GetFromJsonAsync<ProductView>($"/api/products/{product.Id}"))!.Name);
    }
    [Fact, Trait("Milestone","08"), Trait("Milestone","09"), Trait("Milestone","10")]
    public async Task Concurrent_last_unit_reservations_cannot_oversell()
    {
        using var factory = new DeskFactory(); using var client = await factory.Learner(); var product = await Create(client,stock:1);
        var results = await Task.WhenAll(client.PostAsJsonAsync($"/api/products/{product.Id}/adjust",new AdjustStock(-1,1,"first")),client.PostAsJsonAsync($"/api/products/{product.Id}/adjust",new AdjustStock(-1,1,"second")));
        Assert.Single(results,response=>response.IsSuccessStatusCode); Assert.Single(results,response=>response.StatusCode==HttpStatusCode.Conflict);
        Assert.Equal(0,(await client.GetFromJsonAsync<ProductView>($"/api/products/{product.Id}"))!.Stock);
        var audit = await client.GetFromJsonAsync<AuditEntry[]>("/api/audit"); Assert.Single(audit!,entry=>entry.Action=="stock-adjusted");
    }
    [Fact, Trait("Milestone","08"), Trait("Milestone","09")]
    public async Task Retrying_the_same_request_returns_its_receipt_without_a_second_change()
    {
        using var factory = new DeskFactory(); using var client = await factory.Learner(); var product = await Create(client);
        var request = new AdjustStock(-2,1,"same-operation");
        var first = await client.PostAsJsonAsync($"/api/products/{product.Id}/adjust",request); first.EnsureSuccessStatusCode();
        var retry = await client.PostAsJsonAsync($"/api/products/{product.Id}/adjust",request); retry.EnsureSuccessStatusCode();
        Assert.Equal(await first.Content.ReadAsStringAsync(),await retry.Content.ReadAsStringAsync());
        Assert.Equal(3,(await client.GetFromJsonAsync<ProductView>($"/api/products/{product.Id}"))!.Stock);
        Assert.Equal(HttpStatusCode.Conflict,(await client.PostAsJsonAsync($"/api/products/{product.Id}/adjust",request with { Delta=-1 })).StatusCode);
        Assert.Single((await client.GetFromJsonAsync<AuditEntry[]>("/api/audit"))!,entry=>entry.Action=="stock-adjusted");
    }
    [Fact, Trait("Milestone","11")]
    public async Task Health_distinguishes_liveness_and_readiness()
    {
        using var factory = new DeskFactory(); using var client = factory.CreateClient();
        Assert.Equal(HttpStatusCode.OK,(await client.GetAsync("/health/live")).StatusCode);
        Assert.Equal(HttpStatusCode.OK,(await client.GetAsync("/health/ready")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound,(await client.GetAsync("/api/not-a-route")).StatusCode);
    }
}
