use actix_web::{App, HttpServer, web};
use sqlx::{Pool, Postgres};

mod models;
mod db;
mod ledger;
mod routes;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("🚀 Wallet Ledger service running on port 7070");

    let database_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| {
            "postgres://postgres:postgres@localhost:5432/lumariq".to_string()
        });

    let db: Pool<Postgres> = db::connect(&database_url)
        .await
        .expect("DB connect failed");

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(db.clone()))
            .configure(routes::config)
    })
    .bind(("0.0.0.0", 7070))?
    .run()
    .await
}
