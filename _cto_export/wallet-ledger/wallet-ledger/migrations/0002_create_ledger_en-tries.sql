CREATE TABLE IF NOT EXISTS ledger_entries (
    id UUID PRIMARY KEY,
    wallet_id UUID NOT NULL,
    amount BIGINT NOT NULL,
    entry_type VARCHAR(10) NOT NULL,  -- credit | debit
    reference VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);