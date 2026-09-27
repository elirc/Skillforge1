# Inventory Desk: twelve checkpoints

Use an isolated working copy. Keep the reference implementation available for comparison. Run commands from projects/inventory-desk (or the downloaded inventory-desk directory).

## 01. Test the product and stock rules

**Specification:** Keep inventory arithmetic independent of HTTP and persistence.

**Read:** InventoryDesk.Api/Domain.cs; InventoryDesk.Tests/DeskTests.cs

```sh
dotnet test InventoryDesk.Tests --filter Milestone=01
```

**Acceptance:** Zero stock is valid, removing more than available is rejected, and adding to int.MaxValue is rejected without integer wraparound.

**Your variation:** Add a maximum per-order reservation rule. Cover the exact maximum and one above it before changing StockRules.

**Review rubric:** The calculation is pure, boundaries are named in tests, and invalid actions preserve the original stock.

**Reflection:** Which rules can be tested without starting an HTTP server?

## 02. Design and query the relational schema

**Specification:** Represent ownership, unique SKUs, current stock, immutable audit events and retry receipts in real SQLite tables.

**Read:** InventoryDesk.Api/DeskDb.cs

```sh
dotnet test InventoryDesk.Tests --filter Milestone=02
```

**Acceptance:** The initial migration creates the schema on a fresh database; unique SKU enforcement is scoped by owner; negative stock is rejected by a database constraint.

**Your variation:** Write a SQL report of net stock adjustments by product using the audit table. Include products that have not been adjusted.

**Review rubric:** Primary/foreign keys and money units are explicit; the report does not lose products with no audit rows.

**Reflection:** Why keep an audit entry after a product is deleted?

## 03. Expose persistent product CRUD

**Specification:** Make the API create, read, edit and delete actual rows with a clear resource contract.

**Read:** InventoryDesk.Api/Program.cs; InventoryDesk.Api/Domain.cs

```sh
dotnet test InventoryDesk.Tests --filter Milestone=03
```

**Acceptance:** POST returns 201 and a Location header, GET reads the created values, PUT increments version, DELETE returns 204, and a later GET returns 404.

**Your variation:** Add a product description field through an additive migration and a DTO update. Verify old rows receive a safe default.

**Review rubric:** HTTP verbs and status codes match the operation; ownership is not accepted from a request body; DTOs avoid exposing internal password or owner data.

**Reflection:** Why return a DTO rather than serializing every entity field?

## 04. Validate input and explain failures

**Specification:** Reject invalid changes at the server boundary while preserving all existing data.

**Read:** InventoryDesk.Api/Domain.cs; InventoryDesk.Api/Program.cs

```sh
dotnet test InventoryDesk.Tests --filter Milestone=04
```

**Acceptance:** A request with a blank SKU, blank name, negative price and negative stock returns field-level Problem Details and inserts no product.

**Your variation:** Add a SKU character rule and show its server error beside the SKU field. Keep the user's entered values after rejection.

**Review rubric:** Validation reports actionable field errors, the UI retains input, and malformed requests cannot partially write records.

**Reflection:** Does client-side validation replace server validation?

## 05. Authenticate users and enforce ownership

**Specification:** Give each local account an isolated inventory and protect unsafe requests with CSRF verification.

**Read:** InventoryDesk.Api/Program.cs; InventoryDesk.Tests/DeskTests.cs

```sh
dotnet test InventoryDesk.Tests --filter Milestone=05
```

**Acceptance:** Anonymous access gets 401, a different account cannot read or mutate another owner's product, and an authenticated mutation without the CSRF token is rejected.

**Your variation:** Add a test that Bob cannot see Alice's audit events. Inspect the database to confirm passwords are hashes rather than plaintext.

**Review rubric:** Identity comes from the authenticated cookie, every resource query applies owner scope, and tokens are refreshed after sign-in.

**Reflection:** What does a successful login prove about access to a particular product?

## 06. Build the React CRUD screens

**Specification:** Connect the UI to the API while preserving form input, clear status feedback and keyboard access.

**Read:** ui/main.jsx; InventoryDesk.Api/wwwroot/style.css

```sh
npm run build
npm run test:e2e
```

**Acceptance:** The browser can register, create a product, edit its name, reserve stock, cancel a delete, then confirm deletion. Labels and status messages are accessible by role.

**Your variation:** Add a product detail panel that shows the selected product's current version and recent audit actions.

**Review rubric:** Loading, empty and failure states are visible; controlled inputs keep one source of truth; mutation buttons prevent overlap.

