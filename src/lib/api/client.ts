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
  // 204 No Content responses (e.g. DELETE) have no body — that's success, not
  // an error. Trust the HTTP status, not the presence of `data`.
  if (!result.response.ok) {
    throw new ApiError(result.response.status, result.error);
  }
  return result.data as T;
}

/**
 * Direct fetch for multipart uploads — openapi-fetch's types don't model
 * multipart bodies well, and the browser needs to set Content-Type with a
 * boundary itself, so we bypass the typed client here.
 */
export async function uploadMultipart<T>(
  path: string,
  formData: FormData,
): Promise<T> {
  const { token } = getCurrentUser();
  const res = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}${path}`, {
    method: "POST",
    headers: { Authorization: `Token ${token}` },
    body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body);
  }
  return res.json() as Promise<T>;
}
