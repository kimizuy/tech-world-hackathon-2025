# Repository Guidelines

## Project Structure & Module Organization

Next.js 16 App Router drives everything under `src/app`. Feature folders like `rooms`, `demo`, and `pricing` contain their `page.tsx`, optional `layout.tsx`, and colocated styles or utilities. Shared UI lives in `src/app/components`, server actions in `src/app/actions`, and API route handlers in `src/app/api`. Drizzle ORM schema files go in `src/db/schema` with exports from `src/db/index.ts`; update `drizzle.config.ts` when adding tables. Static assets belong in `public/`, and imports should use the `@/` alias defined in `tsconfig.json`.

## Build, Test, and Development Commands

- `npm run dev` — Launches the dev server on `localhost:3000`.
- `npm run build` / `npm run start` — Creates and serves the production bundle; Lefthook’s pre-push hook already runs `build`.
- `npm run lint` / `npm run format` — Run ESLint (core-web-vitals + TypeScript) and Prettier 3 formatting.
- `npm run db:generate`, `db:migrate`, `db:push` — Create, apply, and push Drizzle migrations after editing `src/db/schema`.
- `npm run db:studio` — Open Drizzle Studio to inspect TiDB state.
- `npm run prepare` — Install Lefthook so the shared hooks execute locally.

## Coding Style & Naming Conventions

TypeScript is strict, so annotate props, server actions, and DB helpers explicitly. Stick to function components, Tailwind utility classes in JSX, 2-space Prettier formatting, and double quotes. Folder and route names stay lowercase with dashes, components use PascalCase, and helpers stay camelCase. Prefer `@/` imports over relative traversals and let ESLint flag unsafe patterns.

### File Naming

Use snake_case for all file names (e.g., `subscription_form.tsx`, `create_token.ts`). Exceptions are Next.js conventions like `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, and `route.ts`.

### Export Style

Use named exports instead of default exports. This improves refactoring, auto-imports, and prevents naming inconsistencies.

```tsx
// Good
export function SubscriptionForm() { ... }

// Avoid
export default function SubscriptionForm() { ... }
```

## Testing Guidelines

Automated tests are not configured yet; every PR must describe manual checks (cover `/rooms/[roomName]`, `/demo`, and `/api/health` at minimum). When adding tests, place `*.test.ts[x]` files alongside the feature, lean on React Testing Library or Playwright, and mock Drizzle + LiveKit calls so CI can run without secrets. Always run `npm run lint` and `npm run build` before pushing to satisfy Lefthook.

## Commit & Pull Request Guidelines

History uses `<type>: <summary>` (`fix`, `feat`, `chore`, etc.); keep commits focused so the auto-formatting hooks can rewrite staged files cleanly. PRs should explain the problem, link issues, list schema or env steps (`db:push`, `.env.local` edits), and attach screenshots for UI updates. Document manual test evidence and call out any migrations or secrets reviewers need.

## Environment & Configuration

Copy `.env.example` to `.env.local` and set `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `NEXT_PUBLIC_LIVEKIT_URL`, and `DATABASE_URL`. Never commit secrets or database dumps; TiDB connectivity flows through `DATABASE_URL` plus `drizzle.config.ts`. Rotate credentials after demos and keep `.env.local` out of Git.
