import { type components } from "@/lib/api/schema";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";

type IssueDetail = components["schemas"]["IssueDetail"];

interface IssueActivityProps {
  issue: IssueDetail;
}

function initials(username: string) {
  return username.slice(0, 2).toUpperCase();
}

export function IssueActivity({ issue }: IssueActivityProps) {
  const comments = (issue.comments as components["schemas"]["CommentRead"][] | undefined) || [];
  const activities = (issue.activity as components["schemas"]["ActivityRead"][] | undefined) || [];

  return (
    <div className="flex flex-col gap-4 mt-6">
      {/* Tabs / Header */}
      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2">
        <div className="flex items-center gap-6">
          <button className="text-sm font-semibold text-foreground border-b-2 border-primary pb-2 -mb-[9px]">
            {comments.length} Comments
          </button>
          <button className="text-sm font-medium text-muted-foreground hover:text-foreground pb-2 -mb-[9px]">
            {activities.length} Activities
          </button>
        </div>
        <button className="text-sm text-muted-foreground hover:text-foreground flex items-center">
          Older first <span className="ml-1 text-[10px]">▲</span>
        </button>
      </div>

      {/* Comment Box */}
      <div className="border border-border p-2 bg-card">
        <Textarea 
          placeholder="Type a new comment here" 
          className="min-h-[100px] border-none shadow-none focus-visible:ring-0 resize-none"
        />
      </div>

      {/* Comments List */}
      <div className="flex flex-col gap-6 mt-4">
        {comments.map((comment) => {
          const user = comment.creator as components["schemas"]["UserMini"] | null | undefined;
          
          return (
            <div key={comment.id} className="flex gap-4">
              <Avatar className="size-10 shrink-0">
                <AvatarImage src={user?.avatar ?? undefined} />
                <AvatarFallback className="bg-muted text-sm">
                  {user ? initials(user.username) : "??"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col flex-1 gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-foreground">{user?.username ?? "Unknown"}</span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(comment.created_at), "dd MMM yyyy HH:mm")}
                  </span>
                </div>
                <div className="text-sm text-foreground whitespace-pre-wrap">
                  {comment.text}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
