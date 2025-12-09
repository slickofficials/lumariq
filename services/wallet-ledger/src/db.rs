use sqlx::{Pool, Postgres};
use std::env;

pub async fn init_db() -> Pool<Postgres> {
    let db_url = env::var("DATABASE_URL")
        .expect("DATABASE_URL not set");

    sqlx::PgPool::connect(&db_url)
        .await
        .expect("Failed to connect to DB")
}