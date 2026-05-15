"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/lib/auth/current-user";
import { useMe } from "@/features/users/queries";

export function CurrentUserCard() {
  const local = useCurrentUser();
  const { data, isLoading, error } = useMe();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          API connectivity check
          {data ? (
            <CheckCircle2 className="text-primary h-5 w-5" />
          ) : error ? (
            <AlertCircle className="text-destructive h-5 w-5" />
          ) : null}
        </CardTitle>
        <CardDescription>
          Hits <code className="font-mono">GET /api/me/</code> using the active
          token. Switch users in the header — this should refetch.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-muted-foreground text-xs uppercase">
            Selected in dropdown
          </div>
          <div className="font-medium">
            {local.displayName}{" "}
            <span className="text-muted-foreground">
              (@{local.username})
            </span>
          </div>
        </div>

        <div>
          <div className="text-muted-foreground text-xs uppercase">
            Returned by API
          </div>
          {isLoading ? (
            <Skeleton className="mt-1 h-5 w-48" />
          ) : error ? (
            <div className="text-destructive text-sm">
              {error instanceof Error ? error.message : "Request failed"}
            </div>
          ) : data ? (
            <div className="flex items-center gap-2 font-medium">
              {data.first_name} {data.last_name}{" "}
              <span className="text-muted-foreground">(@{data.username})</span>
              {data.username === local.username ? (
                <Badge variant="secondary">match</Badge>
              ) : (
                <Badge variant="destructive">mismatch</Badge>
              )}
            </div>
          ) : null}
        </div>

        {data ? (
          <div className="text-muted-foreground grid grid-cols-3 gap-2 border-t pt-3 text-sm">
            <div>
              <div className="text-xs uppercase">Assigned</div>
              <div className="text-foreground font-medium">
                {data.assigned.length}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase">Watched</div>
              <div className="text-foreground font-medium">
                {data.watched.length}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase">Comments</div>
              <div className="text-foreground font-medium">
                {data.comments.length}
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
