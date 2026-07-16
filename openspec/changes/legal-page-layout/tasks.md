## 1. Content collection

- [ ] 1.1 Add `updatedAt: z.string()` to the `legal` schema in `src/content.config.ts`.
- [ ] 1.2 Update `terms.md`, `privacy.md`, `transparency.md` frontmatter with `updatedAt`; remove the plain-text "Terakhir diperbarui" line from each body.

## 2. Syarat content expansion

- [ ] 2.1 Draft the 8 new sections in `terms.md` (Definisi, Ruang Lingkup Layanan, Akun Pengguna, Donasi, Penggunaan Dana, Transparansi dan Pelaporan, Program dan Pelaksanaan, Hak Kekayaan Intelektual, Larangan Penggunaan) alongside the 7 retained/adjusted existing sections, matching the mockup's 15-section structure.
- [ ] 2.2 Flag draft content for user review before merge (legal copy — not to be treated as final without sign-off).

## 3. Layout + TOC

- [ ] 3.1 Create `src/layouts/LegalLayout.astro`: header block (eyebrow/title/updatedAt) + two-column body (TOC + `<slot />`), reading `headings` from the page and filtering to `depth === 2`.
- [ ] 3.2 Build TOC markup: each item is a link with `data-toc-link="{slug}"`, active-state classes toggled by script.
- [ ] 3.3 Create `src/scripts/legal-toc-scrollspy.js`: query `[data-toc-link]`, `IntersectionObserver` over the corresponding heading ids, toggle active class (parallel to `scrollspy.js` but no `NAV_SECTION_IDS` import).
- [ ] 3.4 Responsive styles: sticky TOC column on desktop, stacked non-sticky block on mobile.

## 4. Page migration

- [ ] 4.1 Migrate `src/pages/syarat.astro` to `LegalLayout`, passing `headings` from `render(entry)`.
- [ ] 4.2 Migrate `src/pages/privasi.astro` to `LegalLayout` (structure only, content unchanged).
- [ ] 4.3 Migrate `src/pages/transparansi.astro` to `LegalLayout` (structure only, content unchanged).

## 5. Verification

- [ ] 5.1 `bunx astro check` passes.
- [ ] 5.2 Manually verify in browser: TOC matches headings on all 3 pages, scrollspy highlights correctly while scrolling, desktop sticky vs. mobile stacked behavior, `/syarat` shows all 15 sections.
- [ ] 5.3 `bun run build` succeeds.
- [ ] 5.4 User reviews expanded Syarat copy before this branch merges to `main`.
