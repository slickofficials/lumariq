use axum::{Json, extract::State};
use sqlx::{Pool, Postgres};
use serde::Deserialize;
use uuid::Uuid;

use crate::ledger::{credit, debit};

#[derive(Deserialize)]
struct CreateWalletBody {
    user_id: Uuid,
}

pub async fn create_wallet_handler(
    State(db): State<Pool<Postgres>>,
    Json(body): Json<CreateWalletBody>
) -> Json<serde_json::Value> {

    let id = Uuid::new_v4();

    sqlx::query!(
        "INSERT INTO wallets (id, user_id, balance)
        VALUES ($1, $2, 0)",
        id,
        body.user_id
    )
    .execute(&db)
    .await
    .unwrap();

    Json(serde_json::json!({ "wallet_id": id }))
}

pub async fn get_balance_handler(
    State(db): State<Pool<Postgres>>,
) -> Json<serde_json::Value> {

    let wallet_id = Uuid::parse_str("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa").unwrap(); // Example

    let balance = sqlx::query!(
        "SELECT balance FROM wallets WHERE id=$1",
        wallet_id
    )
    .fetch_one(&db)
    .await
    .unwrap()
    .balance;

    Json(serde_json::json!({ "balance": balance }))
}

#[derive(Deserialize)]
struct TxBody {
    wallet_id: Uuid,
    amount: i64,
    reference: Option<String>,
}

pub async fn credit_handler(
    State(db): State<Pool<Postgres>>,
    Json(body): Json<TxBody>
) -> Json<serde_json::Value> {

    credit(&db, body.wallet_id, body.amount, body.reference)
        .await
        .unwrap();

    Json(serde_json::json!({ "status": "credited" }))
}

pub async fn debit_handler(
    State(db): State<Pool<Postgres>>,
    Json(body): Json<TxBody>
) -> Json<serde_json::Value> {

    debit(&db, body.wallet_id, body.amount, body.reference)
        .await
        .unwrap();

    Json(serde_json::json!({ "status": "debited" }))
}