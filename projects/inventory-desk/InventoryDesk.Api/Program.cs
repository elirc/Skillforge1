using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using InventoryDesk;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

var builder = WebApplication.CreateBuilder(args);
if (string.IsNullOrEmpty(builder.Configuration["urls"])) builder.WebHost.UseUrls("http://127.0.0.1:5080");
builder.Services.AddDbContext<DeskDb>((services, options) =>
{
    var configuration = services.GetRequiredService<IConfiguration>();
    var environment = services.GetRequiredService<IHostEnvironment>();
    var databasePath = Path.GetFullPath(configuration["Inventory:DatabasePath"] ?? Path.Combine(environment.ContentRootPath, "data", "inventory.db"));
    Directory.CreateDirectory(Path.GetDirectoryName(databasePath)!);
    options.UseSqlite(new SqliteConnectionStringBuilder { DataSource = databasePath, ForeignKeys = true, DefaultTimeout = 30 }.ToString()).ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning));
});
builder.Services.AddSingleton<IPasswordHasher<DeskUser>, PasswordHasher<DeskUser>>();
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme).AddCookie(options =>
{
    options.Cookie.Name = "InventoryDesk.Session";
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Strict;
    options.ExpireTimeSpan = TimeSpan.FromHours(4);
    options.Events.OnRedirectToLogin = context => { context.Response.StatusCode = 401; return Task.CompletedTask; };
    options.Events.OnRedirectToAccessDenied = context => { context.Response.StatusCode = 403; return Task.CompletedTask; };
});
builder.Services.AddAuthorization();
builder.Services.AddAntiforgery(options => options.HeaderName = "X-CSRF-TOKEN");
builder.Services.AddProblemDetails(options => options.CustomizeProblemDetails = context => context.ProblemDetails.Extensions["traceId"] = context.HttpContext.TraceIdentifier);
var app = builder.Build();
using (var scope = app.Services.CreateScope()) await scope.ServiceProvider.GetRequiredService<DeskDb>().Database.MigrateAsync();
app.UseExceptionHandler();
app.UseStatusCodePages();
app.UseAuthentication();
app.UseAuthorization();
app.Use(async (context, next) =>
{
    if (context.Request.Path.StartsWithSegments("/api") && !HttpMethods.IsGet(context.Request.Method) && !HttpMethods.IsHead(context.Request.Method))
    {
        try { await context.RequestServices.GetRequiredService<IAntiforgery>().ValidateRequestAsync(context); }
        catch (AntiforgeryValidationException) { await Results.Problem(statusCode: 400, title: "Refresh the page and retry", detail: "The request verification token is missing or expired.").ExecuteAsync(context); return; }
    }
    try { await next(context); }
    catch (DbUpdateConcurrencyException) { await Results.Problem(statusCode: 409, title: "This record changed", detail: "Reload the latest version before saving.").ExecuteAsync(context); }
    catch (DbUpdateException error) when (error.InnerException is SqliteException { SqliteErrorCode: 19 }) { await Results.Problem(statusCode: 409, title: "A database constraint rejected the change", detail: "Check for a duplicate SKU or email.").ExecuteAsync(context); }
});
app.UseDefaultFiles();
app.UseStaticFiles();
app.MapGet("/health/live", () => Results.Ok(new { status = "alive" }));
app.MapGet("/health/ready", async (DeskDb db, CancellationToken cancellation) =>
{
    try { return await db.Database.CanConnectAsync(cancellation) ? Results.Ok(new { status = "ready" }) : Results.StatusCode(503); }
    catch (SqliteException) { return Results.StatusCode(503); }
});
app.MapGet("/api/session", (HttpContext context, IAntiforgery antiforgery) => Results.Ok(new { email = context.User.Identity?.IsAuthenticated == true ? context.User.FindFirstValue(ClaimTypes.Email) : null, csrfToken = antiforgery.GetAndStoreTokens(context).RequestToken }));
app.MapPost("/api/register", async (Credentials input, DeskDb db, IPasswordHasher<DeskUser> hasher, CancellationToken cancellation) =>
{
    var email = input.Email?.Trim().ToLowerInvariant() ?? "";
    if (!email.Contains('@') || email.Length > 200 || input.Password is null || input.Password.Length is < 12 or > 200) return Results.ValidationProblem(new Dictionary<string, string[]> { ["credentials"] = ["Use an email address and a password of 12 to 200 characters."] });
    var user = new DeskUser { Email = email };
    user.PasswordHash = hasher.HashPassword(user, input.Password);
    db.Users.Add(user);
    await db.SaveChangesAsync(cancellation);
    return Results.Created("/api/session", new { user.Email });
});
app.MapPost("/api/login", async (Credentials input, DeskDb db, IPasswordHasher<DeskUser> hasher, HttpContext context, CancellationToken cancellation) =>
{
    var email = input.Email?.Trim().ToLowerInvariant() ?? "";
    var user = await db.Users.SingleOrDefaultAsync(user => user.Email == email, cancellation);
    if (user is null || input.Password is null || hasher.VerifyHashedPassword(user, user.PasswordHash, input.Password) == PasswordVerificationResult.Failed) return Results.Problem(statusCode: 401, title: "Email or password is incorrect");
    var identity = new ClaimsIdentity([new Claim(ClaimTypes.NameIdentifier, user.Id), new Claim(ClaimTypes.Email, user.Email)], CookieAuthenticationDefaults.AuthenticationScheme);
    await context.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(identity));
    return Results.Ok(new { user.Email });
});
app.MapPost("/api/logout", async (HttpContext context) => { await context.SignOutAsync(); return Results.NoContent(); }).RequireAuthorization();
var products = app.MapGroup("/api/products").RequireAuthorization();
products.MapGet("", async (HttpContext context, DeskDb db, string? q, string? sort, int? page, int? pageSize, CancellationToken cancellation) =>
{
    var owner = context.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
    var index = Math.Clamp(page ?? 1, 1, 100_000);
    var size = Math.Clamp(pageSize ?? 10, 1, 100);
    var query = db.Products.AsNoTracking().Where(product => product.OwnerId == owner);
    if (!string.IsNullOrWhiteSpace(q)) { var search = q.Trim(); query = query.Where(product => product.Name.Contains(search) || product.Sku.Contains(search)); }
    query = sort switch { "price" => query.OrderBy(product => product.PriceCents).ThenBy(product => product.Id), "stock" => query.OrderBy(product => product.Stock).ThenBy(product => product.Id), _ => query.OrderBy(product => product.Sku).ThenBy(product => product.Id) };
    var total = await query.CountAsync(cancellation);
    var items = await query.Skip((index - 1) * size).Take(size).Select(product => new ProductView(product.Id, product.Sku, product.Name, product.PriceCents, product.Stock, product.Version)).ToListAsync(cancellation);
    return Results.Ok(new { items, total, page = index, pageSize = size });
});
products.MapGet("/{id:int}", async (int id, HttpContext context, DeskDb db, CancellationToken cancellation) =>
{
    var owner = context.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
    var product = await db.Products.AsNoTracking().SingleOrDefaultAsync(product => product.Id == id && product.OwnerId == owner, cancellation);
    return product is null ? Results.NotFound() : Results.Ok(ProductView.From(product));
});
products.MapPost("", async (CreateProduct input, HttpContext context, DeskDb db, CancellationToken cancellation) =>
{
    var errors = StockRules.Validate(input.Sku, input.Name, input.PriceCents, input.Stock);
    if (errors.Count > 0) return Results.ValidationProblem(errors);
    var owner = context.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
    var product = new Product { OwnerId = owner, Sku = input.Sku.Trim().ToUpperInvariant(), Name = input.Name.Trim(), PriceCents = input.PriceCents, Stock = input.Stock };
    await using var transaction = await db.Database.BeginTransactionAsync(cancellation);
    db.Products.Add(product); await db.SaveChangesAsync(cancellation);
    db.Audit.Add(new AuditEntry { OwnerId = owner, ProductId = product.Id, Action = "created" });
    await db.SaveChangesAsync(cancellation); await transaction.CommitAsync(cancellation);
    return Results.Created($"/api/products/{product.Id}", ProductView.From(product));
});
products.MapPut("/{id:int}", async (int id, EditProduct input, HttpContext context, DeskDb db, CancellationToken cancellation) =>
{
    var errors = StockRules.Validate(input.Sku, input.Name, input.PriceCents);
    if (errors.Count > 0) return Results.ValidationProblem(errors);
    var owner = context.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
    var product = await db.Products.SingleOrDefaultAsync(product => product.Id == id && product.OwnerId == owner, cancellation);
    if (product is null) return Results.NotFound();
    if (product.Version != input.Version) return Results.Problem(statusCode: 409, title: "This record changed", detail: "Reload the latest version before saving.");
    product.Name = input.Name.Trim(); product.Sku = input.Sku.Trim().ToUpperInvariant(); product.PriceCents = input.PriceCents; product.Version++;
    db.Audit.Add(new AuditEntry { OwnerId = owner, ProductId = id, Action = "edited" });
    await db.SaveChangesAsync(cancellation);
    return Results.Ok(ProductView.From(product));
});
products.MapPost("/{id:int}/adjust", async (int id, AdjustStock input, HttpContext context, DeskDb db, ILogger<Program> logger, CancellationToken cancellation) =>
{
    if (input.Delta == 0 || string.IsNullOrWhiteSpace(input.IdempotencyKey) || input.IdempotencyKey.Length > 100) return Results.ValidationProblem(new Dictionary<string, string[]> { ["adjustment"] = ["Use a nonzero delta and an idempotency key of at most 100 characters."] });
    var owner = context.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
    var fingerprint = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes($"{id}:{input.Delta}:{input.Version}")));
    await using var transaction = await db.Database.BeginTransactionAsync(cancellation);
    var receipt = await db.Receipts.FindAsync([owner, input.IdempotencyKey], cancellation);
    if (receipt is not null) return receipt.Fingerprint == fingerprint ? Results.Content(receipt.ResponseJson, "application/json") : Results.Problem(statusCode: 409, title: "Idempotency key was already used for a different request");
    var product = await db.Products.AsNoTracking().SingleOrDefaultAsync(product => product.Id == id && product.OwnerId == owner, cancellation);
    if (product is null) return Results.NotFound();
    if (!StockRules.CanAdjust(product.Stock, input.Delta)) return Results.Problem(statusCode: 409, title: "Stock adjustment is outside the allowed range");
    var changed = await db.Products.Where(product => product.Id == id && product.OwnerId == owner && product.Version == input.Version && (long)product.Stock + input.Delta >= 0 && (long)product.Stock + input.Delta <= int.MaxValue).ExecuteUpdateAsync(update => update.SetProperty(product => product.Stock, product => product.Stock + input.Delta).SetProperty(product => product.Version, product => product.Version + 1), cancellation);
    if (changed == 0) return Results.Problem(statusCode: 409, title: "This record changed", detail: "Reload before adjusting stock.");
    var updated = await db.Products.AsNoTracking().SingleAsync(product => product.Id == id, cancellation);
    var json = JsonSerializer.Serialize(ProductView.From(updated), new JsonSerializerOptions(JsonSerializerDefaults.Web));
    db.Audit.Add(new AuditEntry { OwnerId = owner, ProductId = id, Action = "stock-adjusted", Delta = input.Delta });
    db.Receipts.Add(new IdempotencyReceipt { OwnerId = owner, Key = input.IdempotencyKey, Fingerprint = fingerprint, ResponseJson = json });
    await db.SaveChangesAsync(cancellation); await transaction.CommitAsync(cancellation);
    logger.LogInformation("Stock adjusted for product {ProductId} by {Delta}; trace {TraceId}", id, input.Delta, context.TraceIdentifier);
    return Results.Content(json, "application/json");
});
products.MapDelete("/{id:int}", async (int id, int version, HttpContext context, DeskDb db, CancellationToken cancellation) =>
{
    var owner = context.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
    var product = await db.Products.SingleOrDefaultAsync(product => product.Id == id && product.OwnerId == owner, cancellation);
    if (product is null) return Results.NotFound();
    if (product.Version != version) return Results.Problem(statusCode: 409, title: "This record changed");
    db.Products.Remove(product); db.Audit.Add(new AuditEntry { OwnerId = owner, ProductId = id, Action = "deleted" });
    await db.SaveChangesAsync(cancellation); return Results.NoContent();
});
app.MapGet("/api/audit", async (HttpContext context, DeskDb db, CancellationToken cancellation) =>
{
    var owner = context.User.FindFirstValue(ClaimTypes.NameIdentifier)!;
    return Results.Ok(await db.Audit.AsNoTracking().Where(entry => entry.OwnerId == owner).OrderByDescending(entry => entry.Id).Take(100).ToListAsync(cancellation));
}).RequireAuthorization();
app.MapFallback("/api/{**path}", () => Results.Problem(statusCode: 404, title: "API route not found"));
app.MapFallbackToFile("index.html");
app.Run();
public partial class Program { }
