import request from "supertest";
import { prisma } from "../src/prisma";
import app from "../src/server";
import { resetTestDB } from "./utils/resetTestDB";
import { createWallet, createFlag } from "./utils/factory";

describe("🔒 WALLET SERVICE — FULL TEST SUITE", () => {
  beforeEach(async () => {
    await resetTestDB();
  });

  it("Should return health status", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("wallet-service ok");
  });

  it("Should freeze wallet", async () => {
    const wallet = await createWallet(1);
    const res = await request(app).post("/freeze").send({ userId: 1 });

    expect(res.status).toBe(200);
    expect(res.body.wallet.frozen).toBe(true);
  });

  it("Should unfreeze wallet", async () => {
    const wallet = await createWallet(1);
    await prisma.wallet.update({ where: { id: wallet.id }, data: { frozen: true } });

    const res = await request(app).post("/unfreeze").send({ userId: 1 });

    expect(res.status).toBe(200);
    expect(res.body.wallet.frozen).toBe(false);
  });

  it("Should withdraw money successfully", async () => {
    const wallet = await createWallet(1);

    const res = await request(app)
      .post("/withdraw")
      .send({ userId: 1, amount: 200, refId: "TX1" });

    expect(res.status).toBe(200);
    expect(res.body.wallet.balance).toBe(800);
  });

  it("Should reject withdrawal over balance", async () => {
    await createWallet(1);

    const res = await request(app)
      .post("/withdraw")
      .send({ userId: 1, amount: 999999 });

    expect(res.status).toBe(400);
  });

  it("Should reject withdrawal if wallet is frozen", async () => {
    const wallet = await createWallet(1);
    await prisma.wallet.update({ where: { id: wallet.id }, data: { frozen: true } });

    const res = await request(app)
      .post("/withdraw")
      .send({ userId: 1, amount: 100 });

    expect(res.status).toBe(400);
  });

  it("Should evaluate wallet risk", async () => {
    const wallet = await createWallet(1);

    const res = await request(app)
      .post("/risk/evaluate")
      .send({ userId: 1 });

    expect(res.status).toBe(200);
    expect(res.body.score).toBeDefined();
  });

  it("Should return wallet risk profile", async () => {
    const wallet = await createWallet(1);

    await request(app).post("/risk/evaluate").send({ userId: 1 });

    const res = await request(app).get("/risk/1");

    expect(res.status).toBe(200);
    expect(res.body.wallet).toBeDefined();
  });

  it("Should resolve a risk flag", async () => {
    const wallet = await createWallet();   // <-- FIX
    const flag = await createFlag(wallet.id);

    const res = await request(app)
      .post(`/risk/flags/${flag.id}/resolve`)
      .send();

    expect(res.status).toBe(200);
    expect(res.body.flag.resolved).toBe(true);
  });
});
