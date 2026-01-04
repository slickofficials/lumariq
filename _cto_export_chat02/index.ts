import { Router } from "express";
import proxy from "express-http-proxy";

const router = Router();

router.use("/users", proxy(process.env.USERS_SERVICE_URL!));
router.use("/orders", proxy(process.env.ORDERS_SERVICE_URL!));
router.use("/wallet", proxy(process.env.WALLET_SERVICE_URL!));
router.use("/dispatch", proxy(process.env.DISPATCH_SERVICE_URL!));
router.use("/ledger", proxy(process.env.WALLET_LEDGER_URL!));
router.use("/notifications", proxy(process.env.NOTIFY_SERVICE_URL!));

router.get("/health", (_req, res) => {
  res.json({ status: "api-gateway ok" });
});

export default router;
