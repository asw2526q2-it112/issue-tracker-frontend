import { z } from "zod";

/**
 * Edit-profile form. Mirrors Django's UserProfileForm:
 *   fields = ["first_name", "last_name", "bio"]
 *   bio: max 210 chars (per the in-app hint).
 */
export const profileFormSchema = z.object({
  first_name: z.string().max(150),
  last_name: z.string().max(150),
  bio: z.string().max(210, "Bio must be 210 characters or fewer"),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
