"use client";

import { AlertCircle, Copy, Eye, List, MessageSquare, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrentUser } from "@/lib/auth/current-user";
import { AvatarControls } from "@/features/users/components/avatar-controls";
import { EditProfileForm } from "@/features/users/components/edit-profile-form";
import { useMe, useUpdateMe } from "@/features/users/queries";

import type { components } from "@/lib/api/schema";

type IssueRead = components["schemas"]["IssueRead"];
type CommentRead = components["schemas"]["CommentRead"];

const TAB_VALUES = ["edit", "assigned", "watched", "comments"] as const;
type TabValue = (typeof TAB_VALUES)[number];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ProfileView() {
  const local = useCurrentUser();
  const { data, isLoading, error } = useMe();
  const updateMe = useUpdateMe();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab");
  const activeTab: TabValue = (TAB_VALUES as readonly string[]).includes(
    rawTab ?? "",
  )
    ? (rawTab as TabValue)
    : "edit";

  const setTab = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", value);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  if (isLoading) return <ProfileSkeleton />;

  if (error || !data) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 pt-6">
          <AlertCircle className="text-destructive h-5 w-5" />
          <p className="text-sm">
            Couldn&apos;t load profile:{" "}
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const fullName =
    `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim() ||
    local.displayName;
  const firstInitial = (data.username[0] ?? "?").toUpperCase();

  return (
    <div className="flex flex-col gap-10 md:flex-row md:items-start">
      <aside className="flex w-full shrink-0 flex-col md:w-40">
        <div className="bg-chart-5/30 mb-3 flex aspect-square w-full items-center justify-center overflow-hidden">
          {data.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.avatar}
              alt={fullName}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-5xl font-semibold text-white">
              {firstInitial}
            </span>
          )}
        </div>

        <AvatarControls me={data} />

        <div className="mt-4 mb-4">
          <h2 className="text-primary text-xl leading-tight font-medium">
            {fullName}
          </h2>
          <div className="text-muted-foreground text-sm">@{data.username}</div>
        </div>

        <div className="bg-border mb-4 h-px w-full" />

        <div className="mb-4 flex justify-between gap-2 text-center">
          <Stat number={data.assigned.length} label={<>Assigned<br />Issues</>} />
          <Stat number={data.watched.length} label={<>Watched<br />Issues</>} />
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
          <TabsList
            variant="line"
            className="w-full justify-start border-b"
          >
            <TabsTrigger value="edit" className="gap-2 px-4 py-2.5">
              <User className="opacity-60 [&]:stroke-[1.5]" />
              Edit Profile
            </TabsTrigger>
            <TabsTrigger value="assigned" className="gap-2 px-4 py-2.5">
              <List className="opacity-60 [&]:stroke-[1.5]" />
              Assigned Issues
            </TabsTrigger>
            <TabsTrigger value="watched" className="gap-2 px-4 py-2.5">
              <Eye className="opacity-60 [&]:stroke-[1.5]" />
              Watched Issues
            </TabsTrigger>
            <TabsTrigger value="comments" className="gap-2 px-4 py-2.5">
              <MessageSquare className="opacity-60 [&]:stroke-[1.5]" />
              Comments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="mt-5 flex flex-col gap-8">
            <EditProfileForm
              me={data}
              submitting={updateMe.isPending}
              onSubmit={async (values) => {
                await updateMe.mutateAsync(values);
              }}
            />
            <ApiTokenCard token={local.token} />
          </TabsContent>
          <TabsContent value="assigned" className="mt-5">
            <IssueTable issues={data.assigned} empty="No assigned issues." />
          </TabsContent>
          <TabsContent value="watched" className="mt-5">
            <IssueTable
              issues={data.watched}
              empty="You are not watching any issues."
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

function ApiTokenCard({ token }: { token: string }) {
  async function copy() {
    await navigator.clipboard.writeText(token);
    toast.success("Token copied to clipboard.");
  }

  return (
    <section className="bg-card flex flex-col gap-3 rounded-md border p-5">
      <header>
        <h3 className="text-lg font-medium">API Token</h3>
        <p className="text-muted-foreground text-sm">
          Use with{" "}
          <code className="font-mono">Authorization: Token &lt;value&gt;</code>{" "}
          to call the REST API from scripts.
        </p>
      </header>
      <div className="bg-muted flex items-center gap-2 rounded-md p-3 font-mono text-sm">
        <code className="flex-1 truncate">{token}</code>
        <Button type="button" size="sm" variant="ghost" onClick={copy}>
          <Copy className="h-4 w-4" />
          Copy
        </Button>
      </div>
    </section>
  );
}

function Stat({
  number,
  label,
}: {
  number: number;
  label: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-center">
      <span className="text-foreground text-2xl font-semibold">{number}</span>
      <span className="text-muted-foreground mt-1 text-xs leading-tight">
        {label}
      </span>
    </div>
  );
}

function IssueTable({
  issues,
  empty,
}: {
  issues: IssueRead[];
  empty: string;
}) {
  if (issues.length === 0) {
    return (
      <Card>
        <CardContent className="text-muted-foreground py-8 text-center text-sm italic">
          {empty}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="bg-card overflow-hidden rounded-md border">
      <div className="text-muted-foreground bg-muted/40 grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 border-b px-4 py-2 text-xs font-medium uppercase">
        <div>Issue</div>
        <div className="hidden sm:block">Type</div>
        <div className="hidden sm:block">Severity</div>
        <div className="hidden sm:block">Priority</div>
        <div>Status</div>
      </div>
      <ul className="divide-y">
        {issues.map((issue) => (
          <li
            key={issue.id}
            className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-4 py-3"
          >
            <div className="min-w-0">
              <Link
                href={`/issues/${issue.id}`}
                className="hover:text-primary text-sm font-medium"
              >
                <span className="text-muted-foreground mr-1.5 text-xs">
                  #{issue.id}
                </span>
                {issue.subject}
              </Link>
              <div className="text-muted-foreground mt-0.5 text-xs">
                {formatDate(issue.modified_at)}
              </div>
            </div>
            <span className="text-muted-foreground hidden text-xs sm:block">
              {issue.type || "—"}
            </span>
            <span className="text-muted-foreground hidden text-xs sm:block">
              {issue.severity || "—"}
            </span>
            <span className="text-muted-foreground hidden text-xs sm:block">
              {issue.priority || "—"}
            </span>
            <span className="text-foreground text-xs font-medium">
              {issue.status || "—"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CommentList({ comments }: { comments: CommentRead[] }) {
  if (comments.length === 0) {
    return (
      <Card>
        <CardContent className="text-muted-foreground py-8 text-center text-sm italic">
          No comments yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {comments.map((comment) => (
        <Card key={comment.id}>
          <CardContent className="space-y-2 pt-5">
            <Link
              href={`/issues/${comment.issue}#comment-${comment.id}`}
              className="text-primary text-sm font-medium hover:underline"
            >
              #{comment.issue}
            </Link>
            <p className="text-sm whitespace-pre-wrap">{comment.text}</p>
            <div className="text-muted-foreground text-xs">
              {formatDateTime(comment.created_at)}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-10 md:flex-row">
      <aside className="flex w-full shrink-0 flex-col gap-3 md:w-40">
        <Skeleton className="aspect-square w-full rounded-none" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-20" />
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 flex-1" />
        </div>
      </aside>
      <div className="flex flex-1 flex-col gap-4">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}
