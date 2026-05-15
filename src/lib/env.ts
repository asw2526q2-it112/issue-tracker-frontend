import { z } from "zod";

const ClientEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url(),
});

export const env = ClientEnvSchema.parse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
});
