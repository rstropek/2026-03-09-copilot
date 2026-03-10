# SuperFan

A web application for tracking and celebrating your favourite superheroes. Built with Next.js 16, TypeScript, and SQLite.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Database & Migrations](#database--migrations)
- [API Reference](#api-reference)
- [Available Scripts](#available-scripts)
- [Code Style & Linting](#code-style--linting)
- [Testing](#testing)
- [Contributing](#contributing)

---

## Features

- Browse all heroes in a clean list view
- Add new heroes with name, real name, first appearance, superpowers, and a coolness factor (0–5)
- Persistent storage via a local SQLite database
- REST API for heroes (`GET /api/heroes`, `POST /api/heroes`)

## Tech Stack

| Concern | Tool |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| Language | [TypeScript 5](https://www.typescriptlang.org) |
| UI | React 19.2, CSS Modules |
| Database | [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) (SQLite) |
| Linting & Formatting | [Biome](https://biomejs.dev) |
| Testing | [Vitest](https://vitest.dev) |
| Package Manager | npm |

## Prerequisites

- **Node.js 20.9 or later** — check with `node --version`
- **npm** — ships with Node.js

## Getting Started

```bash
# 1. Clone the repository
git clone <repo-url>
cd superfan

# 2. Install dependencies
npm install

# 3. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The database file (`superfan.db`) and all migrations are applied automatically on first start — no manual setup required.

## Project Structure

```
superfan/
├── app/                   # UI layer — Next.js App Router pages & components
│   ├── api/
│   │   └── heroes/
│   │       └── route.ts   # REST API endpoints (GET, POST)
│   ├── heroes/
│   │   ├── new/           # "Add hero" page
│   │   ├── HeroList.tsx   # Hero list component
│   │   └── page.tsx       # Heroes listing page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home / landing page
├── data/                  # Data access layer
│   ├── db.ts              # SQLite connection singleton
│   ├── heroes.ts          # Hero repository (getAllHeroes, createHero)
│   └── migrate.ts         # Migration runner
├── lib/                   # Business logic layer
│   ├── heroFormatters.ts  # Pure helper functions (star rating, name formatting)
│   └── __tests__/         # Unit tests for lib/
├── migrations/            # SQL migration files (applied in order)
│   └── 001_create_heroes.sql
├── types/
│   └── hero.ts            # Shared TypeScript interfaces
├── biome.json             # Biome linter/formatter config
├── vitest.config.ts       # Vitest config
└── package.json
```

## Architecture

The codebase follows a **three-layer architecture**:

```
app/  (UI)  →  lib/  (logic)  →  data/  (data access)
```

- **`app/`** — Pages, layouts, and UI components. May call `data/` directly for simple read operations, or `lib/` for anything that involves business logic.
- **`lib/`** — Pure functions and services containing business logic. No direct database access; delegates to `data/`.
- **`data/`** — All SQLite interactions. Exports typed repository functions; the rest of the codebase never writes raw SQL outside this layer.
- **`types/`** — Shared TypeScript interfaces used across all layers.

> Keep this separation strict. Database queries belong in `data/`, transformations and rules belong in `lib/`, and rendering belongs in `app/`.

## Database & Migrations

The app uses a file-based SQLite database (`superfan.db`, created at the project root). Migrations live in `migrations/` as plain `.sql` files named with a numeric prefix (`001_`, `002_`, …). They are applied automatically in alphabetical order at startup via `data/migrate.ts`, which tracks applied migrations in a `_migrations` table.

**To add a migration:**

1. Create `migrations/NNN_description.sql` (increment the number).
2. Write idempotent SQL (use `IF NOT EXISTS` / `IF EXISTS` where appropriate).
3. Restart the dev server — the migration runs automatically.

**To run migrations manually** (useful in CI or production):

```bash
npm run migrate
```

`superfan.db` is listed in `.gitignore` and must never be committed.

## API Reference

### `GET /api/heroes`

Returns all heroes ordered by most recently added.

**Response `200`**

```json
[
  {
    "id": 1,
    "name": "Spider-Man",
    "real_name": "Peter Parker",
    "first_appearance": "Amazing Fantasy #15 (1962)",
    "super_powers": ["wall-crawling", "spider-sense", "web-shooting"],
    "coolness_factor": 5
  }
]
```

### `POST /api/heroes`

Creates a new hero.

**Request body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | `string` | ✅ | Hero name |
| `real_name` | `string \| null` | — | Civilian identity |
| `first_appearance` | `string` | ✅ | e.g. `"Amazing Fantasy #15 (1962)"` |
| `super_powers` | `string[]` | — | Defaults to `[]` |
| `coolness_factor` | `number` | ✅ | Integer 0–5 |

**Response `201`** — the created hero object.  
**Response `400`** — validation error with an `error` field.

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server with Turbopack at [localhost:3000](http://localhost:3000) |
| `npm run build` | Production build |
| `npm start` | Start production server (requires build first) |
| `npm run lint` | Run Biome linter |
| `npm run format` | Format all files with Biome |
| `npm run check` | Lint + format with auto-fix |
| `npm test` | Run unit tests once |
| `npm run test:watch` | Run unit tests in watch mode |
| `npm run migrate` | Apply pending database migrations |

## Code Style & Linting

This project uses **[Biome](https://biomejs.dev)** for both linting and formatting (replaces ESLint + Prettier).

Key style rules (see `biome.json`):

- Indent with **tabs**
- **Double quotes** for strings
- Recommended Biome lint rules enabled
- Imports organised automatically

Before opening a pull request, run:

```bash
npm run check   # lint + format with auto-fix
```

The CI pipeline will reject PRs that fail `npm run lint`.

## Testing

Tests are written with **[Vitest](https://vitest.dev)** and live next to the code they test in `__tests__/` subdirectories. Only unit tests are in scope (no integration or end-to-end tests).

```bash
npm test          # single run
npm run test:watch  # re-runs on file change
```

When adding new business logic to `lib/`, add a corresponding test file at `lib/__tests__/<module>.test.ts`.

## Contributing

1. **Fork** the repository and create a feature branch: `git checkout -b feat/my-feature`
2. Make your changes following the architecture and style guidelines above.
3. Add or update tests for any logic changes in `lib/`.
4. Run `npm run check && npm test && npm run build` — all three must pass.
5. Open a pull request with a clear description of what changed and why.

Bug reports and feature requests are welcome via GitHub Issues. Please search for existing issues before opening a new one.
