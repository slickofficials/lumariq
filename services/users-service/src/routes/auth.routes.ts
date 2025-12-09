import { Router } from "express";
import { register, login, refreshToken } from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { registerSchema, loginSchema, refreshSchema } from "../validation/authSchemas";
import { authLimiter, loginLimiter } from "../middleware/rateLimiter";

const router = Router();

// Maximum security for auth endpoints
router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", loginLimiter, validate(loginSchema), login);
router.post("/refresh", authLimiter, validate(refreshSchema), refreshToken);

router.get("/health", (_req, res) => {
  res.json({ status: "users-service ok" });
});

export default router;
