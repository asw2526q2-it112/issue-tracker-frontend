import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function IssuesPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Issues</h1>
      <Card>
        <CardHeader>
          <CardTitle>Issue list — stub</CardTitle>
          <CardDescription>
            This is where the paginated issue list, filters, and search will
            live. The React Query hook{" "}
            <code className="font-mono">useIssues()</code> from{" "}
            <code className="font-mono">@/features/issues/queries</code> is
            already wired against{" "}
            <code className="font-mono">GET /api/issues/</code> with the
            active user&apos;s token.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Pick this up by replacing this card with a real table — see{" "}
            <code className="font-mono">README.md</code> for the &ldquo;Adding
            a new page&rdquo; recipe.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
