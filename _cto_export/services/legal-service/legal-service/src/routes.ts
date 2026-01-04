import { Router } from "express";
import { healthCheck } from "./controllers/health.controller";
import {
  uploadAgreement,
  signAgreement,
  getUserAgreements
} from "./controllers/agreements.controller";

import {
  createDispute,
  uploadAttachment,
  listDisputes
} from "./controllers/disputes.controller";

import multer from "multer";
import { requireAuth } from "./middleware/auth.middleware";

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.get("/health", healthCheck);

// Agreements
router.post("/agreements/upload", requireAuth, upload.single("file"), uploadAgreement);
router.post("/agreements/sign", requireAuth, signAgreement);
router.get("/agreements/my", requireAuth, getUserAgreements);

// Disputes
router.post("/disputes/create", requireAuth, createDispute);
router.post("/disputes/attachment/:id", requireAuth, upload.single("file"), uploadAttachment);
router.get("/disputes", requireAuth, listDisputes);

export default router;