import jwt from "jsonwebtoken";
import { AccessPayload, RefreshPayload, RoleName } from "../types/auth";

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET!;

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  // Fail fast in dev if secrets are missing
  // (Don’t throw in prod libs, just log)
  console.warn("[jwt] ACCESS_TOKEN_SECRET or REFRESH_TOKEN_SECRET missing");
}

export function signAccessToken(
  userId: number | string,
  role: RoleName
): string {
  const payload: AccessPayload = {
    userId: String(userId),
    role,
    type: "access",
  };

  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });
}

export function signRefreshToken(
  userId: number | string,
  token: string
): string {
  const payload: RefreshPayload = {
    userId: String(userId),
    token,
    type: "refresh",
  };

  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: "30d" });
}

export function verifyAccessToken(token: string): AccessPayload {
  return jwt.verify(token, ACCESS_SECRET) as AccessPayload;
}

export function verifyRefreshToken(token: string): RefreshPayload {
  return jwt.verify(token, REFRESH_SECRET) as RefreshPayload;
}