**Reflection:** What should happen to an unsaved form after a network failure?

## 07. Keep filters and paging in the URL

**Specification:** Make a filtered inventory view reloadable and shareable within the local app.

**Read:** ui/main.jsx; InventoryDesk.Api/Program.cs

```sh
dotnet test InventoryDesk.Tests --filter Milestone=07
npm run test:e2e
```

**Acceptance:** Filtering updates the total count, page two contains the correct ordered row, ties use id as a stable secondary key, and the UI URL preserves search/sort/page.

**Your variation:** Add a browser test that reloads a filtered URL and sees the same results. Add a secondary sort test with equal prices.

**Review rubric:** Server inputs are bounded, ordering is deterministic, and changing a filter resets an out-of-range page.

**Reflection:** Why must sorting include a tie-breaker?

## 08. Handle concurrent edits and stock changes

**Specification:** Prevent stale edits from overwriting newer work and stop simultaneous last-unit reservations from overselling.

**Read:** InventoryDesk.Api/Program.cs; InventoryDesk.Api/DeskDb.cs

```sh
dotnet test InventoryDesk.Tests --filter Milestone=08
```

**Acceptance:** A stale version returns 409 without overwriting; two concurrent reservations of the last unit produce one success, one conflict, and stock zero.

**Your variation:** Show the latest product next to the user's unsaved edit when a conflict occurs. Require an explicit choice before replacing either version.

**Review rubric:** The version and stock predicates participate in the database write; a preliminary read is not the only safeguard.

**Reflection:** Where must the final stock condition be evaluated?

## 09. Record an audit event and a retry receipt

**Specification:** Make successful stock actions observable and safe to retry after an uncertain network result.

**Read:** InventoryDesk.Api/Program.cs; InventoryDesk.Api/Domain.cs

```sh
dotnet test InventoryDesk.Tests --filter Milestone=09
```

**Acceptance:** Repeating the exact request/key returns the original response without changing stock twice or adding a second audit event; a reused key with different input returns 409.

**Your variation:** Include a request correlation ID in each audit entry and show it in the UI history. Preserve it across an idempotent retry.

**Review rubric:** Stock, receipt, and audit commit together; logs avoid passwords and cookie tokens; retry identity describes one operation.

**Reflection:** When should a retry reuse an idempotency key?

## 10. Prove behavior through integration and browser tests

**Specification:** Choose test boundaries that catch real regressions without depending on a particular implementation shape.

**Read:** InventoryDesk.Tests/DeskTests.cs; browser-tests/inventory.spec.ts

```sh
dotnet test InventoryDesk.Tests
npm run test:e2e
```

**Acceptance:** Tests use separate databases, run without the learner's application data, and fail when ownership, version checks, or the delete cancellation behavior is intentionally broken.

**Your variation:** Introduce one defect in an isolated copy, watch its test fail, restore the fix, and explain which layer caught it.

**Review rubric:** Unit tests cover pure rules, HTTP tests cover persistence/security contracts, and a small browser suite covers critical interaction flows.

**Reflection:** Which test proves cookies and real HTTP routing work together?

## 11. Containerize and check readiness

**Specification:** Run the same built app with a persistent data volume and observable health endpoints.

**Read:** Dockerfile; compose.yaml; InventoryDesk.Api/Program.cs

```sh
docker compose up --build
# In another terminal:
curl http://127.0.0.1:5080/health/ready
```

**Acceptance:** The container serves the UI and API, readiness verifies a database connection, and restarting the service retains products in the named volume.

**Your variation:** Add your own orchestration health probe to /health/ready and verify its failure when the database becomes unavailable in a disposable environment.

**Review rubric:** The final image runs as a nonroot user, runtime data is outside the image, and a successful process start is not confused with readiness.

**Reflection:** What must survive replacing the container image?

## 12. Demonstrate, back up and restore

**Specification:** Produce a portfolio demonstration and prove that a backup can restore the business state.

**Read:** README.md; scripts/database.mjs; CHECKPOINTS.md

```sh
npm run backup
# Stop the server before the restore drill.
npm run restore -- backups/your-backup.db --server-stopped
```

**Acceptance:** Restore a copy into a separate working directory, sign in, and compare products, stock, users and audit history with the source. Keep the original database intact.

**Your variation:** Write a five-minute demo script showing a successful workflow, a validation failure, an edit conflict, an idempotent retry and a restore verification.

**Review rubric:** The README contains setup, test and recovery commands; backup location and retention are documented; the demo explains tradeoffs honestly.

**Reflection:** What proves that a backup is useful?
