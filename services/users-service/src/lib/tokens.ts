import jwt from "jsonwebtoken";
import { ACCESS_EXP, REFRESH_EXP } from "../config/auth";

export interface AccessPayload {
  userId: number;
  role: string;
  type: "access";
}

export interface RefreshPayload {
  userId: number;
  token: string;
  type: "refresh";
}

export function signAccessToken(
  userId: number,
  role: string
): string {
  const payload: AccessPayload = { userId, role, type: "access" };

  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: ACCESS_EXP,
  });
}

export function signRefreshToken(
  userId: number,
  token: string
): string {
  const payload: RefreshPayload = { userId, token, type: "refresh" };

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: REFRESH_EXP,
  });
}

export function verifyAccessToken(token: string): AccessPayload {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as AccessPayload;
}

export function verifyRefreshToken(token: string): RefreshPayload {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as RefreshPayload;
}
