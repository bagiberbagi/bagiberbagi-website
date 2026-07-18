# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Landing page situs donasi bagiberbagi.id (komunitas penyalur bantuan makanan & dukungan UMKM). Astro static site, bun as package manager/test runner.

## Commands

- `bun install` — install dependencies
- `bun run dev` — dev server (http://localhost:4321)
- `bun run build` — build static site to `dist/`
- `bun run preview` — preview the production build
- `bun test` — run unit tests (`src/lib/format.test.ts`)
- `bunx astro check` — type-check `.astro` files

## Architecture

Astro static site (`output: 'static'`, no adapter), Tailwind CSS, TypeScript strict. Deploys to a self-managed VPS (nginx + certbot, see `deploy/README.md`) via GitHub Actions on push to `main`.

- `src/pages/index.astro` assembles the page from one component per original section (see `src/components/`).
- `src/consts.ts` holds all small structured content (programs, features, steps, impacts, FAQs, footer nav, socials) as plain typed arrays/objects — deliberately not an Astro Content Collection, since these are fixed-size (4-5 items), tightly coupled to one section each, and never individually routed.
- `src/content/legal/*.md` is a Content Collection (`src/content/config.ts`) — privacy/terms/transparency are long-form prose and Phase 2 candidates for standalone pages, unlike the data above.
- `src/lib/format.ts` holds pure functions (Rupiah formatting, WhatsApp link building) used by both server-rendered markup and the client-side calculator script; it's the only part of the app with unit tests (`bun test`).
- `src/scripts/*.js` are small vanilla-JS modules (no UI framework) each imported via a `<script>` tag in the one component that owns that behavior — mobile nav, scrollspy, fade-in-on-scroll, activity ticker, stats count-up, donation calculator, FAQ accordion.
- Design mockups are **git-ignored, local-only** references (see `.gitignore`): `legacy/` (the original site-builder export), `newpage/`, and any `*.dc.html` site-builder export. Workflow: a `.dc.html` export is dropped in as the visual/content reference for building a page, then used as the spec — never imported or deployed. Map its raw hex to the design-system tokens (don't copy mockup colors verbatim), and treat its `sc-for`/`{{ }}` template placeholders as dynamic slots (real content lives in the Astro content collections, not the mockup). Files stay on disk for iteration and are deleted manually once spent.
- `plan.md`, `faq.md`, `kebijakan.md`, `syarat.md` at the repo root are Phase 2 backlog (new program mega-menu, dedicated FAQ/legal/about pages) — not yet implemented.

## Git conventions

- One logical concern per commit, Conventional Commits style subject (`fix: ...`, `feat: ...`), body explains *why* when non-obvious.
- Never amend/force-push shared history.
- Direct-to-`main` is fine (solo/scratch project) — no feature-branch requirement yet.
- Push once a commit/feature is solid, not every intermediate step.
- No SemVer tagging yet.
- No PR review requirement (solo project) — revisit if a second contributor joins.
