"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.assertDbConnection = assertDbConnection;
// src/prisma.ts
const client_1 = require("@prisma/client");
exports.prisma = new client_1.PrismaClient();
// Optional: helper to sanity-check DB connection on startup
async function assertDbConnection() {
    try {
        await exports.prisma.$queryRaw `SELECT 1`;
        console.log("[orders-service] ✅ Connected to Postgres");
    }
    catch (err) {
        console.error("[orders-service] ❌ Failed to connect to Postgres", err);
        throw err;
    }
}
