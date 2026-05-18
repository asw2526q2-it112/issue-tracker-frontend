import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
    queryFn: async () =>
      unwrap(await api.GET("/api/issues/", { params: { query: params } })),
  });
}

export function useIssue(id: number) {
  return useQuery({
    queryKey: qk.issues.detail(id),
    queryFn: async () =>
      unwrap(
        await api.GET("/api/issues/{id}/", { params: { path: { id } } }),
      ),
    enabled: Number.isFinite(id),
  });
}

export function useCreateIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      body: components["schemas"]["IssueWriteFormRequest"],
    ) => unwrap(await api.POST("/api/issues/", { body })),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.issues.list({}) });
    },
  });
}

export function useBulkCreateIssues() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      body: components["schemas"]["BulkIssueWriteRequest"],
    ) => unwrap(await api.POST("/api/issues/bulk/", { body })),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.issues.list({}) });
    },
  });
}

export function useDeleteIssue() {
  const qc = useQueryClient();
  return useMutation({
    // Cridem al mètode DELETE tipat passant-li l'ID per la URL
    mutationFn: async (id: number) =>
      unwrap(await api.DELETE("/api/issues/{id}/", { params: { path: { id } } })),
    onSuccess: () => {
      // Quan s'esborri correctament, invalidem la llista perquè React Query la torni a carregar automàticament
      void qc.invalidateQueries({ queryKey: qk.issues.list({}) });
    },
  });
}

export function useUpdateIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: components["schemas"]["PatchedIssueWriteFormRequest"] }) =>
      unwrap(await api.PATCH("/api/issues/{id}/", { params: { path: { id } }, body: data })),
    onSuccess: (_, variables) => {
      // Refresquem tant el detall de l'issue com la llista general un cop guardat
      void qc.invalidateQueries({ queryKey: qk.issues.detail(variables.id) });
      void qc.invalidateQueries({ queryKey: qk.issues.list({}) });
    },
  });
}