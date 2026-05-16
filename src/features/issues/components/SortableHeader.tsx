// src/features/issues/components/SortableHeader.tsx
import { type SortDir, type SortField } from "../types";

interface SortableHeaderProps {
  field: SortField;
  label: string;
  currentField?: SortField;
  currentDir?: SortDir;
  onSort: (field: SortField) => void;
  className?: string;
}

export function SortableHeader({
  field,
  label,
  currentField,
  currentDir,
  onSort,
  className = "",
}: SortableHeaderProps) {
  const isActive = currentField === field;

  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground ${className}`}
    >
      {label}
      <span className="flex flex-col gap-px">
        {/* flecha arriba — activa si asc */}
        <svg
          viewBox="0 0 16 7"
          width="10"
          height="6"
          className={
            isActive && currentDir === "asc"
              ? "fill-primary"
              : "fill-muted-foreground/40"
          }
        >
          <path d="M11.6232 6.57199C12.5713 6.57199 12.9872 5.37569 12.2435 4.7876L8.62027 1.92248C8.25672 1.635 7.74328 1.635 7.37973 1.92248L3.75652 4.7876C3.01283 5.37569 3.42868 6.57199 4.37679 6.57199L11.6232 6.57199Z" />
        </svg>
        {/* flecha abajo — activa si desc */}
        <svg
          viewBox="0 0 16 7"
          width="10"
          height="6"
          className={
            isActive && currentDir === "desc"
              ? "fill-primary"
              : "fill-muted-foreground/40"
          }
        >
          <path d="M11.6232 0C12.5713 0 12.9872 1.19628 12.2435 1.78437L8.62027 4.64949C8.25672 4.93693 7.74328 4.93693 7.37973 4.64949L3.75652 1.78437C3.01283 1.19628 3.42868 0 4.37679 0H11.6232Z" />
        </svg>
      </span>
    </button>
  );
}