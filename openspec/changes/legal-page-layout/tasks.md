## 1. Content collection

- [x] 1.1 Added `updatedAt: z.string()` to the `legal` schema in `src/content.config.ts`.
- [x] 1.2 Updated all 3 entries' frontmatter with `updatedAt`; removed the plain-text "Terakhir diperbarui" line (`terms.md`/`privacy.md` had it; `transparency.md` never did, so nothing to remove there).

## 2. Syarat content expansion

- [x] 2.1 Drafted all 8 new sections + retained/merged the 7 existing ones (site-specific mechanics — WA-based flow, pax calculator, transfer/e-wallet, H+1 documentation — preserved inside the new section structure rather than replaced with generic mockup text). 15 sections total, matches mockup structure.
- [x] 2.2 Flagged: see task 5.4 (user review required before merge — this is drafted legal copy, not signed off).

## 3. Layout + TOC

- [x] 3.1 Created `src/layouts/LegalLayout.astro`: header block (eyebrow/title/`updatedAt`) + two-column body (TOC + `<slot />`); `headings` prop filtered to `depth === 2` for the TOC.
- [x] 3.2 TOC markup: each item a link with `data-toc-link="{slug}"`, base classes `border-transparent text-muted`, toggled to active state by script.
- [x] 3.3 Created `src/scripts/legal-toc-scrollspy.js`: queries `[data-toc-link]` already in the DOM (not an imported id list), `IntersectionObserver` over each corresponding heading id, toggles active class.
- [x] 3.4 `md:sticky md:top-24` on the TOC nav (desktop); plain stacked block by default (mobile) — same `md:` breakpoint convention already used elsewhere on the site.

## 4. Page migration

- [x] 4.1 Migrated `syarat.astro` to `LegalLayout`.
- [x] 4.2 Migrated `privasi.astro` to `LegalLayout`.
- [x] 4.3 Migrated `transparansi.astro` to `LegalLayout`.

## 5. Verification

- [x] 5.1 `bunx astro check` passes (0 errors).
- [x] 5.2 Verified via built output: `/syarat` has exactly 15 `data-toc-link` entries matching 15 `<h2 id="...">` sections 1:1, `updatedAt` renders correctly on all 3 pages (16 Juli 2026 for `terms`, 15 Juli 2026 for `privacy`/`transparency`). Scrollspy highlight behavior and sticky/stacked responsive switch (JS + CSS interaction) not manually browser-tested this session — no browser tool available, user accepted this risk (same as prior changes this session).
- [x] 5.3 `bun run build` succeeds.
- [ ] 5.4 **Pending user review** — expanded Syarat copy (8 new sections + reorganized 7 existing) is a first draft, not signed off. Do not merge to `main` until reviewed.
