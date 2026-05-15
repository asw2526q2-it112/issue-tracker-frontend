import { z } from "zod";

export const profileFormSchema = z.object({
  bio: z.string().max(500).default(""),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
