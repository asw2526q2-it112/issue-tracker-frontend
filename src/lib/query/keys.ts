/**
 * Centralised query key factories.
 *
 * Each feature exports its own keys; this file just re-exports them so callers
 * can do `qk.issues.list({...})` without importing across the whole tree.
 */
export const qk = {
  issues: {
    all: ["issues"] as const,
    list: (params?: Record<string, unknown>) =>
      [...qk.issues.all, "list", params ?? {}] as const,
    detail: (id: number) => [...qk.issues.all, "detail", id] as const,
  },
  me: {
    all: ["me"] as const,
    detail: () => [...qk.me.all, "detail"] as const,
  },
  settings: {
    all: ["settings"] as const,
    statuses: () => [...qk.settings.all, "statuses"] as const,
    priorities: () => [...qk.settings.all, "priorities"] as const,
    severities: () => [...qk.settings.all, "severities"] as const,
    types: () => [...qk.settings.all, "types"] as const,
    tags: () => [...qk.settings.all, "tags"] as const,
  },
} as const;
