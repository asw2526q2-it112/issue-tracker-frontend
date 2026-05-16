"use client";

import { useMemo } from "react";
import { useIssue } from "@/features/issues/queries";
import {
  useTypes,
  useSeverities,
  usePriorities,
  useStatuses,
} from "@/features/settings/queries";
import { Skeleton } from "@/components/ui/skeleton";

import { IssueHeader } from "./IssueHeader";
import { IssueSidebar } from "./IssueSidebar";
import { IssueDescription } from "./IssueDescription";
import { IssueAttachments } from "./IssueAttachments";
import { IssueActivity } from "./IssueActivity";

function buildColorMap(
  ...groups: Array<{ name: string; color: string }[] | undefined>
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const group of groups) {
    for (const item of group ?? []) {
      map[item.name] = item.color;
    }
  }
  return map;
}

interface IssueDetailViewProps {
  issueId: number;
}

export function IssueDetailView({ issueId }: IssueDetailViewProps) {
  const { data: issue, isLoading, error } = useIssue(issueId);

  const { data: types = [] } = useTypes();
  const { data: severities = [] } = useSeverities();
  const { data: priorities = [] } = usePriorities();
  const { data: statuses = [] } = useStatuses();

  const typeList = "results" in types ? types.results : types;
  const severityList = "results" in severities ? severities.results : severities;
  const priorityList = "results" in priorities ? priorities.results : priorities;
  const statusList = "results" in statuses ? statuses.results : statuses;

  const colorMap = useMemo(
    () => buildColorMap(typeList, severityList, priorityList, statusList),
    [typeList, severityList, priorityList, statusList]
  );

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="p-8 flex items-center justify-center text-muted-foreground">
        <p>Error loading issue or issue not found.</p>
      </div>
    );
  }

  return (
    <div className="container max-w-[1200px] mx-auto p-4 md:p-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Main Content */}
        <div className="flex-1 flex flex-col gap-8 min-w-0">
          <IssueHeader issue={issue} colorMap={colorMap} />

          <div className="flex flex-col gap-6">
            <IssueDescription issue={issue} />
            <IssueAttachments issue={issue} />
            <IssueActivity issue={issue} />
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="w-full lg:w-72 shrink-0">
          <IssueSidebar issue={issue} colorMap={colorMap} />
        </div>
      </div>
    </div>
  );
}
