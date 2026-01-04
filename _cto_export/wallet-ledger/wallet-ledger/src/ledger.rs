use sqlx::{Pool, Postgres};
use uuid::Uuid;
use crate::models::*;
use chrono::Utc;

// NEURON GRID: Global Safety Check
async fn is_grid_locked(db: &Pool<Postgres>) -> bool {
    // Check L5_system_state table for 'SHOCK_ABSORPTION_ACTIVE'
    let row = sqlx::query!("SELECT locked FROM system_governance WHERE key = 'neuron_grid_lock'")
        .fetch_optional(db)
        .await
        .unwrap_or(None);
    
    match row {
        Some(r) => r.locked,
        None => false
    }
}

pub async fn debit(
    db: &Pool<Postgres>,
    wallet_id: Uuid,
    amount: i64,
    reference: Option<String>
) -> Result<(), String> {
    // 🛡️ L5 NEURON GRID PROTECTOR
    if is_grid_locked(db).await {
        return Err("SYNAPSE_BLOCKED: Neuron Grid has locked debits due to high market volatility.".into());
    }

    let entry_id = Uuid::new_v4();
    let mut tx = db.begin().await.map_err(|e| e.to_string())?;

    // Ensure balance enough
    let balance = sqlx::query!("SELECT balance FROM wallets WHERE id=$1", wallet_id)
        .fetch_one(&mut tx)
        .await
        .map_err(|e| e.to_string())?
        .balance;

    if balance < amount {
        return Err("Insufficient balance".into());
    }

    sqlx::query!(
        "INSERT INTO ledger_entries (id, wallet_id, amount, entry_type, reference, created_at)
        VALUES ($1,$2,$3,'debit',$4,$5)",
        entry_id, wallet_id, amount, reference, Utc::now()
    )
    .execute(&mut tx)
    .await
    .map_err(|e| e.to_string())?;

    sqlx::query!("UPDATE wallets SET balance = balance - $1 WHERE id=$2", amount, wallet_id)
    .execute(&mut tx)
    .await
    .map_err(|e| e.to_string())?;

    tx.commit().await.map_err(|e| e.to_string())?;
    Ok(())
}