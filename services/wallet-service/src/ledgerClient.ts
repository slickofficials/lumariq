import axios from "axios";

const LEDGER_URL = process.env.LEDGER_URL || "http://wallet-ledger:7070";

export async function ledgerHasIdem(key: string): Promise<boolean> {
  const res = await axios.post(`${LEDGER_URL}/ledger/has-idem`, { key });
  return res.data.exists === true;
}

export async function ledgerCredit(input: {
  walletId: string;
  amount: number;
  reference?: string;
}) {
  await axios.post(`${LEDGER_URL}/ledger/credit`, {
    wallet_id: input.walletId,
    amount: input.amount,
    reference: input.reference,
  });
}

export async function ledgerDebit(input: {
  walletId: string;
  amount: number;
  reference?: string;
}) {
  await axios.post(`${LEDGER_URL}/ledger/debit`, {
    wallet_id: input.walletId,
    amount: input.amount,
    reference: input.reference,
  });
}
