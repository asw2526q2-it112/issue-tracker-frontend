"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type components } from "@/lib/api/schema";
import { ChevronLeft, Plus, X, Pencil, Save } from "lucide-react";
import { useUpdateIssue } from "@/features/issues/queries";

type IssueDetail = components["schemas"]["IssueDetail"];

interface IssueHeaderProps {
  issue: IssueDetail;
  colorMap: Record<string, string>;
  canEdit: boolean;
}

function initials(username: string) {
  return username.slice(0, 2).toUpperCase();
}

export function IssueHeader({ issue, colorMap, canEdit }: IssueHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(issue.subject);

  const { mutateAsync: updateIssue, isPending } = useUpdateIssue();
  const creator = issue.creator as components["schemas"]["UserMini"] | null | undefined;

  const tagsList = issue.tags
    ? String(issue.tags).split(",").map(t => t.trim()).filter(Boolean)
    : [];

  const handleSave = async () => {
    if (!title.trim() || title === issue.subject) {
      setIsEditing(false);
      setTitle(issue.subject);
      return;
    }
    try {
      await updateIssue({ id: issue.id as number, data: { subject: title } });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating title:", error);
    }
  };

  return (
    <div className="flex flex-col border-b border-border pb-4">
      <div className="flex items-start justify-between">

        {isEditing && canEdit ? (
          <div className="flex items-center gap-2 w-full max-w-3xl flex-1 mr-4">
            <span className="font-semibold text-primary/80 text-2xl">#{issue.id}</span>
            <div className="flex items-center gap-1 flex-1 border border-border bg-card rounded-sm px-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1 px-2 py-1.5 focus:outline-none bg-transparent text-xl text-foreground"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
              />
              <button onClick={handleSave} disabled={isPending} className="p-1.5 hover:bg-muted rounded text-foreground">
                <Save className="w-5 h-5" />
              </button>
              <button onClick={() => { setIsEditing(false); setTitle(issue.subject); }} className="p-1.5 hover:bg-muted rounded text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <h1
            className={`text-2xl font-normal text-foreground flex items-center gap-2 flex-wrap w-fit ${canEdit ? 'group cursor-text' : ''}`}
            onClick={() => canEdit && setIsEditing(true)}
          >
            <span className="font-semibold text-primary/80">#{issue.id}</span>
            <span>{issue.subject}</span>
            {canEdit && <Pencil className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ml-1" />}
          </h1>
        )}

        <Link
          href="/"
          className="shrink-0 text-muted-foreground hover:text-foreground flex items-center pt-2 ml-auto"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
        </Link>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        {/* Tags */}
        <div className="flex items-center flex-wrap gap-2">
          {tagsList.map(tag => {
            const tagColor = "#e11d48";
            return (
              <span
                key={tag}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded text-white text-xs font-medium"
                style={{ backgroundColor: tagColor }}
              >
                {tag}
                <button className="hover:bg-black/20 rounded-full p-0.5 -mr-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
          <button className="text-primary text-sm font-medium hover:underline flex items-center">
            Add tag <Plus className="w-3 h-3 ml-0.5" />
          </button>
        </div>

        {/* Creator and Date */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground text-right">
          <div className="flex flex-col items-end">
            <span className="flex items-center gap-1">
              Created by <span className="text-primary font-medium">{creator?.username ?? "Unknown"}</span>
            </span>
            <span>{format(new Date(issue.created_at), "dd MMM yyyy HH:mm")}</span>
          </div>
          {creator && (
            <Avatar className="size-8 border border-border">
              <AvatarImage src={creator.avatar ?? undefined} />
              <AvatarFallback className="text-xs bg-muted">
                {initials(creator.username)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </div>
  );
}