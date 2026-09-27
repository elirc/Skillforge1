from zipfile import ZipFile

with ZipFile("public/downloads/inventory-desk.zip") as archive:
    assert archive.testzip() is None, "ZIP CRC failure"
    names = set(archive.namelist())
    for required in ("README.md", "CHECKPOINTS.md", "InventoryDesk.sln", "InventoryDesk.Console/Program.cs", "InventoryDesk.Api/Program.cs", "scripts/test-browser.mjs"):
        assert f"inventory-desk/{required}" in names, required
    for name in names:
        assert not name.endswith((".db", ".db-wal", ".db-shm")), name
        assert not any(part in {"bin", "obj", "node_modules", "data", "backups"} or part.startswith(".env") for part in name.split("/")), name
    print(f"Verified {len(names)} ZIP entries, CRCs, required source, and data exclusions.")
