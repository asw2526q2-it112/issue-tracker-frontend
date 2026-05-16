"use client";

import { useState } from "react";
import { ColorDot } from "../ColorDot";
import { type components } from "@/lib/api/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Eye, ChevronDown, Clock, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDeleteIssue } from "@/features/issues/queries";

type IssueDetail = components["schemas"]["IssueDetail"];

interface IssueSidebarProps {
  issue: IssueDetail;
  colorMap: Record<string, string>;
}

function getFieldName(field: unknown): string {
  if (typeof field === "string") return field;
  if (typeof field === "object" && field !== null && "name" in field) {
    const obj = field as { name?: unknown };
    return typeof obj.name === "string" ? obj.name : "";
  }
  return String(field ?? "");
}

function initials(username: string) {
  return username.slice(0, 2).toUpperCase();
}

export function IssueSidebar({ issue, colorMap }: IssueSidebarProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  // 1. Inicialitzem el hook de React Query que acabem de crear
  const { mutateAsync: deleteIssueMutation } = useDeleteIssue();

  const statusName = getFieldName(issue.status);
  const typeName = getFieldName(issue.type);
  const severityName = getFieldName(issue.severity);
  const priorityName = getFieldName(issue.priority);

  const assignee = issue.assigned_to as components["schemas"]["UserMini"] | null | undefined;
  const watchers = issue.watchers as components["schemas"]["UserMini"][] | undefined;

  // Funció per executar l'esborrat
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // 2. Executem la mutació passant-li l'ID
      await deleteIssueMutation(issue.id as number);

      setShowDeleteModal(false);
      router.push("/");
    } catch (error) {
      console.error("Error deleting issue:", error);
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-8">
        {/* Status Dropdown */}
        <div>
          <Button variant="outline" className="w-full justify-between font-normal text-muted-foreground border-border bg-card">
            <span className="flex items-center gap-2">
              <span className="text-foreground font-semibold uppercase">{statusName}</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-[#6c757d] text-white">NEW</span>
            </span>
            <ChevronDown className="w-4 h-4 opacity-50" />
          </Button>
        </div>

        {/* Attributes */}
        <div className="flex flex-col gap-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">type</span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{typeName}</span>
              <ColorDot color={colorMap[typeName] ?? "#94a3b8"} title={typeName} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">severity</span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{severityName}</span>
              <ColorDot color={colorMap[severityName] ?? "#94a3b8"} title={severityName} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">priority</span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{priorityName}</span>
              <ColorDot color={colorMap[priorityName] ?? "#94a3b8"} title={priorityName} />
            </div>
          </div>
        </div>

        <hr className="border-border" />

        {/* Assignee */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold uppercase text-muted-foreground">Assigned</span>
          <div className="flex items-center justify-between">
            {assignee ? (
              <div className="flex items-center gap-2">
                <Avatar className="size-6">
                  <AvatarImage src={assignee.avatar ?? undefined} />
                  <AvatarFallback className="text-[10px] bg-muted">
                    {initials(assignee.username)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{assignee.username}</span>
              </div>
            ) : (
              <button className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1">
                + Add assigned
              </button>
            )}
            <button className="text-sm text-primary hover:underline">
              Assign to me
            </button>
          </div>
        </div>

        <hr className="border-border" />

        {/* Watchers */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold uppercase text-muted-foreground">Watchers</span>
          <div className="flex items-center justify-between">
            <button className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1">
              + Add watchers
            </button>
            <button className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1">
              <Eye className="w-4 h-4" /> Watch
            </button>
          </div>

          {/* Watchers list if any */}
          {watchers && watchers.length > 0 && (
            <div className="flex flex-col gap-2 mt-2">
              {watchers.map(watcher => (
                <div key={watcher.id} className="flex items-center gap-2">
                  <Avatar className="size-6">
                    <AvatarImage src={watcher.avatar ?? undefined} />
                    <AvatarFallback className="text-[10px] bg-muted">
                      {initials(watcher.username)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-foreground">{watcher.username}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <hr className="border-border" />

        {/* Bottom Actions */}
        <div className="flex items-center gap-2 mt-4">
          {/* Botó DUE DATE (Rellotge, color claret blau) */}
          <Button variant="secondary" size="icon" className="h-8 w-8 rounded shrink-0 bg-[#f1f3f5] hover:bg-[#e2e6ea]">
            <span className="sr-only">Due Date</span>
            <Clock className="w-4 h-4 text-[#008484]" strokeWidth={2.5} />
          </Button>

          {/* Botó DELETE (Obre el modal) */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded text-muted-foreground hover:text-destructive shrink-0"
            onClick={() => setShowDeleteModal(true)}
          >
            <span className="sr-only">Delete</span>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* OVERLAY DEL MODAL DELETE */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm">
          <div className="flex flex-col items-center bg-transparent p-6 max-w-md w-full text-center">
            <h2 className="text-3xl font-normal mb-6 text-foreground">Delete issue</h2>
            <p className="text-lg mb-2 font-medium">Are you sure you want to delete?</p>
            {/* Suposem que l'issue té un camp subject al schema, si no, fem fallback al ID */}
            <p className="text-base text-muted-foreground mb-10">
              {/* @ts-ignore - ajusta "subject" pel nom real del teu camp si es diu diferent */}
              {issue.subject || `Issue ${issue.id}`}
            </p>

            <div className="flex items-center gap-6">
              <button
                className="text-[#008484] hover:underline font-medium px-4"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <Button
                variant="destructive"
                className="bg-[#e03a3e] hover:bg-[#c93236] text-white px-6 rounded-sm shadow-md"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isDeleting ? "DELETING..." : "DELETE"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}