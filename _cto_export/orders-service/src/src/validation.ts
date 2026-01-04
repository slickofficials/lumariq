import { z } from "zod";

export const orderItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  unitPrice: z.number().int().nonnegative(),
  quantity: z.number().int().min(1)
});

export const createOrderSchema = z.object({
  userId: z.string().uuid(),
  items: z.array(orderItemSchema).min(1),
  currency: z.string().optional(),
  meta: z.record(z.any()).optional()
});