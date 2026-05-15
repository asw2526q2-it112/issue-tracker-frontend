import { z } from "zod";

/**
 * Shared form schema for the small CRUD settings entities — statuses,
 * priorities, severities, types, tags. Each has a `name` and a `color`.
 */
export const settingEntityFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  color: z
    .string()
    .regex(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/, "Must be a hex color"),
});

export type SettingEntityFormValues = z.infer<typeof settingEntityFormSchema>;
