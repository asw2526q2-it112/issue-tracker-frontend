"use client";

import { AlertCircle, List, MessageSquare } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AvatarBlock,
  CommentList,
  IssueTable,
  Stat,
} from "@/features/users/components/profile-parts";
import { useUser } from "@/features/users/queries";

const TAB_VALUES = ["assigned", "comments"] as const;
type TabValue = (typeof TAB_VALUES)[number];

export function PublicProfileView({ username }: { username: string }) {
  const { data, isLoading, error } = useUser(username);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab");
  const activeTab: TabValue = (TAB_VALUES as readonly string[]).includes(
    rawTab ?? "",
  )
    ? (rawTab as TabValue)
    : "assigned";

  const setTab = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", value);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  if (isLoading) return <PublicProfileSkeleton />;

  if (error || !data) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 pt-6">
          <AlertCircle className="text-destructive h-5 w-5" />
          <p className="text-sm">
            Couldn&apos;t load @{username}:{" "}
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const fullName =
    `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim() || data.username;
  const firstInitial = (data.username[0] ?? "?").toUpperCase();

  return (
    <div className="flex flex-col gap-10 md:flex-row md:items-start">
      <aside className="flex w-full shrink-0 flex-col md:w-40">
        <AvatarBlock
          src={data.avatar}
          alt={fullName}
          fallbackInitial={firstInitial}
        />

        <div className="mb-4">
          <h2 className="text-primary text-xl leading-tight font-medium">
            {fullName}
          </h2>
          <div className="text-muted-foreground text-sm">@{data.username}</div>
        </div>

        <div className="bg-border mb-4 h-px w-full" />

        <div className="mb-4 flex justify-between gap-2 text-center">
          <Stat
            number={data.assigned.length}
            label={<>Assigned<br />Issues</>}
          />
          <Stat number={data.comments.length} label="Comments" />
        </div>

        <p className="text-foreground/80 text-sm leading-relaxed">
          {data.bio?.trim() || (
            <span className="text-muted-foreground italic">
              No bio provided.
            </span>
          )}
        </p>
      </aside>

      <div className="min-w-0 flex-1">
        <Tabs value={activeTab} onValueChange={setTab}>
          <TabsList variant="line" className="w-full justify-start border-b">
            <TabsTrigger value="assigned" className="gap-2 px-4 py-2.5">
              <List className="opacity-60 [&]:stroke-[1.5]" />
              Assigned Issues
            </TabsTrigger>
            <TabsTrigger value="comments" className="gap-2 px-4 py-2.5">
              <MessageSquare className="opacity-60 [&]:stroke-[1.5]" />
              Comments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assigned" className="mt-5">
            <IssueTable
              issues={data.assigned}
              empty={`@${data.username} has no assigned issues.`}
            />
          </TabsContent>
          <TabsContent value="comments" className="mt-5">
            <CommentList comments={data.comments} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function PublicProfileSkeleton() {
  return (
    <div className="flex flex-col gap-10 md:flex-row">
      <aside className="flex w-full shrink-0 flex-col gap-3 md:w-40">
        <Skeleton className="aspect-square w-full rounded-none" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-20" />
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 flex-1" />
        </div>
      </aside>
      <div className="flex flex-1 flex-col gap-4">
        <Skeleton className="h-10 w-60" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}
