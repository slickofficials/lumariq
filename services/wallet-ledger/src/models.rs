use serde::{Serialize, Deserialize};
use uuid::Uuid;

#[derive(Serialize, Deserialize)]
pub struct Wallet {
    pub id: Uuid,
    pub user_id: Uuid,
    pub balance: i64,
}

#[derive(Serialize, Deserialize)]
pub struct LedgerEntry {
    pub id: Uuid,
    pub wallet_id: Uuid,
    pub amount: i64,
    pub entry_type: String,
    pub reference: Option<String>,
}