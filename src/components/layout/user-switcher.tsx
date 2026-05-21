"use client";

import { useQueries, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api, unwrap } from "@/lib/api/client";
import {
  setCurrentUserId,
  useCurrentUser,
} from "@/lib/auth/current-user";
import { USERS, type HardcodedUser } from "@/lib/auth/users";
import { cn } from "@/lib/utils";

function initials(user: HardcodedUser): string {
  return user.displayName
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function UserAvatar({
  user,
  imageUrl,
  className,
}: {
  user: HardcodedUser;
  imageUrl?: string | null;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-card text-muted-foreground relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border text-xs font-medium select-none",
        className,
      )}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={user.displayName}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{initials(user)}</span>
      )}
    </div>
  );
}

export function UserSwitcher() {
  const current = useCurrentUser();
  const queryClient = useQueryClient();

  // Fetch each user's public profile so the dropdown can show real avatars,
  // not just fallback initials. Endpoint is public-ish (any token can read).
  const userQueries = useQueries({
    queries: USERS.map((user) => ({
      queryKey: ["users", "detail", user.username] as const,
      queryFn: async () =>
        unwrap(
          await api.GET("/api/users/{username}/", {
            params: { path: { username: user.username } },
          }),
        ),
      staleTime: 60_000,
    })),
  });

  const avatarByUsername = new Map<string, string | null | undefined>();
  USERS.forEach((u, i) => {
    avatarByUsername.set(u.username, userQueries[i]?.data?.avatar);
  });

  function pick(id: string) {
    if (id === current.id) return;
    setCurrentUserId(id);
    window.location.reload();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto gap-2 px-2 py-1.5">
          <UserAvatar
            user={current}
            imageUrl={avatarByUsername.get(current.username)}
            className="h-8 w-8"
          />
          <span className="hidden text-sm font-medium sm:inline">
            {current.displayName}
          </span>
          <ChevronsUpDown className="text-muted-foreground h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Switch user</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {USERS.map((user) => {
          const active = user.id === current.id;
          return (
            <DropdownMenuItem
              key={user.id}
              onSelect={() => pick(user.id)}
              className="gap-3"
            >
              <UserAvatar
                user={user}
                imageUrl={avatarByUsername.get(user.username)}
                className="h-8 w-8"
              />
              <div className="min-w-0 flex-1 truncate text-sm font-medium">
                {user.displayName}
              </div>
              {active ? <Check className="h-4 w-4" /> : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
