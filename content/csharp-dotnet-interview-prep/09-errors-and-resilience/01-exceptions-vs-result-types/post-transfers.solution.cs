public sealed record Account(string Id, decimal Balance, bool Frozen);
public sealed record Transfer(string Id, string From, string To, decimal Amount);
public sealed record BatchResult(List<string> Log, List<string> Balances);

public sealed record Result(bool IsSuccess, string? Error)
{
    public static Result Ok() => new(true, null);
    public static Result Fail(string error) => new(false, error);
}

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
    public static BatchResult Process(Account[] accounts, Transfer[] transfers)
    {
        var balances = accounts.ToDictionary(account => account.Id, account => account);
        var log = new List<string>();

        foreach (var transfer in transfers)
        {
            var validation = Validate(balances, transfer);
            if (!validation.IsSuccess)
            {
                log.Add($"{transfer.Id} rejected: {validation.Error}");
                continue;
            }

            try
            {
                Post(balances, transfer);
                log.Add($"{transfer.Id} ok");
            }
            catch (InsufficientFundsException ex)
            {
                log.Add($"{transfer.Id} failed: insufficient funds in {ex.AccountId} (balance {ex.Balance}, requested {ex.Requested})");
            }
            catch (AccountFrozenException ex)
            {
                log.Add($"{transfer.Id} failed: account {ex.AccountId} is frozen");
            }
        }

        return new BatchResult(log, accounts.Select(account => $"{account.Id}={balances[account.Id].Balance}").ToList());
    }

    private static Result Validate(Dictionary<string, Account> accounts, Transfer transfer)
    {
        if (transfer.Amount <= 0) return Result.Fail("amount must be positive");
        if (transfer.From == transfer.To) return Result.Fail("cannot transfer to the same account");
        if (!accounts.ContainsKey(transfer.From)) return Result.Fail($"unknown account {transfer.From}");
        if (!accounts.ContainsKey(transfer.To)) return Result.Fail($"unknown account {transfer.To}");
        return Result.Ok();
    }

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
