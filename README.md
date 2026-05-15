# Issue Tracker — Frontend

Next.js 16 frontend for the [Taiga-inspired Django issue tracker](https://github.com/asw2526q2-it112/issue-tracker). Phase 3 of the ASW Q2 25-26 project.

**Team it112:** Pol Nebot · Oriol Berruezo · Llorenç Codinach · Gabriel Escobar

## Stack

- **Next.js 16** (App Router, Turbopack) + React 19 + TypeScript
- **Tailwind CSS v4** + **shadcn/ui** (Taiga-inspired teal theme, Open Sans)
- **TanStack Query** for server state
- **React Hook Form** + **Zod** for forms and validation
- **openapi-typescript** + **openapi-fetch** for typed access to the Django REST API
- ESLint + Prettier (with `prettier-plugin-tailwindcss`)
- pnpm

## Setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Then visit `http://localhost:3000`. By default the frontend talks to the **deployed** Django API at `https://issue-tracker-4lug.onrender.com`, so you don't need a local backend running. To target a local Django server instead, edit `.env.local` and uncomment the `localhost:8000` line (note: the local backend would also need `http://localhost:3000` added to `CORS_ALLOWED_ORIGINS` in `config/settings.py`).

## Scripts

| Script | What it does |
|---|---|
| `pnpm dev` | Next dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm format` / `pnpm format:check` | Prettier |
| `pnpm api:types` | Regenerate `src/lib/api/schema.ts` from `../issue-tracker/api/api.yml` |

Run `pnpm api:types` whenever the backend OpenAPI schema changes. Run `typecheck + lint + build` before opening a PR.

## Folder structure

```
src/
├── app/              Next.js App Router — routes only, thin
├── components/
│   ├── ui/           shadcn/ui primitives (owned, editable)
│   └── layout/       app-level shells: navbars, sidebars, footers
├── features/         feature modules — one folder per domain
│   ├── issues/
│   │   ├── queries.ts    React Query hooks
│   │   ├── schemas.ts    Zod form schemas
│   │   └── components/   feature-specific React components
│   ├── users/
│   └── settings/
└── lib/              cross-cutting infrastructure
    ├── api/          typed openapi-fetch client + generated OpenAPI types
    ├── auth/         token storage helpers
    ├── query/        QueryClient provider + key factories
    ├── env.ts        validated env vars (Zod)
    └── utils.ts      shadcn cn() helper
```

### Where does my code go?

| You're writing… | It goes in… |
|---|---|
| A new route / page | `src/app/<route>/page.tsx` |
| A React Query hook | `src/features/<feature>/queries.ts` |
| A Zod schema (forms, validation) | `src/features/<feature>/schemas.ts` |
| A component used by **one feature** | `src/features/<feature>/components/` |
| A component used by **multiple features** | `src/components/<group>/` |
| A new shadcn primitive | `pnpm dlx shadcn@latest add <name>` → lands in `src/components/ui/` |
| A new env var | declare it in `src/lib/env.ts`, document in `.env.example` |
| A cross-cutting helper (date format, etc.) | `src/lib/<area>/` |

### Pages stay thin — features hold the logic

We keep `app/` as a **router + composition** layer. Each `page.tsx` should mostly import from `features/<name>/` and arrange shadcn components. Data fetching, mutations, and forms live in feature modules. This is *not* overengineering — it's the standard App Router pattern and means:

- Two teammates can work on different features in parallel without touching the same files.
- Deleting a feature = deleting one folder.
- Routes are easy to reorganise (e.g. moving `/issues/:id` under `/projects/:p/issues/:id`) because no logic lives in route files.

For trivial pages (e.g. an about page with no data), it's fine to inline JSX directly in `page.tsx`. Use judgement.

## Adding a new page

1. Create the route folder + `page.tsx`:
   ```
   src/app/issues/page.tsx         → /issues
   src/app/issues/[id]/page.tsx    → /issues/:id
   ```

2. Pages are **Server Components by default**. To use hooks (`useQuery`, `useState`, event handlers), either:
   - Add `"use client"` at the top, **or**
   - Keep `page.tsx` as a server shell and import a `"use client"` component from `features/<name>/components/`.

3. Use the feature's query hook instead of calling the API directly:
   ```tsx
   "use client";
   import { useIssues } from "@/features/issues/queries";

   export default function IssuesPage() {
     const { data, isLoading } = useIssues();
     // …
   }
   ```

4. Dynamic-route params arrive as a **Promise** in Next.js 16:
   ```tsx
   export default async function IssueDetail({
     params,
   }: { params: Promise<{ id: string }> }) {
     const { id } = await params;
     // …
   }
   ```

## Adding a new feature module

1. `mkdir src/features/<name>`
2. Add `queries.ts` with React Query hooks calling `api` from `@/lib/api/client`.
3. Add `schemas.ts` with Zod schemas for any forms.
4. Add a key factory entry in `src/lib/query/keys.ts` so query keys stay consistent.
5. (Optional) Add `components/` for feature-specific UI.

## Adding a shadcn component

```bash
pnpm dlx shadcn@latest add <component>
```

Files land in `src/components/ui/`. You own the source — edit it directly to add custom variants. Already installed: `alert-dialog · avatar · badge · button · calendar · card · checkbox · command · dialog · dropdown-menu · form · input · input-group · label · pagination · popover · scroll-area · select · separator · sheet · skeleton · sonner · table · tabs · textarea · tooltip`.

## Auth (hardcoded user switcher)

Phase 3 explicitly skips real authentication. Instead, we keep a small list of users with their DRF tokens hardcoded in [`src/lib/auth/users.ts`](./src/lib/auth/users.ts), and the global header has a dropdown that picks the "active" user. The API client middleware reads that user's token and sends `Authorization: Token <token>` on every request. Switching users invalidates all React Query caches so subsequent requests refetch as the new user.

### Minting tokens

You only need to do this once per teammate, after the corresponding Django user has logged in at least once via Google OAuth.

**Option A — Swagger UI (easiest):**
1. Log into the Django app as the user you want a token for.
2. Open `/api/docs/` and call `POST /api/me/token/rotate/`.
3. Copy the returned token.

**Option B — Django shell:**
```python
python manage.py shell
>>> from rest_framework.authtoken.models import Token
>>> from users.models import User
>>> Token.objects.get_or_create(user=User.objects.get(username="..."))
```

Paste each token into the corresponding `token` field in `src/lib/auth/users.ts` and commit. Tokens are dev-only against the demo database — they're meant to be in the repo.

### Adding or removing users

Edit the `USERS` array in [`src/lib/auth/users.ts`](./src/lib/auth/users.ts). The dropdown picks them up automatically. Keep at least 3 (professor's minimum).

## Theme

Custom CSS variables in `src/app/globals.css` mirror the Django app's Taiga palette (primary `#25c2a0`, background `#f4f5f5`, accent `#7de8d4`, Open Sans). Don't introduce ad-hoc hex colors — extend the variable set.

## Team workflow

GitHub Flow, trunk-based on `main`. Same conventions as the backend repo:

- Branch off `main`: `feature/<name>` for new work, `fix/<name>` for fixes.
- Keep branches short-lived; rebase or merge `main` frequently.
- Open a PR early. Keep PRs small (one feature or one fix).
- **Squash merge** to keep `main` linear.
- Delete the branch after merging.

### Before opening a PR

```bash
pnpm typecheck && pnpm lint && pnpm format:check && pnpm build
```

CI runs the same commands on every PR (see [`.github/workflows/ci.yml`](./.github/workflows/ci.yml)). If you changed forms or any user-facing flow, also smoke-test it in the browser.

### Coordinating with the backend

- API contract changes start with a backend PR that updates DRF serializers → regenerates `api.yml`.
- Frontend PRs that depend on it run `pnpm api:types` to pull the new schema and commit the regenerated `src/lib/api/schema.ts`.
- If you need a backend change to ship a frontend feature, open both PRs and reference them in each other's descriptions.

### Who owns what

No strict ownership — anyone can touch anything. But to avoid stepping on each other:

- Coordinate in Taiga before claiming work on a feature module already in progress.
- When two people need to touch the same file, agree on a merge order or pair on it.

## Deployment

Deployed on **Vercel**, linked to this GitHub repo:

- Pushes to `main` → production deploy.
- Every PR → preview deploy at a unique URL (great for the demo dry run).

The only required env var is `NEXT_PUBLIC_API_BASE_URL`, set in the Vercel project settings to `https://issue-tracker-4lug.onrender.com`. After importing the repo into Vercel, deploys are automatic — no extra config needed.

## Further reading

- [`AGENTS.md`](./AGENTS.md) — context block for coding agents (Claude Code, etc.).
- Backend repo: `../issue-tracker/`.
