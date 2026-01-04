use actix_web::{get, App, HttpResponse, HttpServer, Responder};

#[get("/health")]
async fn health() -> impl Responder {
    HttpResponse::Ok().json(serde_json::json!({
        "status": "wallet-ledger ok"
    }))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("🚀 Wallet Ledger service running on port 7070");

    HttpServer::new(|| {
        App::new()
            .service(health)
    })
    .bind(("0.0.0.0", 7070))?
    .run()
    .await
}