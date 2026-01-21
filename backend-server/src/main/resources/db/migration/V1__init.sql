-- Lumariq Ledger V1
CREATE TABLE IF NOT EXISTS transfer_intents (
  intent_id      TEXT PRIMARY KEY,
  recipient      TEXT NOT NULL,
  amount         NUMERIC(18,2) NOT NULL CHECK (amount > 0),
  currency       TEXT NOT NULL,
  challenge      TEXT NOT NULL,
  expires_at     TIMESTAMPTZ NOT NULL,
  status         TEXT NOT NULL DEFAULT 'PREPARED',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id             TEXT PRIMARY KEY,
  intent_id      TEXT NOT NULL REFERENCES transfer_intents(intent_id),
  recipient      TEXT NOT NULL,
  amount         NUMERIC(18,2) NOT NULL CHECK (amount > 0),
  currency       TEXT NOT NULL,
  status         TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
