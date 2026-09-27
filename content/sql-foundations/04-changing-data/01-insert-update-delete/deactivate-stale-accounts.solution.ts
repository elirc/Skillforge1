interface AccountRow {
  id: number;
  email: string;
  status: string;
  lastLoginAt: string | null;
}

// UPDATE accounts
// SET status = 'inactive'
// WHERE status = 'active' AND last_login_at < @cutoff
export function deactivateStaleAccounts(accounts: AccountRow[], cutoff: string) {
  let rowsAffected = 0;
  const rows = accounts.map((account) => {
    // NULL < @cutoff is UNKNOWN, so accounts that never logged in are untouched.
    const matches = account.status === "active" && account.lastLoginAt !== null && account.lastLoginAt < cutoff;
    if (!matches) return account;
    rowsAffected += 1;
    return { ...account, status: "inactive" };
  });
  return { rowsAffected, rows };
}
