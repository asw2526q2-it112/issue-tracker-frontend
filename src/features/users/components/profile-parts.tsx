"use client";

import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";

import type { components } from "@/lib/api/schema";

type IssueRead = components["schemas"]["IssueRead"];
type CommentRead = components["schemas"]["CommentRead"];

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AvatarBlock({
  src,
  alt,
  fallbackInitial,
}: {
  src?: string | null;
  alt: string;
  fallbackInitial: string;
}) {
  return (
    <div className="bg-chart-5/30 mb-3 flex aspect-square w-full items-center justify-center overflow-hidden">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <span className="text-5xl font-semibold text-white">
          {fallbackInitial}
        </span>
      )}
    </div>
  );
}

export function Stat({
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

export function IssueTable({
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

export function CommentList({ comments }: { comments: CommentRead[] }) {
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
