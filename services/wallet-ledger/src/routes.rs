use actix_web::{get, post, web, HttpResponse, Responder};
use sqlx::{Pool, Postgres};
use serde::{Deserialize, Serialize};

use crate::ledger;

#[get("/health")]
async fn health() -> impl Responder {
    HttpResponse::Ok().json(serde_json::json!({
        "status": "wallet-ledger ok"
    }))
}

#[get("/idempotency/{key}")]
async fn has_idempotency(
    db: web::Data<Pool<Postgres>>,
    path: web::Path<String>
) -> impl Responder {
    let key = path.into_inner();
    match ledger::has_idempotency(db.get_ref(), &key).await {
        Ok(exists) => HttpResponse::Ok().json(
            serde_json::json!({ "key": key, "exists": exists })
        ),
        Err(e) => HttpResponse::InternalServerError().json(
            serde_json::json!({ "error": e })
        ),
    }
}

#[derive(Debug, Deserialize)]
pub struct CreditReq {
    pub wallet_id: String,
    pub amount: i64,
    pub reference: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct CreditResp {
    pub ok: bool,
    pub wallet_id: String,
    pub reference: Option<String>,
}

#[post("/credit")]
async fn credit(
    db: web::Data<Pool<Postgres>>,
    req: web::Json<CreditReq>
) -> impl Responder {

    let wallet_id = match uuid::Uuid::parse_str(&req.wallet_id) {
        Ok(v) => v,
        Err(_) => {
            return HttpResponse::BadRequest().json(
                serde_json::json!({ "error": "invalid wallet_id uuid" })
            );
        }
    };

    match ledger::credit(
        db.get_ref(),
        wallet_id,
        req.amount,
        req.reference.clone()
    ).await {
        Ok(_) => HttpResponse::Ok().json(
            CreditResp {
                ok: true,
                wallet_id: req.wallet_id.clone(),
                reference: req.reference.clone()
            }
        ),
        Err(e) => HttpResponse::BadRequest().json(
            serde_json::json!({ "ok": false, "error": e })
        ),
    }
}

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(health);
    cfg.service(has_idempotency);
    cfg.service(credit);
}
