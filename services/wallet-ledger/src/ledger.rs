use sqlx::{Pool, Postgres};
use uuid::Uuid;
use crate::models::*;
use chrono::Utc;

pub async fn credit(
    db: &Pool<Postgres>,
    wallet_id: Uuid,
    amount: i64,
    reference: Option<String>
) -> Result<(), String> {

    let entry_id = Uuid::new_v4();

    let mut tx = db.begin().await.map_err(|e| e.to_string())?;

    sqlx::query!(
        "INSERT INTO ledger_entries (id, wallet_id, amount, entry_type, reference, created_at)
        VALUES ($1,$2,$3,'credit',$4,$5)",
        entry_id, wallet_id, amount, reference, Utc::now()
    )
    .execute(&mut tx)
    .await
    .map_err(|e| e.to_string())?;

    sqlx::query!(
        "UPDATE wallets SET balance = balance + $1 WHERE id=$2",
        amount,
        wallet_id
    )
    .execute(&mut tx)
    .await
    .map_err(|e| e.to_string())?;

    tx.commit().await.map_err(|e| e.to_string())?;
    Ok(())
}

pub async fn debit(
    db: &Pool<Postgres>,
    wallet_id: Uuid,
    amount: i64,
    reference: Option<String>
) -> Result<(), String> {

    let entry_id = Uuid::new_v4();

    let mut tx = db.begin().await.map_err(|e| e.to_string())?;

    // Ensure balance enough
    let balance = sqlx::query!(
        "SELECT balance FROM wallets WHERE id=$1",
        wallet_id
    )
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

    sqlx::query!(
        "UPDATE wallets SET balance = balance - $1 WHERE id=$2",
        amount,
        wallet_id
    )
    .execute(&mut tx)
    .await
    .map_err(|e| e.to_string())?;

    tx.commit().await.map_err(|e| e.to_string())?;
    Ok(())
}