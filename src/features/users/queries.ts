import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, unwrap, uploadMultipart } from "@/lib/api/client";
import { qk } from "@/lib/query/keys";

import type { components } from "@/lib/api/schema";

export type Me = components["schemas"]["MeDetail"];
export type PublicUser = components["schemas"]["UserDetail"];
export type ProfileWrite = {
  first_name?: string;
  last_name?: string;
  bio?: string;
};

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

export function useUpdateMe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: ProfileWrite) =>
      unwrap(
        await api.PATCH("/api/me/", {
          body: body as never,
        }),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.me.all });
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("avatar", file);
      return uploadMultipart<components["schemas"]["UserRead"]>(
        "/api/me/avatar/",
        form,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.me.all });
    },
  });
}

export function useRemoveAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => unwrap(await api.DELETE("/api/me/avatar/")),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.me.all });
    },
  });
}
