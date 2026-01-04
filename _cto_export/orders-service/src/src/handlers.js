"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = createOrder;
exports.getOrder = getOrder;
exports.listOrders = listOrders;
exports.updateOrderStatus = updateOrderStatus;
const prisma_1 = require("./prisma");
const rabbit_1 = require("./rabbit");
/**
 * Create an order
 */
async function createOrder(req, res) {
    try {
        const { userId, amount, currency } = req.body;
        if (!userId || !amount) {
            return res.status(400).json({ error: "Missing userId or amount" });
        }
        const order = await prisma_1.prisma.order.create({
            data: {
                userId: Number(userId),
                amount: Number(amount),
                currency: currency || "USD",
            },
        });
        // Emit RabbitMQ event
        (0, rabbit_1.publishOrderEvent)("order.created", {
            orderId: order.id,
            userId: order.userId,
            amount: order.amount,
            currency: order.currency,
        });
        return res.json({ order });
    }
    catch (err) {
        console.error("Create order error:", err);
        return res.status(500).json({ error: "Failed to create order" });
    }
}
/**
 * Get order by ID
 */
async function getOrder(req, res) {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: "Invalid order id" });
        }
        const order = await prisma_1.prisma.order.findUnique({
            where: { id },
        });
        if (!order)
            return res.status(404).json({ error: "Order not found" });
        return res.json({ order });
    }
    catch (err) {
        console.error("Get order error:", err);
        return res.status(500).json({ error: "Failed to fetch order" });
    }
}
/**
 * List orders (optionally filter by userId)
 */
async function listOrders(req, res) {
    try {
        const { userId } = req.query;
        const where = userId ? { userId: Number(userId) } : {};
        const orders = await prisma_1.prisma.order.findMany({
            where,
            orderBy: { createdAt: "desc" },
        });
        return res.json({ orders });
    }
    catch (err) {
        console.error("List orders error:", err);
        return res.status(500).json({ error: "Failed to fetch orders" });
    }
}
/**
 * Update order status
 */
async function updateOrderStatus(req, res) {
    try {
        const id = Number(req.params.id);
        const { status } = req.body;
        if (isNaN(id)) {
            return res.status(400).json({ error: "Invalid order ID" });
        }
        if (!status) {
            return res.status(400).json({ error: "Missing status" });
        }
        const updated = await prisma_1.prisma.order.update({
            where: { id },
            data: { status },
        });
        // Emit event
        (0, rabbit_1.publishOrderEvent)("order.status.updated", {
            orderId: updated.id,
            status: updated.status,
        });
        return res.json({ order: updated });
    }
    catch (err) {
        console.error("Update order status error:", err);
        return res.status(500).json({ error: "Failed to update order" });
    }
}
