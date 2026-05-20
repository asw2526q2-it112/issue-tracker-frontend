import { useQuery } from "@tanstack/react-query";

import { api, unwrap } from "@/lib/api/client";
import { qk } from "@/lib/query/keys";

export function useStatuses() {
  return useQuery({
    queryKey: qk.settings.statuses(),
    queryFn: async () => unwrap(await api.GET("/api/settings/statuses/")),
  });
}

export function usePriorities() {
  return useQuery({
    queryKey: qk.settings.priorities(),
    queryFn: async () => unwrap(await api.GET("/api/settings/priorities/")),
  });
}

export function useSeverities() {
  return useQuery({
    queryKey: qk.settings.severities(),
    queryFn: async () => unwrap(await api.GET("/api/settings/severities/")),
  });
}

export function useTypes() {
  return useQuery({
    queryKey: qk.settings.types(),
    queryFn: async () => unwrap(await api.GET("/api/settings/types/")),
  });
}

export function useTags() {
  return useQuery({
    queryKey: qk.settings.tags(),
    queryFn: async () => unwrap(await api.GET("/api/settings/tags/")),
  });
}

export function useDueDates() {
  return useQuery({
    queryKey: qk.settings.dueDates(),
    queryFn: async () => unwrap(await api.GET("/api/settings/due-dates/")),
  });
}
