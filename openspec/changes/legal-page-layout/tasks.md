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

## 5.5 Visual precision fixes (post-review against mockup)

- [x] Added `eyebrow`/`intro` fields to the `legal` schema and all 3 entries (was hardcoded "LEGAL" for all pages; mockup uses a page-specific label like "SYARAT DAN KETENTUAN").
- [x] Fixed `terms.md` title to "Syarat dan Ketentuan Layanan" (was "Syarat & Ketentuan").
- [x] Added full-width intro paragraph (bold, `text-ink`) above the TOC/content grid, matching the mockup's "Selamat datang di bagiberbagi.id..." lead line.
- [x] Rewrote list/heading spacing: replaced a uniform `flex flex-col gap-8` (which applied the same gap between every markdown element regardless of type) with per-element rules via Tailwind arbitrary variants (`[&_h2]:mt-10 [&_h2]:mb-3`, `[&_p]:mb-3`, `[&_ul]:mb-4 [&_ul]:gap-1.5`) — h2→own paragraph is tight, section→next-section is loose.
- [x] Styled markdown `<ul>`/`<li>` at all — previously fell back to unstyled browser defaults (big default bullets/indent). Now `list-disc pl-5` with `li::marker` colored via `[&_li::marker]:text-brand-orange`.
- [x] Used Tailwind arbitrary variants instead of a `<style>` block with plain CSS — a plain-CSS approach would have needed hardcoded hex (`::marker` can't take a Tailwind class directly) or `theme()` (already known broken in this Tailwind v4 setup, see `design-system`'s `BaseLayout.astro` fix), either of which would violate `design-system`'s "no raw hex in `src/layouts/`" requirement. Re-verified `grep -rE '#[0-9A-Fa-f]{3,6}'` still returns 0 matches (excluding `Documentation.astro`/`Legal.astro`).
- [x] `transparency.md` had no H2 sections at all (2 flat paragraphs) — added one ("Status Saat Ini") so its TOC isn't empty; first paragraph moved to `intro`.

## 5. Verification

- [x] 5.1 `bunx astro check` passes (0 errors).
- [x] 5.2 Verified via built output: `/syarat` has exactly 15 `data-toc-link` entries matching 15 `<h2 id="...">` sections 1:1, `updatedAt` renders correctly on all 3 pages (16 Juli 2026 for `terms`, 15 Juli 2026 for `privacy`/`transparency`). Scrollspy highlight behavior and sticky/stacked responsive switch (JS + CSS interaction) not manually browser-tested this session — no browser tool available, user accepted this risk (same as prior changes this session).
- [x] 5.3 `bun run build` succeeds.
- [ ] 5.4 **Pending user review** — expanded Syarat copy (8 new sections + reorganized 7 existing) is a first draft, not signed off. Do not merge to `main` until reviewed.
