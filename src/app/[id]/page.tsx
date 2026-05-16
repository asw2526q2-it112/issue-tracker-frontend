import { IssueDetailView } from "../../features/issues/components/detail/IssueDetailView";

export default async function IssuePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);

  if (Number.isNaN(id)) {
    return <div>Invalid issue ID</div>;
  }

  return <IssueDetailView issueId={id} />;
}
