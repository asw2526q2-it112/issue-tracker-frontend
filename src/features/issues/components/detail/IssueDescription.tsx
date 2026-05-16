import { type components } from "@/lib/api/schema";

type IssueDetail = components["schemas"]["IssueDetail"];

interface IssueDescriptionProps {
  issue: IssueDetail;
}

export function IssueDescription({ issue }: IssueDescriptionProps) {
  return (
    <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
      {issue.description || <span className="text-muted-foreground italic">No description provided.</span>}
    </div>
  );
}
