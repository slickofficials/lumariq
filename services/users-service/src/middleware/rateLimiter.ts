import rateLimit from "express-rate-limit";

const FIFTEEN_MINUTES = 15 * 60 * 1000;

export const loginLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  max: Number(process.env.LOGIN_MAX_PER_WINDOW ?? 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "too_many_login_attempts" },
});

export const authLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  max: Number(process.env.AUTH_MAX_PER_WINDOW ?? 100),
  standardHeaders: true,
  legacyHeaders: false,
});
