import { Router } from "express";
import { createOrder, getOrder, listOrders, updateOrderStatus } from "./handlers";

const router = Router();

router.post("/orders", createOrder);
router.get("/orders/:id", getOrder);
router.get("/orders", listOrders);
router.patch("/orders/:id", updateOrderStatus);

export default router;