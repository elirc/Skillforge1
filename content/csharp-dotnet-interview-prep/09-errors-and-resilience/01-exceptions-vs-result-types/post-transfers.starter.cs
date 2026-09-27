public sealed record Account(string Id, decimal Balance, bool Frozen);
public sealed record Transfer(string Id, string From, string To, decimal Amount);
public sealed record BatchResult(List<string> Log, List<string> Balances);

// Expected, input-shaped failures travel as values...
public sealed record Result(bool IsSuccess, string? Error)
{
    public static Result Ok() => new(true, null);
    public static Result Fail(string error) => new(false, error);
}

// ...while broken invariants deep in the domain are custom exceptions that
// carry the data a caller needs.
public sealed class InsufficientFundsException : Exception
{
    public InsufficientFundsException(string accountId, decimal balance, decimal requested)
        : base($"Account {accountId} has {balance} but {requested} was requested.")
    {
        AccountId = accountId;
        Balance = balance;
        Requested = requested;
    }

    public string AccountId { get; }
    public decimal Balance { get; }
    public decimal Requested { get; }
}

public sealed class AccountFrozenException : Exception
{
    public AccountFrozenException(string accountId)
        : base($"Account {accountId} is frozen.")
    {
        AccountId = accountId;
    }

    public string AccountId { get; }
}

public static class Ledger
{
    // Process transfers in order and log one line per transfer:
    //
    // 1. Validate first and return a Result - do NOT throw for bad input.
    //    Check in this order and log "<id> rejected: <reason>":
    //      Amount <= 0            -> "amount must be positive"
    //      From == To             -> "cannot transfer to the same account"
    //      unknown From or To     -> "unknown account <accountId>" (check From first)
    // 2. Otherwise call Post (provided). Catch ONLY the two domain exceptions and
    //    use their properties:
    //      InsufficientFundsException -> "<id> failed: insufficient funds in <AccountId> (balance <Balance>, requested <Requested>)"
    //      AccountFrozenException     -> "<id> failed: account <AccountId> is frozen"
    //    Any other exception is a bug and must not be swallowed.
    // 3. On success log "<id> ok".
    // Balances: "<id>=<balance>" for every account, in the order given.
    public static BatchResult Process(Account[] accounts, Transfer[] transfers)
    {
        var balances = accounts.ToDictionary(account => account.Id, account => account);
        var log = new List<string>();

        foreach (var transfer in transfers)
        {
            try
            {
                Post(balances, transfer);
                log.Add($"{transfer.Id} ok");
            }
            catch (Exception)
            {
                // Catch-all: loses the reason and hides real bugs.
                log.Add($"{transfer.Id} failed");
            }
        }

        return new BatchResult(log, accounts.Select(account => $"{account.Id}={balances[account.Id].Balance}").ToList());
    }

    // Provided: checks every invariant before changing anything, so a throw leaves no partial transfer.
    private static void Post(Dictionary<string, Account> accounts, Transfer transfer)
    {
        var sender = accounts[transfer.From];
        var receiver = accounts[transfer.To];
        if (sender.Frozen) throw new AccountFrozenException(sender.Id);
        if (receiver.Frozen) throw new AccountFrozenException(receiver.Id);
        if (sender.Balance < transfer.Amount) throw new InsufficientFundsException(sender.Id, sender.Balance, transfer.Amount);

        accounts[sender.Id] = sender with { Balance = sender.Balance - transfer.Amount };
        accounts[receiver.Id] = receiver with { Balance = receiver.Balance + transfer.Amount };
    }
}
