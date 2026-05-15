import createClient, { type Middleware } from "openapi-fetch";

import { getCurrentUser } from "@/lib/auth/current-user";
import { env } from "@/lib/env";

import type { paths } from "./schema";

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const { token } = getCurrentUser();
    if (token) {
      request.headers.set("Authorization", `Token ${token}`);
    }
    return request;
  },
};

export const api = createClient<paths>({
  baseUrl: env.NEXT_PUBLIC_API_BASE_URL,
});

api.use(authMiddleware);

export class ApiError extends Error {
  constructor(
    public status: number,
    public data: unknown,
  ) {
    super(`API error ${status}`);
    this.name = "ApiError";
  }
}

export function unwrap<T>(result: {
  data?: T;
  error?: unknown;
  response: Response;
}): T {
  if (result.error !== undefined || result.data === undefined) {
    throw new ApiError(result.response.status, result.error);
  }
  return result.data;
}
