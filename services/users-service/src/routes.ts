import { Router } from "express";
import {
  register,
  login,
  refreshToken,
} from "./controllers/auth.controller";

const router = Router();

router.post("/auth/register", register);
router.post("/auth/login", login);
router.post("/auth/refresh", refreshToken);

export default router;
