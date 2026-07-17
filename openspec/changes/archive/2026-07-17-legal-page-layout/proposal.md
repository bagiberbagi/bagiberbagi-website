## Why

Current `/syarat`, `/privasi`, `/transparansi` pages render legal content as a single flat prose column — no way to jump to a specific clause, no sense of document structure. User supplied a mockup (`Syarat dan Ketentuan.svg`, design reference only) showing a richer legal-page layout — eyebrow/title/last-updated header, a sticky scrollspy table of contents, and structured H2 sections — meant to be shared across all legal pages, not just Syarat.

## What Changes

- New shared legal-page layout: eyebrow label + H1 + "Terakhir diperbarui" date line, two-column body (sticky scrollspy Table of Contents on the left, content sections on the right), reusing the existing Footer unchanged.
- Table of Contents is auto-derived from the markdown's H2 headings (via Astro's `render()` `headings` output) — not a hand-maintained list — so it can't drift out of sync with content.
- Scrollspy active-section highlighting reuses the existing `scrollspy.js`/`IntersectionObserver` pattern, generalized to work off the headings present on any given page (not the hardcoded `NAV_SECTION_IDS` used by the main nav).
- `legal` Content Collection schema gains an `updatedAt` field (currently the date is an untyped first line of markdown body text); existing entries updated to use it.
- `/syarat` (`terms.md`) content expanded from 9 to 15 sections to match the mockup: adds Definisi, Akun Pengguna, Donasi, Penggunaan Dana, Transparansi dan Pelaporan, Program dan Pelaksanaan, Hak Kekayaan Intelektual, Larangan Penggunaan.
- `/privasi` and `/transparansi` are migrated to the new layout component in this change (structural only — their content is not rewritten/expanded here).

## Out of Scope (deferred)

- Rewriting/expanding `privacy.md` or `transparency.md` content to a similar depth as the new `terms.md` — only `/syarat` gets a content rewrite in this change.
- Any mega-menu/nav work (tracked separately in `program-megamenu-pages`).

## Capabilities

### New Capabilities
- `legal-page-layout`: Shared layout for legal/long-form pages — header block (eyebrow/title/updated date), auto-generated scrollspy Table of Contents, structured content sections. Applies to `/syarat`, `/privasi`, `/transparansi`.

### Modified Capabilities
(none — no existing spec files in `openspec/specs/`)

## Impact

- `src/content.config.ts` — `legal` collection schema: add `updatedAt: z.string()`.
- `src/content/legal/terms.md` — expand to 15 sections; move date into frontmatter `updatedAt`.
- `src/content/legal/privacy.md`, `transparency.md` — move date into frontmatter `updatedAt` (content otherwise unchanged).
- New `src/layouts/LegalLayout.astro` (or equivalent) implementing the header + TOC + content structure, consumed by `src/pages/syarat.astro`, `privasi.astro`, `transparansi.astro`.
- New `src/scripts/legal-toc-scrollspy.js` (generalized scrollspy, no dependency on `NAV_SECTION_IDS`).
- No changes to `Header.astro`, `Footer.astro`, deploy pipeline, or Keystatic config (Keystatic already edits `legal` collection entries generically via schema, so the new `updatedAt` field becomes editable automatically).
