# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Landing page situs donasi bagiberbagi.id (komunitas penyalur bantuan makanan & dukungan UMKM). Astro static site, bun as package manager/test runner.

## Commands

- `bun install` — install dependencies
- `bun run dev` — dev server (http://localhost:4321)
- `bun run build` — build static site to `dist/`
- `bun run preview` — preview the production build
- `bun test` — run unit tests (`src/lib/*.test.ts`, yaitu `format` + `impact`)
- `bunx astro check` — type-check `.astro` files
- `bun run check:assets` — after a build, fail if `dist` carries an image no page references (see `.claude/rules/image-pipeline.md`)

## Architecture

Astro static site (`output: 'static'`, no adapter), Tailwind CSS, TypeScript strict. Deploys to a self-managed VPS (nginx, TLS terminated at Cloudflare, see `deploy/README.md`) via GitHub Actions on push to `main`.

For per-area architecture detail, see `.claude/rules/*.md`. Read only the file matching the task at hand, not all of them at once:

- **Read `.claude/rules/content-model.md`** when touching `src/content/`, `content.config.ts`, `keystatic.config.ts`, or `src/lib/programs.ts`/`home.ts` — covers collections/singletons, Keystatic ↔ `content.config.ts` sync, `programs.ts` as single-source.
- **Read `.claude/rules/image-pipeline.md`** when touching jejak photos, `src/assets/jejak/`, or `src/lib/jejak.ts`'s image handling — covers the `public/uploads/` split, the dedup rule, and the build cheap-check.
- **Read `.claude/rules/routing-taxonomy.md`** when adding/changing a page in `src/pages/`, editing `src/consts.ts` (`PINTU_IDS`, `NAV_LINKS`), or touching the `/jejak/` feed script — covers the pintu taxonomy, route structure, and feed-shape logic.
- **Read `.claude/rules/layout-tiers.md`** when picking a container width for a new section/page or porting a mockup into components — covers the `Container.astro` tier system and the mockup-to-token workflow.
- **Read `.claude/rules/analytics.md`** when touching `src/lib/analytics.ts`, `Analytics.astro`, or `ConsentBanner.astro`, or adding an analytics provider — covers the switchboard and consent gating.
- **Read `.claude/rules/frontend-scripts.md`** when adding or editing a `src/scripts/*.js` module — covers the one-script-per-component convention.
- **Read `.claude/rules/section-ids.md`** when adding a page or section, or touching an existing `id` on a `<section>` — covers the Indonesian kebab-case naming convention, `scroll-mt-24` under the sticky header, and the load-bearing ids that must never be renamed.

## Git conventions

- One logical concern per commit, Conventional Commits style subject (`fix: ...`, `feat: ...`), body explains *why* when non-obvious.
- Never amend/force-push shared history.
- Code changes go through a feature branch, merged into `main` when they're verified — `main` is what deploys, so never commit code straight onto it. Docs-only edits may go direct.
- Push once a commit/feature is solid, not every intermediate step.
- No SemVer tagging yet.
- No PR review requirement (solo project) — revisit if a second contributor joins.
