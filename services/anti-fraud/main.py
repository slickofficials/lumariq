from fastapi import FastAPI
from pydantic import BaseModel
import random
import psycopg2

app = FastAPI(title="Lumariq Anti-Fraud Engine")

class FraudEvent(BaseModel):
    driver_id: str
    event_type: str

@app.post("/event")
def detect_fraud(event: FraudEvent):
    score = random.uniform(0.4, 1.0)

    conn = psycopg2.connect(
        host="postgres",
        database="dispatch",
        user="lumariq",
        password="lumariq"
    )
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO fraud_events (driver_id, event_type, severity, score)
        VALUES (%s, %s, %s, %s)
    """, (event.driver_id, event.event_type, int(score*10), score))
    conn.commit()
    cur.close()
    conn.close()

    return {"fraud_score": round(score, 3)}