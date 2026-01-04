from fastapi import FastAPI
from pydantic import BaseModel
import torch
import logging
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from fastapi.responses import Response

# -----------------------------
# App setup
# -----------------------------
app = FastAPI(title="ML Trust Service", version="1.0.0")

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ml-trust")

# -----------------------------
# Metrics
# -----------------------------
requests_total = Counter("ml_trust_requests_total", "Total requests to /predict")
trust_scores = Histogram("ml_trust_scores", "Distribution of trust scores", buckets=[0,0.2,0.4,0.6,0.8,1.0])

# -----------------------------
# Schemas
# -----------------------------
class Input(BaseModel):
    rating: float
    rating_count: int
    cancelled_rides: int
    complaints: int
    fraud_score: float

class TrustOutput(BaseModel):
    ml_trust: float

# -----------------------------
# Endpoints
# -----------------------------
@app.get("/")
def root():
    return {"service": "ml-trust", "status": "running"}

@app.get("/healthz")
def health():
    return {"status": "ok"}

@app.get("/metrics")
def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

@app.post("/predict", response_model=TrustOutput)
def predict(i: Input):
    # Normalize features
    x = torch.tensor([
        i.rating / 5.0,
        min(i.rating_count / 500, 1),
        1 - min(i.cancelled_rides / 10, 1),
        1 - min(i.complaints / 5, 1),
        1 - i.fraud_score
    ], dtype=torch.float32)

    # Aggregate trust score
    trust = torch.sigmoid(x.mean()).item()
    trust = round(trust, 2)

    # Logging + metrics
    logger.info(f"DriverInput={i.dict()} -> ml_trust={trust}")
    requests_total.inc()
    trust_scores.observe(trust)

    return TrustOutput(ml_trust=trust)