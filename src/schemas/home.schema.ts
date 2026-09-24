import { z } from "zod";

export const homeResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    firstname: z.string(),
    lastname: z.string(),
    balance: z.number(),
  }),
  mails: z.array(
    z.object({
      id: z.string(),
      mailInput: z.string(),
      mailOutput: z.string(),
      cost: z.number(),
      createdAt: z.string(),
    }),
  ),
});

export type HomeResponse = z.infer<typeof homeResponseSchema>;
