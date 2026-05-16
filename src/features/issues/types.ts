// src/features/issues/types.ts

/** Columnas por las que puede ordenarse la lista */
export type SortField =
  | "type"
  | "severity"
  | "priority"
  | "id"
  | "status"
  | "created_at"
  | "assigned_to";

export type SortDir = "asc" | "desc";

/** Convierte field + dir al string `ordering` que espera la API */
export function toOrdering(
  field?: SortField,
  dir?: SortDir,
): string | undefined {
  if (!field) return undefined;
  return dir === "desc" ? `-${field}` : field;
}