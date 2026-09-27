import { Prisma } from "@prisma/client";

/** SQLite reports lock contention as a timeout or write conflict; both are safe to retry. */
export function isKnownSqliteBusy(error: unknown) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return false;
  return (
    ["P1008", "P2034"].includes(error.code) &&
    /timed out|database is locked|write conflict/i.test(error.message)
  );
}

const wait = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

/**
 * Runs `operation` (normally a whole `$transaction`) and retries it a bounded
 * number of times when SQLite reports it was busy. Any other error, or a busy
 * error on the final attempt, is rethrown unchanged.
 */
export async function withSqliteBusyRetry<T>(operation: () => Promise<T>, attempts = 3): Promise<T> {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (isKnownSqliteBusy(error) && attempt < attempts - 1) {
        await wait(10 * (attempt + 1));
        continue;
      }
      throw error;
    }
  }
}
