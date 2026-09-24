import { z } from "zod";

export const loginBodySchema = z.object({
  email: z.string().email("A valid email is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginBody = z.infer<typeof loginBodySchema>;

export const loginResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    firstname: z.string(),
    lastname: z.string(),
    balance: z.number(),
    role: z.enum(["USER", "ADMIN"]),
  }),
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;
