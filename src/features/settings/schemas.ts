import { z } from "zod";

/**
 * Shared form schema for the small CRUD settings entities — statuses,
 * priorities, severities, types, tags. Each has a `name` and a `color`.
 */
export const settingEntityFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  color: z
    .string()
    .regex(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/, "Must be a valid hex color (#RRGGBB)"),
});

export type SettingEntityFormValues = z.infer<typeof settingEntityFormSchema>;

export const statusSettingFormSchema = settingEntityFormSchema.extend({
  slug: z.string().min(1, "Slug is required").max(100),
  isclosed: z.boolean().default(false),
});

export type StatusSettingFormValues = z.infer<typeof statusSettingFormSchema>;

export const dueDateSettingFormSchema = settingEntityFormSchema.extend({
  days: z.coerce.number().min(0, "Days must be greater than or equal to 0"),
  isBefore: z.boolean().default(false),
});

export type DueDateSettingFormValues = z.infer<typeof dueDateSettingFormSchema>;
