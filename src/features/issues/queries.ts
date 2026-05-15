import { useQuery } from "@tanstack/react-query";

import { api, unwrap } from "@/lib/api/client";
import { qk } from "@/lib/query/keys";

import type { components } from "@/lib/api/schema";

export type Issue = components["schemas"]["IssueRead"];

export type IssueListParams = {
  page?: number;
  search?: string;
  status?: number;
  priority?: number;
  type?: number;
  ordering?: string;
};

export function useIssues(params: IssueListParams = {}) {
  return useQuery({
    queryKey: qk.issues.list(params),
    queryFn: async () => unwrap(await api.GET("/api/issues/", { params: { query: params } })),
  });
}

export function useIssue(id: number) {
  return useQuery({
    queryKey: qk.issues.detail(id),
    queryFn: async () =>
      unwrap(await api.GET("/api/issues/{id}/", { params: { path: { id } } })),
    enabled: Number.isFinite(id),
  });
}
