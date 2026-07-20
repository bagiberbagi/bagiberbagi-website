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
- `src/consts.ts` holds small structured UI data (features, homepage program cards `MAKANAN_PROGRAMS`, how-it-works steps, impacts, activity-ticker items, nav links, and the program mega-menu `PROGRAM_MENU`) as plain typed arrays/objects — deliberately not a Content Collection, since these are fixed-size, tightly coupled to one section each, and never individually routed. Editor-managed prose/data lives in `src/content/` instead.
- `src/content/` holds the editor-managed content, all of it editable via the Keystatic admin UI at `/keystatic` (`src/pages/keystatic/`). Astro reads it through the collections in `src/content.config.ts`; Keystatic writes it through `keystatic.config.ts`. **The two configs must agree on file extension** — Keystatic derives it from `format`, so a mismatch makes the admin UI silently list zero entries while the site keeps rendering fine (this happened: `format: { data: 'yaml' }` looks for `*.yaml`, but the files were `*.md`).
  - `faqs`, `programs`, `footer-cols` — pure data, no prose body: `*.yaml` files, Keystatic collections.
  - `settings`, `about` — `*.json` singletons.
  - `legal` (privacy/terms/transparency, rendered by `privasi/syarat/transparansi.astro`) — long-form prose, so `*.mdoc` (Markdoc) via `@astrojs/markdoc`; Keystatic's `contentField` only supports `.mdoc`. Modelled as three **singletons**, not a collection, because each has a hard-coded route calling `getEntry` with a fixed id — a collection's add/delete/rename-slug affordances would break those routes.
- `src/lib/format.ts` holds pure functions (Rupiah formatting, WhatsApp link building) used by both server-rendered markup and the client-side calculator script; it's the only part of the app with unit tests (`bun test`).
- `src/scripts/*.js` are small vanilla-JS modules (no UI framework) each imported via a `<script>` tag in the one component that owns that behavior — mobile nav, scrollspy, fade-in-on-scroll, activity ticker, stats count-up, donation calculator, FAQ accordion, program mega-menu, legal-page TOC scrollspy.
- Design mockups are **git-ignored, local-only** references (see `.gitignore`), all flat under `mockup/`: `*.dc.html` site-builder exports plus their shared runtime (`image-slot.js`, `support.js`, `content.js`). Workflow: a `.dc.html` export is dropped in as the visual/content reference for building a page, then used as the spec — never imported or deployed. Map its raw hex to the design-system tokens (don't copy mockup colors verbatim), and treat its `sc-for`/`{{ }}` template placeholders as dynamic slots (real content lives in the Astro content collections, not the mockup). Files stay on disk for iteration and are deleted manually once spent.
- Routes live in `src/pages/`: `index`, `faq`, `jumat-berkah` (program detail), the legal pages (`privasi`, `syarat`, `transparansi`), and the Keystatic admin (`keystatic/`). The former Phase 2 backlog (program mega-menu, dedicated FAQ/legal pages) is now shipped — mega-menu via `PROGRAM_MENU` + `ProgramMenuCategory.astro` + `program-menu.js`.

## Git conventions

- One logical concern per commit, Conventional Commits style subject (`fix: ...`, `feat: ...`), body explains *why* when non-obvious.
- Never amend/force-push shared history.
- Direct-to-`main` is fine (solo/scratch project) — no feature-branch requirement yet.
- Push once a commit/feature is solid, not every intermediate step.
- No SemVer tagging yet.
- No PR review requirement (solo project) — revisit if a second contributor joins.
