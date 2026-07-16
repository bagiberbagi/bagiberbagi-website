## 1. Data

- [x] 1.1 Update `NAV_LINKS` in `src/consts.ts`: order Home, Program, Tentang Kami, FAQ (drop `cara-kerja`); added new `home` entry (`href: '#top'`, wasn't a nav link before), `Tentang Kami` targets existing `#tentang` anchor, `FAQ` targets `/faq`.
- [x] 1.2 Added `PROGRAM_MENU` array in `src/consts.ts`: 3 categories with their items; "Jumat Berkah" is the only `active: true` item (`href: '/jumat-berkah'`), other 6 are `active: false`.
- [x] 1.3 Dropped `'cara-kerja'` from `NAV_SECTION_IDS`.

## 2. Header + mega-menu component

- [x] 2.1 Updated `Header.astro`: `NAV_LINKS` now renders in new order (Home/Program/Tentang Kami/FAQ); `Donasi Sekarang` was already a distinct `.btn-primary` CTA from the `design-system`/`standalone-faq-page` work.
- [x] 2.2 Built desktop mega-menu: 4-column grid (3 categories via `Icon.astro` + label, + 1 promo column linking to `/jumat-berkah`).
- [x] 2.3 Active item (Jumat Berkah) renders as real `<a>`; other 6 render as muted text + `.badge-coming-soon` ("Segera Hadir").
- [x] 2.4 Added matching mobile accordion markup inside `#mobile-nav-panel` (same category/item structure, toggled independently of the full mobile-nav open/close).
- [x] 2.5 Created `src/scripts/program-menu.js`: desktop click-to-open/close (click-outside + Escape), mobile accordion toggle. Imported in `Header.astro`.

## 3. Jumat Berkah page

- [x] 3.1 Created `src/pages/jumat-berkah.astro` using `BaseLayout` + `Header` + content + `Footer`.
- [x] 3.2 Added program description + checklist and a WhatsApp CTA using `buildWaLink`/`buildDonationMessage`/`calcTotal`/`formatRupiah` (default 10 pax, same as `DonationCalculator`'s default).

## 4. Verification

- [x] 4.1 `bunx astro check` passes (0 errors).
- [x] 4.2 Verified via built output: nav order correct on both desktop+mobile, 4x `href="/jumat-berkah"` (item link + promo CTA, ×2 breakpoints), 15x "Segera Hadir" (12 mega-menu coming-soon items + 3 pre-existing disabled Donation Calculator options — consistent). Click/keyboard interaction (JS behavior) not manually browser-tested this session — no browser tool available, user accepted this risk (same as prior changes this session).
- [x] 4.3 `bun run build` succeeds — `/jumat-berkah` generated correctly.
