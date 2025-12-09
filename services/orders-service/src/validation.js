"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderSchema = exports.orderItemSchema = void 0;
const zod_1 = require("zod");
exports.orderItemSchema = zod_1.z.object({
    productId: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1),
    unitPrice: zod_1.z.number().int().nonnegative(),
    quantity: zod_1.z.number().int().min(1)
});
exports.createOrderSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid(),
    items: zod_1.z.array(exports.orderItemSchema).min(1),
    currency: zod_1.z.string().optional(),
    meta: zod_1.z.record(zod_1.z.any()).optional()
});
