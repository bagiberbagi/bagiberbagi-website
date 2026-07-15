# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Landing page situs donasi bagiberbagi.id (komunitas penyalur bantuan makanan & dukungan UMKM). Static site, no build step, no package manager.

## Commands

No build/lint/test tooling. To preview: open [bagiberbagi.dc.html](bagiberbagi.dc.html) directly in a browser, or serve the folder with any static server (`npx serve .`).

## Architecture

This site is an **export from a no-code site builder** ("dc" runtime — custom `<x-dc>`/`<x-import>` tags, `{{ }}` bindings, `<sc-if>` conditionals). Files fall into two categories:

- **Generated, do not hand-edit**: [support.js](support.js) (header says: "GENERATED from dc-runtime/src/*.ts — do not edit. Rebuild with `cd dc-runtime && bun run build`" — that source repo isn't part of this export) and [image-slot.js](image-slot.js) (a copied "omelette starter" component, gets overwritten by the builder's `copy_starter_component` tool). Both will be silently overwritten if the page is re-exported from the builder.
- **Meant to be edited by hand**: [content.js](content.js) — a plain CMS-style module (WA number, program list, FAQ text, legal copy, stats labels, etc). [bagiberbagi.dc.html](bagiberbagi.dc.html) loads it at runtime via `import('./content.js')` (line ~410) and merges it into component state — editing copy here does not require touching layout/logic.

[bagiberbagi.dc.html](bagiberbagi.dc.html) itself is the single-page layout (header, program sections, FAQ, legal modals, footer) with an inline `<script type="text/x-dc" data-dc-script>` block driving state/behavior. Since it's a builder export, prefer editing [content.js](content.js) for copy changes; treat structural changes to the `.dc.html` as likely to be overwritten on the next export from the builder tool.

## Git conventions

- One logical concern per commit, Conventional Commits style subject (`fix: ...`, `feat: ...`), body explains *why* when non-obvious.
- Never amend/force-push shared history.
- Direct-to-`main` is fine (solo/scratch project) — no feature-branch requirement yet.
- Push once a commit/feature is solid, not every intermediate step.
- No SemVer tagging yet.
- No PR review requirement (solo project) — revisit if a second contributor joins.
