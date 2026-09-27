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
  // return { rowsAffected, rows } without mutating the input rows
  return { rowsAffected: 0, rows: accounts };
}
