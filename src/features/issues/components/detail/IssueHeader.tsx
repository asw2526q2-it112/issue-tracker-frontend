import Link from "next/link";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type components } from "@/lib/api/schema";
import { ChevronLeft, Plus, X } from "lucide-react";

type IssueDetail = components["schemas"]["IssueDetail"];

interface IssueHeaderProps {
  issue: IssueDetail;
  colorMap: Record<string, string>;
}

function initials(username: string) {
  return username.slice(0, 2).toUpperCase();
}

function getFieldName(field: unknown): string {
  if (typeof field === "string") return field;
  if (typeof field === "object" && field !== null && "name" in field) {
    const obj = field as { name?: unknown };
    return typeof obj.name === "string" ? obj.name : "";
  }
  return String(field ?? "");
}

export function IssueHeader({ issue, colorMap }: IssueHeaderProps) {
  const creator = issue.creator as components["schemas"]["UserMini"] | null | undefined;
  
  // Tags mapping
  const tagsList = issue.tags
    ? String(issue.tags).split(",").map(t => t.trim()).filter(Boolean)
    : [];

  return (
    <div className="flex flex-col border-b border-border pb-4">
      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-normal text-foreground flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-primary/80">#{issue.id}</span>
          <span>{issue.subject}</span>
        </h1>
        <Link 
          href="/"
          className="shrink-0 text-muted-foreground hover:text-foreground flex items-center pt-2"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
        </Link>
      </div>
      
      <div className="mt-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        {/* Tags */}
        <div className="flex items-center flex-wrap gap-2">
          {tagsList.map(tag => {
            // we don't have tag colors mapped in the API easily, just use a default red-ish color for now like the screenshot
            const tagColor = "#e11d48"; // Rose 600 as a placeholder
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
