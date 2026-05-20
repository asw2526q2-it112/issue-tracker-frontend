import { useMemo } from "react";

import { usePriorities, useSeverities, useTypes } from "@/features/settings/queries";

/**
 * Maps issue type/severity/priority *names* to their configured color, so
 * components rendering an issue (which carries those fields by name) can paint
 * the matching dot. Backed by the settings queries, so the cache is shared.
 */
export function useIssueColorMap(): Record<string, string> {
  const { data: types } = useTypes();
  const { data: severities } = useSeverities();
  const { data: priorities } = usePriorities();

  return useMemo(() => {
    const map: Record<string, string> = {};
    for (const item of [
      ...(types?.results ?? []),
      ...(severities?.results ?? []),
      ...(priorities?.results ?? []),
    ]) {
      map[item.name] = item.color;
    }
    return map;
  }, [types, severities, priorities]);
}
