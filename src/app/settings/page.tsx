import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Settings — stub</CardTitle>
          <CardDescription>
            CRUD for statuses, priorities, severities, types, and tags. The
            React Query hooks{" "}
            <code className="font-mono">useStatuses()</code>,{" "}
            <code className="font-mono">usePriorities()</code>,{" "}
            <code className="font-mono">useSeverities()</code>,{" "}
            <code className="font-mono">useTypes()</code>, and{" "}
            <code className="font-mono">useTags()</code> from{" "}
            <code className="font-mono">@/features/settings/queries</code> are
            already wired against the corresponding{" "}
            <code className="font-mono">/api/settings/*</code> endpoints.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Replace this card with the actual CRUD UI when ready.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
