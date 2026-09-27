/* A fresh in-memory SQLite database per test; the parent terminates this worker on timeout. */
/* global importScripts, initSqlJs */
importScripts("/runtimes/sql-wasm.js");
self.onmessage = async ({ data: request }) => {
  try {
    const SQL = await initSqlJs({ locateFile: name => `/runtimes/${name}` });
    const results = request.tests.map(test => {
      const db = new SQL.Database();
      try {
        const fixture = test.args[0] || {};
        db.run(fixture.setup || "");
        const output = db.exec(request.code, fixture.params);
        const final = fixture.verify ? db.exec(fixture.verify) : output;
        const table = final[final.length - 1];
        const actual = table ? table.values.map(row => Object.fromEntries(table.columns.map((column, i) => [column, row[i]]))) : [];
        const stable = value => JSON.stringify(value, (_key, entry) => entry && typeof entry === "object" && !Array.isArray(entry) ? Object.fromEntries(Object.entries(entry).sort(([a], [b]) => a.localeCompare(b))) : entry);
        return { name: test.name, hidden: test.hidden, expected: test.expected, actual, passed: stable(actual) === stable(test.expected), error: null };
      } catch (error) { return { name: test.name, hidden: test.hidden, expected: test.expected, actual: null, passed: false, error: String(error.message || error) }; }
      finally { db.close(); }
    });
    self.postMessage({ response: { results, passed: results.every(result => result.passed) } });
  } catch (error) { self.postMessage({ error: String(error.message || error) }); }
};
