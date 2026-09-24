import { z } from "zod";
import { mailSchema } from "./home.schema";

export const checkQuerySchema = z.object({
  mail_input: z.string().min(1, "mail_input is required"),
  style: z.string().min(1, "style is required"),
});

export type CheckQuery = z.infer<typeof checkQuerySchema>;

export const checkResponseSchema = z.object({
  message: z.string(),
  balance: z.number(),
  mails: z.array(mailSchema),
});

export type CheckResponse = z.infer<typeof checkResponseSchema>;
