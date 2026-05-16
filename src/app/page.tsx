import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { IssueListView } from "@/features/issues/components/IssueListView";

export const metadata = {
  title: "Issues — Issue Tracker",
};

function IssueListFallback() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-10 w-72" />
      <div className="flex gap-5">
        <Skeleton className="h-80 w-52 shrink-0" />
        <Skeleton className="h-80 flex-1" />
      </div>
    </div>
  );
}

export default function IssuesPage() {
  return (
    <Suspense fallback={<IssueListFallback />}>
      <IssueListView />
    </Suspense>
  );
}