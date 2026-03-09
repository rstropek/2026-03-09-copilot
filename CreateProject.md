# Plan: Bootstrap SuperFan Next.js 16 Project

## TL;DR
Scaffold a Next.js 16 (App Router, Turbopack) + TypeScript project called "SuperFan" with SQLite (better-sqlite3), Vitest for unit testing, Biome for linting + formatting (replaces ESLint + Prettier), CSS Modules for styling, and a layered architecture (data access / logic / UI). Use npm. React 19.2. Node.js 20.9+. Ensure all dependencies are at their latest versions.

## Phase 1: Scaffold & Initialize

1. **Create Next.js project** — Run `npx create-next-app@latest` in the workspace root with project name `superfan`. Options: TypeScript ✓, **Biome** for linting (not ESLint), Tailwind ✗ (user chose CSS Modules), `src/` directory ✗, App Router ✓, Turbopack for dev ✓ (default in v16), import alias `@/*`.
   - This produces Next.js 16.x + React 19.2 + TypeScript + Biome config (`biome.json`).
   - Turbopack is the default bundler in v16 — no extra config needed.
   - `create-next-app` generates scripts: `"lint": "biome check"`, `"format": "biome format --write"`.
2. **Initialize git** — `create-next-app` auto-initializes a git repo with a `.gitignore`. Verify it includes `node_modules/`, `.next/`, and add `*.db` for SQLite databases.
3. **Move `Architecture.md`** into the `superfan/` project folder.

## Phase 2: Add Dependencies

4. **Install `better-sqlite3`** + its TypeScript types:
   ```
   npm install better-sqlite3
   npm install -D @types/better-sqlite3
   ```
5. **Install Vitest** + `@vitejs/plugin-react` for React/Next.js compatibility:
   ```
   npm install -D vitest @vitejs/plugin-react
   ```
6. **Verify Biome config** — `create-next-app` with Biome should generate a `biome.json` with Next.js + React rules. Verify it exists and extends the right rules. If needed, fine-tune (e.g., formatter indent style, line width).

## Phase 3: Configure Tooling

7. **Configure Vitest** — Create `vitest.config.ts` at project root with:
   - `@vitejs/plugin-react` plugin
   - Path alias `@/*` matching `tsconfig.json`
   - Test include pattern: `**/*.test.ts` (unit tests only, no e2e per Architecture.md)
8. **Add test scripts** to `package.json`: `"test": "vitest run"`, `"test:watch": "vitest"`
9. **Verify Biome scripts** in `package.json` — should already have `"lint": "biome check"`, `"format": "biome format --write"`. Add `"check": "biome check --write ."` for combined lint+format with auto-fix if not present.

## Phase 4: Layered Architecture Scaffolding

10. **Simplify default page** — Replace the generated `app/page.tsx` with a minimal "Hello World" page (remove default Next.js landing page content and its CSS module). Keep `app/layout.tsx` as-is.
11. **Create directory structure** reflecting the layered architecture:
    ```
    app/            — Next.js App Router (UI layer — pages, layouts, components)
      layout.tsx    (generated, keep as-is)
      page.tsx      (simplify to Hello World)
    lib/            — Business logic layer (pure functions, services)
    data/           — Data access layer (SQLite repository, DB initialization)
    types/          — Shared TypeScript types/interfaces
    ```
    - `data/` will house the DB connection singleton and repository modules.
    - `lib/` will house service/logic modules that call into `data/`.
    - `app/` (already exists) is the UI layer that calls into `lib/`.
    - `types/` holds shared interfaces (e.g., `Hero` type).
12. **Create DB initialization module** — `data/db.ts` that opens/creates the SQLite database file (`superfan.db`) using `better-sqlite3`, exports a singleton connection. No tables yet — schema will be added later.
13. **Create a placeholder type** — `types/hero.ts` with a `Hero` interface stub.
14. **Create a sample unit test** — `lib/__tests__/sample.test.ts` to verify Vitest runs correctly.

## Phase 5: Verify & Finalize

16. **Audit dependency versions** — Run `npm outdated` and `npm audit` to confirm no outdated or vulnerable packages.
17. **Verify build** — `npm run build` must succeed (note: `next build` no longer runs linting in v16).
18. **Verify lint** — `npm run lint` must pass (calls `biome check`).
19. **Verify tests** — `npm run test` must pass.
20. **Verify format** — Run `biome format .` to check formatting.
21. **Update `.gitignore`** — Ensure `*.db` is listed so SQLite database files are not committed.
22. **Initial git commit**.

## Relevant Files (post-creation)

- `package.json` — scripts, dependencies
- `tsconfig.json` — TypeScript config with path aliases (created by create-next-app)
- `next.config.ts` — Next.js 16 configuration (TypeScript by default)
- `biome.json` — Biome configuration for linting + formatting (created by create-next-app)
- `vitest.config.ts` — Vitest configuration (to create)
- `data/db.ts` — SQLite connection singleton (to create)
- `types/hero.ts` — Shared Hero type (to create)
- `lib/__tests__/sample.test.ts` — Sample test (to create)
- `.gitignore` — git ignore (to update with *.db)

## Verification

1. `npm run build` — compiles without errors
2. `npm run lint` — Biome check runs, no warnings/errors
3. `npm run test` — Vitest runs and the sample test passes
4. `npm run format` — Biome formats all files
5. `npm outdated` — no outdated dependencies
6. `npm audit` — no known vulnerabilities

## Decisions

- **Next.js 16** (latest 16.1.6) with **Turbopack** as default bundler
- **React 19.2** (ships with Next.js 16)
- **Node.js 20.9+** required (v18 dropped)
- **npm** as package manager (user choice)
- **App Router** (user choice) — no Pages Router
- **CSS Modules** for styling (user choice) — no Tailwind
- **Vitest** for unit testing (user choice) — no Jest, no e2e/integration tests per Architecture.md
- **better-sqlite3** for SQLite (user choice) — no ORM
- **Biome** for linting + formatting (replaces ESLint + Prettier) — single tool, single config
- **No `src/` directory** — `app/`, `lib/`, `data/`, `types/` at project root
- `Architecture.md` moved into `superfan/` project folder
