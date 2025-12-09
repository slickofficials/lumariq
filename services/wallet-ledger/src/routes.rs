use axum::{Router, routing::{post, get}};
use sqlx::{Pool, Postgres};
use crate::handlers::*;

pub fn routes(db: Pool<Postgres>) -> Router {
    Router::new()
        .route("/wallet/create", post(create_wallet_handler))
        .route("/wallet/balance", get(get_balance_handler))
        .route("/wallet/credit", post(credit_handler))
        .route("/wallet/debit", post(debit_handler))
        .with_state(db)
}