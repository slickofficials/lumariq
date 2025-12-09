import { Request, Response } from "express";
import { createUser, validateUser, createRefreshToken, rotateRefreshToken } from "../services/auth.service";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/tokens";
import { prisma } from "../lib/prisma";

// ---------------------------
// REGISTER
// ---------------------------
export async function register(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ error: "Email already exists" });

    const user = await createUser(email, password);
    res.json({ user });
  } catch (err) {
    console.error("REGISTER ERR:", err);
    res.status(500).json({ error: "Server error" });
  }
}

// ---------------------------
// LOGIN
// ---------------------------
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const user = await validateUser(email, password);
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const access = signAccessToken(user.id, user.role);

    const rtRecord = await createRefreshToken(user.id);
    const refresh = signRefreshToken(user.id, rtRecord.token);

    return res.json({
      accessToken: access,
      refreshToken: refresh,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("LOGIN ERR:", err);
    res.status(500).json({ error: "Server error" });
  }
}

// ---------------------------
// REFRESH TOKEN — EXPORT THIS
// ---------------------------
export async function refreshToken(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) return res.status(400).json({ error: "No refresh token" });

    const payload = verifyRefreshToken(refreshToken);

    const oldRecord = await prisma.refreshToken.findUnique({
      where: { token: payload.token },
    });

    if (!oldRecord || oldRecord.isRevoked)
      return res.status(401).json({ error: "Invalid refresh token" });

    const newRecord = await rotateRefreshToken(oldRecord.id, payload.userId);

    const newAccess = signAccessToken(payload.userId, "USER");
    const newRefresh = signRefreshToken(payload.userId, newRecord.token);

    return res.json({
      accessToken: newAccess,
      refreshToken: newRefresh,
    });
  } catch (err) {
    console.error("REFRESH ERR:", err);
    return res.status(401).json({ error: "Invalid refresh token" });
  }
}
