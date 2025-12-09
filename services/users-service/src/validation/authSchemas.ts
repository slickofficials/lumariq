import { z } from "zod";

const emailField = z.string().email().min(6).max(255);
const passwordField = z.string().min(8).max(128);

const emptyObject = z.object({}).optional().default({});

export const registerSchema = z.object({
  body: z.object({
    email: emailField,
    password: passwordField,
  }),
  query: emptyObject,
  params: emptyObject,
});

export const loginSchema = z.object({
  body: z.object({
    email: emailField,
    password: passwordField,
  }),
  query: emptyObject,
  params: emptyObject,
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(10),
  }),
  query: emptyObject,
  params: emptyObject,
});
