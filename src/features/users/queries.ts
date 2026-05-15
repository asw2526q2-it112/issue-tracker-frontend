import { useQuery } from "@tanstack/react-query";

import { api, unwrap } from "@/lib/api/client";
import { qk } from "@/lib/query/keys";

import type { components } from "@/lib/api/schema";

export type Me = components["schemas"]["MeDetail"];
export type PublicUser = components["schemas"]["UserDetail"];

export function useMe() {
  return useQuery({
    queryKey: qk.me.detail(),
    queryFn: async () => unwrap(await api.GET("/api/me/")),
  });
}

export function useUser(username: string) {
  return useQuery({
    queryKey: ["users", "detail", username] as const,
    queryFn: async () =>
      unwrap(
        await api.GET("/api/users/{username}/", {
          params: { path: { username } },
        }),
      ),
    enabled: Boolean(username),
  });
}
