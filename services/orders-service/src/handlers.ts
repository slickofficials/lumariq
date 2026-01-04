// src/handlers.ts
import { Request, Response } from "express";
import { prisma } from "./prisma";
import { publishOrderEvent } from "./rabbit";

/**
 * Create an order
 */
export async function createOrder(req: Request, res: Response) {
  try {
    const { userId, amount, currency } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ error: "Missing userId or amount" });
    }

    const order = await prisma.order.create({
      data: {
        userId: Number(userId),
        amount: Number(amount),
        currency: currency || "USD",
      },
    });

    // Emit RabbitMQ event
    publishOrderEvent("order.created", {
      orderId: order.id,
      userId: order.userId,
      amount: order.amount,
      currency: order.currency,
    });

    return res.json({ order });
  } catch (err: any) {
    console.error("Create order error:", err);
    return res.status(500).json({ error: "Failed to create order" });
  }
}

/**
 * Get order by ID
 */
export async function getOrder(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid order id" });
    }

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) return res.status(404).json({ error: "Order not found" });

    return res.json({ order });
  } catch (err) {
    console.error("Get order error:", err);
    return res.status(500).json({ error: "Failed to fetch order" });
  }
}

/**
 * List orders (optionally filter by userId)
 */
export async function listOrders(req: Request, res: Response) {
  try {
    const { userId } = req.query;

    const where = userId ? { userId: Number(userId) } : {};

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return res.json({ orders });
  } catch (err) {
    console.error("List orders error:", err);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid order ID" });
    }

    if (!status) {
      return res.status(400).json({ error: "Missing status" });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
    });

    // Emit event
    publishOrderEvent("order.status.updated", {
      orderId: updated.id,
      status: updated.status,
    });

    return res.json({ order: updated });
  } catch (err: any) {
    console.error("Update order status error:", err);
    return res.status(500).json({ error: "Failed to update order" });
  }
}
// --- Emit completion event for referral rewards ---
if (updated.status === "completed") {
  publishOrderEvent("order.completed", {
    orderId: updated.id,
    userId: updated.userId,
    amount: updated.amount,
    currency: updated.currency,
  });
}
