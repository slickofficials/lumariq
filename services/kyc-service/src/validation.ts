import { z } from "zod";

export const kycSchema = z.object({
  userId: z.string().uuid(),
  fullName: z.string().min(3),
  idNumber: z.string().min(5)
});