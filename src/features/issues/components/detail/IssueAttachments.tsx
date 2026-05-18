import { type components } from "@/lib/api/schema";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type IssueDetail = components["schemas"]["IssueDetail"];

interface IssueAttachmentsProps {
  issue: IssueDetail;
}

export function IssueAttachments({ issue }: IssueAttachmentsProps) {
  const attachments = issue.attachments as components["schemas"]["AttachmentRead"][] | undefined;
  const count = attachments?.length || 0;

  return (
    <div className="flex flex-col gap-2 mt-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-muted/30 px-3 py-2 border border-border">
        <span className="font-semibold text-sm text-foreground">{count} Attachments</span>
        <Button size="icon" variant="ghost" className="h-6 w-6 text-primary hover:text-primary hover:bg-primary/10 rounded-none bg-primary/20">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Attachments List */}
      {attachments && attachments.length > 0 && (
        <div className="flex flex-col gap-2 mt-2">
          {attachments.map(att => (
            <div key={att.id} className="flex items-center gap-2 text-sm border border-border p-2 bg-card">
              <a href={att.file} target="_blank" rel="noreferrer" className="truncate text-primary hover:underline cursor-pointer">{att.original_filename}</a>
            </div>
          ))}
        </div>
      )}

      {/* Dropzone Placeholder */}
      <div className="border-2 border-dashed border-border p-8 flex items-center justify-center bg-card mt-2">
        <span className="text-sm text-muted-foreground">Drop attachments here!</span>
      </div>
    </div>
  );
}
