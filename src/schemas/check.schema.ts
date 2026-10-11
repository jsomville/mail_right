import { z } from "zod";

export const checkQuerySchema = z.object({
  mail_input: z.string().min(1, "mail_input is required"),
  style: z.string().min(1, "style is required"),
});

export type CheckQuery = z.infer<typeof checkQuerySchema>;

export const checkResponseSchema = z.object({
  message: z.string(),
});

export type CheckResponse = z.infer<typeof checkResponseSchema>;
