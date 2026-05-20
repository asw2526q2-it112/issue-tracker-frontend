"use client";

import { useState } from "react";
import { type components } from "@/lib/api/schema";
import { useUpdateIssue } from "@/features/issues/queries";
import { Bold, Italic, Strikethrough, Link as LinkIcon, List, ListOrdered, AlignLeft, Image as ImageIcon, Quote, Table, Code, Minus, Undo, Redo } from "lucide-react";

type IssueDetail = components["schemas"]["IssueDetail"];

interface IssueDescriptionProps {
  issue: IssueDetail;
  canEdit: boolean;
}

export function IssueDescription({ issue, canEdit }: IssueDescriptionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [desc, setDesc] = useState(issue.description || "");
  const { mutateAsync: updateIssue, isPending } = useUpdateIssue();

  const handleSave = async () => {
    if (desc === issue.description) {
      setIsEditing(false);
      return;
    }
    try {
      await updateIssue({ id: issue.id as number, data: { description: desc } });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating description:", error);
    }
  };

  const handleCancel = () => {
    setDesc(issue.description || "");
    setIsEditing(false);
  };

  if (isEditing && canEdit) {
    return (
      <div className="w-full border border-border rounded-sm bg-card shadow-sm flex flex-col">

        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="w-full min-h-[200px] p-4 focus:outline-none bg-transparent resize-y text-sm text-foreground"
          autoFocus
        />

        <div className="flex items-center justify-between p-2 bg-muted/30 border-t border-border">
          <span className="text-xs font-semibold px-2 text-muted-foreground bg-muted py-1 rounded"></span>
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="bg-muted hover:bg-muted/80 text-foreground px-4 py-1.5 rounded-sm text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isPending}
              className="bg-[#7de8d4] hover:bg-[#5bcbb7] text-[#0a1715] px-4 py-1.5 rounded-sm text-sm font-medium transition-colors"
            >
              {isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`text-sm text-foreground leading-relaxed whitespace-pre-wrap p-2 -mx-2 rounded min-h-[100px] ${canEdit ? 'cursor-text hover:bg-muted/40 transition-colors' : ''}`}
      onClick={() => canEdit && setIsEditing(true)}
    >
      {issue.description || <span className="text-muted-foreground italic">No description provided.{canEdit && " Click to add one."}</span>}
    </div>
  );
}

function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}