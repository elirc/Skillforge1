using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace InventoryDesk;
public sealed class DeskDb(DbContextOptions<DeskDb> options) : DbContext(options)
{
    public DbSet<DeskUser> Users => Set<DeskUser>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<AuditEntry> Audit => Set<AuditEntry>();
    public DbSet<IdempotencyReceipt> Receipts => Set<IdempotencyReceipt>();
    protected override void OnModelCreating(ModelBuilder model)
    {
        model.Entity<DeskUser>().HasIndex(user => user.Email).IsUnique();
        model.Entity<Product>().HasIndex(product => new { product.OwnerId, product.Sku }).IsUnique();
        model.Entity<Product>().Property(product => product.Version).IsConcurrencyToken();
        model.Entity<Product>().HasOne<DeskUser>().WithMany().HasForeignKey(product => product.OwnerId);
        model.Entity<Product>().ToTable(table => { table.HasCheckConstraint("CK_Product_Stock", "Stock >= 0"); table.HasCheckConstraint("CK_Product_Price", "PriceCents >= 0"); });
        model.Entity<AuditEntry>().HasIndex(entry => new { entry.OwnerId, entry.ProductId, entry.Id });
        model.Entity<IdempotencyReceipt>().HasKey(receipt => new { receipt.OwnerId, receipt.Key });
    }
}

// A deliberately readable first migration. Later lessons evolve this schema
// with additive migrations; the application never drops an existing database.
[DbContext(typeof(DeskDb))]
[Migration("202609270001_InitialInventory")]
public sealed class InitialInventory : Migration
{
    protected override void Up(MigrationBuilder migration) => migration.Sql("""
        CREATE TABLE Users (Id TEXT NOT NULL PRIMARY KEY, Email TEXT NOT NULL, PasswordHash TEXT NOT NULL);
        CREATE UNIQUE INDEX IX_Users_Email ON Users(Email);
        CREATE TABLE Products (Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, OwnerId TEXT NOT NULL REFERENCES Users(Id), Sku TEXT NOT NULL, Name TEXT NOT NULL, PriceCents INTEGER NOT NULL CHECK(PriceCents >= 0), Stock INTEGER NOT NULL CHECK(Stock >= 0), Version INTEGER NOT NULL);
        CREATE UNIQUE INDEX IX_Products_OwnerId_Sku ON Products(OwnerId,Sku);
        CREATE TABLE Audit (Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, OwnerId TEXT NOT NULL, ProductId INTEGER NOT NULL, Action TEXT NOT NULL, Delta INTEGER NULL, CreatedAt TEXT NOT NULL);
        CREATE INDEX IX_Audit_OwnerId_ProductId_Id ON Audit(OwnerId,ProductId,Id);
        CREATE TABLE Receipts (OwnerId TEXT NOT NULL, Key TEXT NOT NULL, Fingerprint TEXT NOT NULL, ResponseJson TEXT NOT NULL, PRIMARY KEY(OwnerId,Key));
        """);
    protected override void Down(MigrationBuilder migration) => migration.Sql("DROP TABLE Receipts; DROP TABLE Audit; DROP TABLE Products; DROP TABLE Users;");
}
