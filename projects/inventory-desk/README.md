# Inventory Desk

A runnable learning companion for Skillforge: ASP.NET Core 10, EF Core with SQLite, a React UI, HTTP integration tests, and browser tests. Accounts, products, version checks, atomic stock adjustments, idempotency receipts, and audit entries are real persisted behavior.

This is a local learning application. It binds to `127.0.0.1:5080`; the container publishes only to loopback. Create your own account on first launch. There are no seeded passwords, external services, or production credentials.

## Run

New to C#? Start with [the console inventory and CSV importer mini-projects](InventoryDesk.Console/README.md). They run without a browser or database and build toward the web application's rules.

Install the .NET 10 SDK and Node.js 22 or newer. From this directory:

```sh
npm install
npm run build
dotnet run --project InventoryDesk.Api
```

Open `http://127.0.0.1:5080`. Create an account with a password of at least 12 characters, then add a product. A second account has a separate inventory. The default database is `InventoryDesk.Api/data/inventory.db`; the app applies its initial EF migration on startup.

When working inside the Skillforge repository, dependencies can resolve from its root installation: `node projects/inventory-desk/scripts/build-ui.mjs` builds this UI from the repository root.

## Check

```sh
dotnet test InventoryDesk.Tests
npx playwright install chromium
npm run test:e2e
```

The HTTP suite creates a separate SQLite database under the operating system's temporary directory for every test host. It checks actual routing, cookies, CSRF protection, owner isolation, validation, CRUD, version conflicts, concurrent reservations, retries, audit history and health endpoints. Browser tests use another temporary database and exercise account creation, form editing, stock updates, and delete confirmation.

Focused checkpoints use traits, for example `dotnet test InventoryDesk.Tests --filter Milestone=08`. UI milestones use the browser suite. Do not treat a passing quiz in Skillforge as evidence that you ran these project checks.

## API contract

| Route | Behavior |
| --- | --- |
| `GET /api/session` | Current email and CSRF request token |
| `POST /api/register`, `/api/login`, `/api/logout` | Local accounts and HTTP-only cookie session |
| `GET /api/products?q=&sort=sku&page=1&pageSize=10` | Owner-scoped list; `sort` also accepts `price` and `stock` |
| `POST /api/products` | Create `{sku,name,priceCents,stock}` |
| `GET /api/products/{id}` | Owner-scoped detail |
| `PUT /api/products/{id}` | Edit `{sku,name,priceCents,version}`; stale version returns 409 |
| `POST /api/products/{id}/adjust` | Atomic `{delta,version,idempotencyKey}`; stock cannot become negative |
| `DELETE /api/products/{id}?version=N` | Version-checked delete; audit history remains |
| `GET /api/audit` | The account's latest 100 audit events |
| `GET /health/live`, `/health/ready` | Process liveness and database readiness |

Send `X-CSRF-TOKEN` from `/api/session` on every API mutation. Refresh it after signing in because its identity binding changes. Errors use Problem Details; validation failures include field errors. Product IDs belonging to another account return 404 to avoid exposing their existence.

Use a new idempotency key for a new stock action. Reuse the same key and exact body when retrying an uncertain network result. Reusing the key with different input returns 409. Receipts and audit entries commit with the stock change. Edits use an EF concurrency token; stock adjustments include the expected version and stock range in the atomic UPDATE.

## Configuration and operations

`Inventory__DatabasePath` overrides the database location; `ASPNETCORE_URLS` overrides the listening URL. Keep the SQLite directory writable and persistent. Passwords are hashed with ASP.NET Core's password hasher. The UI stores no passwords or authentication tokens in local storage.

```sh
docker compose up --build
```

The named `inventory-data` volume preserves the database. Check `/health/ready` after starting it. Container construction is supplied as a reproducible exercise; verify it with Docker on your machine before publishing an image. No deployment or remote publication is part of this project.

## Back up and restore

```sh
npm run backup
```

This uses SQLite's consistent `VACUUM INTO` operation and writes to `backups/`. For a restore drill, stop the server first, then:

```sh
npm run restore -- backups/your-backup.db --server-stopped
```

Restore validates SQLite integrity and expected tables, saves the previous database, and refuses to proceed while SQLite sidecars remain. Restart and sign in again. For an overridden or container database path, back up that actual database/volume instead of the default host path. A backup is proven only after a restore into a separate environment and checking products, stock, users, and audit records.

## Learning path

Read [the twelve checkpoints](CHECKPOINTS.md) in order. Each checkpoint gives a specification, an observable acceptance criterion, a review rubric, and a reflection question. The repository is the completed reference; create an isolated working copy, make the requested variation, and keep your own regression tests. See the `aspnet-api-project`, `shipping-maintenance`, and `inventory-desk-capstone` tracks inside Skillforge for guided labs.

The initial migration is deliberately handwritten and readable in `DeskDb.cs`. When extending the schema, add a new migration rather than changing the applied migration. For larger projects, adopt EF's generated migration snapshots and design-time tooling. Do not replace migrations with `EnsureDeleted` or `EnsureCreated` against a database that contains work you want to preserve.
