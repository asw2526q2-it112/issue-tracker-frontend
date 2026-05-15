"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  setCurrentUserId,
  useCurrentUser,
} from "@/lib/auth/current-user";
import { USERS, type HardcodedUser } from "@/lib/auth/users";

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
  className,
}: {
  user: HardcodedUser;
  className?: string;
}) {
  return (
    <Avatar className={className}>
      {user.avatarUrl ? (
        <AvatarImage src={user.avatarUrl} alt={user.displayName} />
      ) : null}
      <AvatarFallback>{initials(user)}</AvatarFallback>
    </Avatar>
  );
}

export function UserSwitcher() {
  const current = useCurrentUser();
  const queryClient = useQueryClient();

  function pick(id: string) {
    if (id === current.id) return;
    setCurrentUserId(id);
    // New user => new token => all cached data is stale.
    queryClient.invalidateQueries();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto gap-2 px-2 py-1.5">
          <UserAvatar user={current} className="h-8 w-8" />
          <div className="hidden text-left sm:block">
            <div className="text-sm leading-tight font-medium">
              {current.displayName}
            </div>
            <div className="text-muted-foreground text-xs leading-tight">
              {current.email}
            </div>
          </div>
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
              <UserAvatar user={user} className="h-8 w-8" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">
                  {user.displayName}
                </div>
                <div className="text-muted-foreground truncate text-xs">
                  {user.email}
                </div>
              </div>
              {active ? <Check className="h-4 w-4" /> : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
