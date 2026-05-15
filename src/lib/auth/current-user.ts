"use client";

import { useSyncExternalStore } from "react";

import { USERS, type HardcodedUser } from "./users";

const STORAGE_KEY = "it_current_user_id";
const listeners = new Set<() => void>();

function emit() {
  for (const cb of listeners) cb();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getStoredId(): string {
  if (typeof window === "undefined") return USERS[0].id;
  return window.localStorage.getItem(STORAGE_KEY) ?? USERS[0].id;
}

function getServerSnapshot(): string {
  return USERS[0].id;
}

function findUser(id: string): HardcodedUser {
  return USERS.find((u) => u.id === id) ?? USERS[0];
}

/**
 * Read the current user synchronously — used by the API client middleware,
 * which runs outside React. For UI, prefer `useCurrentUser()`.
 */
export function getCurrentUser(): HardcodedUser {
  return findUser(getStoredId());
}

export function setCurrentUserId(id: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, id);
  emit();
}

/** React hook — re-renders the component when the user switches. */
export function useCurrentUser(): HardcodedUser {
  const id = useSyncExternalStore(subscribe, getStoredId, getServerSnapshot);
  return findUser(id);
}
