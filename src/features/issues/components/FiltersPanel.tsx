// src/features/issues/components/FiltersPanel.tsx
"use client";

import { type components } from "@/lib/api/schema";

type Setting = { id: number; name: string; color: string };
type Status = components["schemas"]["Status"];

interface FiltersPanelProps {
  types: Setting[];
  severities: Setting[];
  priorities: Setting[];
  statuses: Status[];

  selectedType?: number;
  selectedSeverity?: number;
  selectedPriority?: number;
  selectedStatus?: number;

  onChange: (key: "type" | "severity" | "priority" | "status", id: number | undefined) => void;
  onClear: () => void;
  onApply: () => void;
}

interface FilterGroupProps {
  title: string;
  options: { id: number; name: string; color?: string }[];
  selected?: number;
  onChange: (id: number | undefined) => void;
}

function FilterGroup({ title, options, selected, onChange }: FilterGroupProps) {
  return (
    <details className="group border-b border-border" open>
      <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-foreground select-none">
        {title}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform group-open:rotate-180"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      <div className="flex flex-col gap-0.5 px-3 pb-3">
        {options.map((opt) => {
          const checked = selected === opt.id;
          return (
            <label
              key={opt.id}
              className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm hover:bg-muted/60"
            >
              <input
                type="checkbox"
                checked={checked}
                className="accent-primary"
                onChange={() => onChange(checked ? undefined : opt.id)}
              />
              {opt.color && (
                <span
                  className="inline-block size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: opt.color }}
                />
              )}
              {opt.name}
            </label>
          );
        })}
      </div>
    </details>
  );
}

export function FiltersPanel({
  types,
  severities,
  priorities,
  statuses,
  selectedType,
  selectedSeverity,
  selectedPriority,
  selectedStatus,
  onChange,
  onClear,
}: FiltersPanelProps) {
  return (
    <aside className="w-52 shrink-0 rounded-lg border border-border bg-card">
      <FilterGroup
        title="Type"
        options={types}
        selected={selectedType}
        onChange={(id) => onChange("type", id)}
      />
      <FilterGroup
        title="Severity"
        options={severities}
        selected={selectedSeverity}
        onChange={(id) => onChange("severity", id)}
      />
      <FilterGroup
        title="Priority"
        options={priorities}
        selected={selectedPriority}
        onChange={(id) => onChange("priority", id)}
      />
      <FilterGroup
        title="Status"
        options={statuses}
        selected={selectedStatus}
        onChange={(id) => onChange("status", id)}
      />

      <div className="flex items-center justify-between px-3 py-3">
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-muted-foreground hover:text-foreground hover:underline"
        >
          Clear
        </button>
      </div>
    </aside>
  );
}