import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CurrentUserCard } from "@/features/users/components/current-user-card";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-3">
        <Badge variant="secondary" className="w-fit">
          ASW Q2 25-26 · it112
        </Badge>
        <h1 className="text-4xl font-semibold tracking-tight">Issue Tracker</h1>
        <p className="max-w-2xl text-muted-foreground">
          Next.js frontend for the Taiga-inspired Django issue tracker. The
          starter is wired with React Query, Zod, React Hook Form, shadcn/ui,
          and typed API access from the OpenAPI spec.
        </p>
      </header>

      <CurrentUserCard />

      <Card>
        <CardHeader>
          <CardTitle>Regenerate types</CardTitle>
          <CardDescription>
            Run <code className="font-mono">pnpm api:types</code> after the
            Django OpenAPI schema changes — reads{" "}
            <code className="font-mono">../issue-tracker/api/api.yml</code> and
            writes typed paths into{" "}
            <code className="font-mono">src/lib/api/schema.ts</code>.
          </CardDescription>
        </CardHeader>
      </Card>
    </main>
  );
}
