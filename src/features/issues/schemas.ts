import { z } from "zod";

/**
 * Form schema for creating / editing an issue.
 * Mirrors the writable fields from IssueWriteForm in the OpenAPI spec —
 * keep in sync if the API gains required fields.
 */
export const issueFormSchema = z.object({
  subject: z.string().min(1, "Subject is required").max(200),
  description: z.string().default(""),
  type: z.number().int().nullable().optional(),
  severity: z.number().int().nullable().optional(),
  priority: z.number().int().nullable().optional(),
  status: z.number().int().nullable().optional(),
  deadline: z.string().date().nullable().optional(),
});

export type IssueFormValues = z.infer<typeof issueFormSchema>;
