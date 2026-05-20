import { type ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { type components } from "@/lib/api/schema";

import { type SortDir, type SortField } from "../types";
import { IssueRow } from "./IssueRow";
import { SortableHeader } from "./SortableHeader";

type IssueRead = components["schemas"]["IssueRead"];

const GRID = "grid-cols-[3rem_5rem_5rem_1fr_5rem_5.5rem_5.5rem]";

const COLUMNS: { field: SortField; label: string; className?: string }[] = [
  { field: "type", label: "Type" },
  { field: "severity", label: "Severity" },
  { field: "priority", label: "Priority" },
  { field: "id", label: "Issue", className: "justify-self-start" },
  { field: "status", label: "Status" },
  { field: "created_at", label: "Created" },
  { field: "assigned_to", label: "Assignee" },
];

interface IssuesTableProps {
  issues: IssueRead[];
  colorMap: Record<string, string>;
  isLoading?: boolean;
  /** Rendered inside the table card when there are no issues. */
  emptyState?: ReactNode;
  /** Rendered inside the table card after the rows (e.g. pagination). */
  footer?: ReactNode;
  /** When provided, the column headers become sortable. */
  sort?: {
    field?: SortField;
    dir?: SortDir;
    onSort: (field: SortField) => void;
  };
}

export function IssuesTable({
  issues,
  colorMap,
  isLoading,
  emptyState,
  footer,
  sort,
}: IssuesTableProps) {
  return (
    <div className="min-w-0 flex-1 rounded-lg border border-border bg-card">
      <div
        className={`grid ${GRID} items-center justify-items-center gap-x-4 border-b border-border bg-muted/30 px-4 py-2`}
      >
        {COLUMNS.map((col) =>
          sort ? (
            <SortableHeader
              key={col.field}
              field={col.field}
              label={col.label}
              currentField={sort.field}
              currentDir={sort.dir}
              onSort={sort.onSort}
              className={col.className}
            />
          ) : (
            <span
              key={col.field}
              className={`text-xs font-semibold uppercase tracking-wide text-muted-foreground ${col.className ?? ""}`}
            >
              {col.label}
            </span>
          ),
        )}
      </div>

      {isLoading ? (
        <div className="space-y-px p-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded" />
          ))}
        </div>
      ) : issues.length === 0 ? (
        (emptyState ?? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No issues found.
          </div>
        ))
      ) : (
        issues.map((issue) => (
          <IssueRow key={issue.id} issue={issue} colorMap={colorMap} />
        ))
      )}

      {footer}
    </div>
  );
}
