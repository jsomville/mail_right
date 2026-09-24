import { z } from "zod";

export const mailSchema = z.object({
  id: z.string(),
  mailInput: z.string(),
  mailOutput: z.string(),
  cost: z.number(),
  createdAt: z.string(),
});

export const homeResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    firstname: z.string(),
    lastname: z.string(),
    balance: z.number(),
    role: z.enum(["USER", "ADMIN"]),
  }),
  mails: z.array(mailSchema),
});

export type HomeResponse = z.infer<typeof homeResponseSchema>;
