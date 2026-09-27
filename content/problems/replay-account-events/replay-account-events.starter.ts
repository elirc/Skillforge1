type LedgerEvent = {
  seq: number;
  account: string;
  type: "opened" | "deposited" | "withdrew" | "closed";
  amount: number;
};

export function replayLedger(events: LedgerEvent[]) {
  // Sort by seq, skip repeated seqs, apply each event or record it as rejected.
}
