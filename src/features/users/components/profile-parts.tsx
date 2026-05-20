"use client";

import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { IssuesTable } from "@/features/issues/components/IssuesTable";
import { useIssueColorMap } from "@/features/issues/useColorMap";

import type { components } from "@/lib/api/schema";

type IssueRead = components["schemas"]["IssueRead"];
type CommentRead = components["schemas"]["CommentRead"];

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
  const colorMap = useIssueColorMap();
  return (
    <IssuesTable
      issues={issues}
      colorMap={colorMap}
      emptyState={
        <div className="text-muted-foreground py-8 text-center text-sm italic">
          {empty}
        </div>
      }
    />
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
        <Link
          key={comment.id}
          href={`/${comment.issue}#comment-${comment.id}`}
          className="block"
        >
          <Card className="hover:border-primary/50 transition-colors">
            <CardContent className="space-y-2">
              <span className="text-primary text-sm font-medium">
                Issue #{comment.issue}
              </span>
              <p className="text-sm whitespace-pre-wrap">{comment.text}</p>
              <div className="text-muted-foreground text-xs">
                {formatDateTime(comment.created_at)}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
