import { z } from "zod";

export const adminMailSchema = z.object({
  id: z.string(),
  mailInput: z.string(),
  mailOutput: z.string(),
  promptTokens: z.number(),
  completionTokens: z.number(),
  cost: z.number(),
  createdAt: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    firstname: z.string(),
    lastname: z.string(),
  }),
});

export const adminHistoryResponseSchema = z.object({
  mails: z.array(adminMailSchema),
});

export type AdminHistoryResponse = z.infer<typeof adminHistoryResponseSchema>;
