// src/features/issues/components/IssueListView.tsx
"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

import { useIssues } from "../queries";
import { toOrdering, type SortField, type SortDir } from "../types";
import { useIssueColorMap } from "../useColorMap";
import {
  useTypes,
  useSeverities,
  usePriorities,
  useStatuses,
} from "@/features/settings/queries";
import { FiltersPanel } from "./FiltersPanel";
import { IssuesTable } from "./IssuesTable";
import { NewIssueDialog } from "./NewIssueDialog";
import { BulkInsertDialog } from "./BulkInsertDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function IssueListView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // ── dialog state ──────────────────────────────────────────────────────
  const [newIssueOpen, setNewIssueOpen] = useState(false);
  const [bulkInsertOpen, setBulkInsertOpen] = useState(false);

  // ── leer estado de la URL ────────────────────────────────────────────
  const search = searchParams.get("q") ?? "";
  const typeId = searchParams.get("type") ? Number(searchParams.get("type")) : undefined;
  const sevId = searchParams.get("severity") ? Number(searchParams.get("severity")) : undefined;
  const priId = searchParams.get("priority") ? Number(searchParams.get("priority")) : undefined;
  const statId = searchParams.get("status") ? Number(searchParams.get("status")) : undefined;
  const sortField = (searchParams.get("sort") as SortField | null) ?? undefined;
  const sortDir = (searchParams.get("dir") as SortDir | null) ?? "asc";
  const page = searchParams.get("page") ? Number(searchParams.get("page")) : undefined;

  const [localSearch, setLocalSearch] = useState(search);
  const [showFilters, setShowFilters] = useState(false);

  // ── helper: actualizar URL sin recargar ──────────────────────────────
  const push = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (v === undefined || v === "") params.delete(k);
        else params.set(k, v);
      }
      if (!("page" in updates)) params.delete("page");
      startTransition(() => router.push(`${pathname}?${params.toString()}`));
    },
    [router, pathname, searchParams],
  );

  // ── datos ─────────────────────────────────────────────────────────────
  const { data: issuesData, isLoading: issuesLoading } = useIssues({
    search: search || undefined,
    type: typeId,
    priority: priId,
    status: statId,
    ordering: toOrdering(sortField, sortDir),
    page,
  });

  const { data: types = [] } = useTypes();
  const { data: severities = [] } = useSeverities();
  const { data: priorities = [] } = usePriorities();
  const { data: statuses = [] } = useStatuses();

  const typeList = "results" in types ? types.results : types;
  const severityList = "results" in severities ? severities.results : severities;
  const priorityList = "results" in priorities ? priorities.results : priorities;
  const statusList = "results" in statuses ? statuses.results : statuses;

  const colorMap = useIssueColorMap();

  // ── handlers ─────────────────────────────────────────────────────────
  function handleFilterChange(
    key: "type" | "severity" | "priority" | "status",
    id: number | undefined,
  ) {
    push({ [key]: id?.toString() });
  }

  function handleSort(field: SortField) {
    const nextDir: SortDir =
      sortField === field && sortDir === "asc" ? "desc" : "asc";
    push({ sort: field, dir: nextDir });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    push({ q: localSearch || undefined });
  }

  function handleClear() {
    setLocalSearch("");
    startTransition(() => router.push(pathname));
  }

  const hasNext = Boolean(issuesData?.next);
  const hasPrev = Boolean(issuesData?.previous);
  const currentPage = page ?? 1;

  // ── render ────────────────────────────────────────────────────────────
  return (
    <div className="p-8">
      {/* Dialogs */}
      <NewIssueDialog open={newIssueOpen} onOpenChange={setNewIssueOpen} />
      <BulkInsertDialog open={bulkInsertOpen} onOpenChange={setBulkInsertOpen} />

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Issues</h1>
        <div className="flex items-center gap-2">
          <Button onClick={() => setNewIssueOpen(true)}>+ New issue</Button>
          <Button
            variant="ghost"
            size="icon"
            title="Bulk insert issues"
            onClick={() => setBulkInsertOpen(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 12H3" />
              <path d="M16 6H3" />
              <path d="M16 18H3" />
              <path d="M18 9v6" />
              <path d="M15 12h6" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <form onSubmit={handleSearchSubmit} className="mb-5 flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setShowFilters((v) => !v)}
          title={showFilters ? "Hide filters" : "Show filters"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="21" x2="14" y1="4" y2="4" />
            <line x1="10" x2="3" y1="4" y2="4" />
            <line x1="21" x2="12" y1="12" y2="12" />
            <line x1="8" x2="3" y1="12" y2="12" />
            <line x1="21" x2="16" y1="20" y2="20" />
            <line x1="12" x2="3" y1="20" y2="20" />
            <line x1="14" x2="14" y1="2" y2="6" />
            <line x1="8" x2="8" y1="10" y2="14" />
            <line x1="16" x2="16" y1="18" y2="22" />
          </svg>
        </Button>
        <Input
          type="text"
          placeholder="Search issues…"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="max-w-sm"
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
        {(search || typeId || sevId || priId || statId) && (
          <Button type="button" variant="ghost" onClick={handleClear}>
            Clear
          </Button>
        )}
      </form>

      <div className="flex items-start">
        {/* Sidebar filtros */}
        <div
          className={`grid overflow-hidden transition-[grid-template-columns,opacity,margin] duration-300 ease-in-out ${
            showFilters
              ? "mr-5 grid-cols-[13rem] opacity-100"
              : "mr-0 grid-cols-[0rem] opacity-0 h-0"
          }`}
        >
          <div className="min-w-[13rem]">
            <FiltersPanel
              types={typeList}
              severities={severityList}
              priorities={priorityList}
              statuses={statusList}
              selectedType={typeId}
              selectedSeverity={sevId}
              selectedPriority={priId}
              selectedStatus={statId}
              onChange={handleFilterChange}
              onClear={handleClear}
              onApply={() => {}}
            />
          </div>
        </div>

        {/* Tabla */}
        <IssuesTable
          issues={issuesData?.results ?? []}
          colorMap={colorMap}
          isLoading={issuesLoading}
          sort={{ field: sortField, dir: sortDir, onSort: handleSort }}
          emptyState={
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-muted-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <p className="text-sm">No issues found.</p>
            </div>
          }
          footer={
            (hasNext || hasPrev) && (
              <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <span className="text-xs text-muted-foreground">
                  {issuesData?.count ?? 0} issue
                  {issuesData?.count !== 1 ? "s" : ""}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!hasPrev}
                    onClick={() => push({ page: String(currentPage - 1) })}
                  >
                    ← Prev
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Page {currentPage}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!hasNext}
                    onClick={() => push({ page: String(currentPage + 1) })}
                  >
                    Next →
                  </Button>
                </div>
              </div>
            )
          }
        />
      </div>
    </div>
  );
}