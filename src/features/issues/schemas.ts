import { z } from "zod";

export const issueFormSchema = z.object({
  subject:     z.string().min(1, "Subject is required").max(200),
  description: z.string().optional(),
  assigned_to: z.number().int().nullable().optional(),
  type:        z.number({ message: "Type is required" }).int(),
  severity:    z.number({ message: "Severity is required" }).int(),
  priority:    z.number({ message: "Priority is required" }).int(),
  status:      z.number({ message: "Status is required" }).int(),
  deadline:    z.string().nullable().optional(),
});

export type IssueFormValues = z.infer<typeof issueFormSchema>;

export const bulkIssueSchema = z.object({
  subjects: z
    .string()
    .min(1, "At least one subject is required")
    .refine(
      (v) => v.split("\n").some((l) => l.trim().length > 0),
      "At least one non-empty line is required",
    ),
  type:     z.number({ message: "Type is required" }).int(),
  severity: z.number({ message: "Severity is required" }).int(),
  priority: z.number({ message: "Priority is required" }).int(),
  status:   z.number({ message: "Status is required" }).int(),
});

export type BulkIssueFormValues = z.infer<typeof bulkIssueSchema>;