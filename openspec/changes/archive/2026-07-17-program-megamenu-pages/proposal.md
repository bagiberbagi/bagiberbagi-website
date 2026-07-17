## Why

Current nav is 4 flat links (`Cara Kerja`, `Program`, `FAQ`, `Tentang Kami`) with no way to browse programs by category, and the `Tentang Kami` link actually points to a mitra/CSR section (`#tentang` in `JoinUs.astro`), not a real about-us page. `plan.md` calls for a categorized program mega-menu; aligning on it surfaced that the nav order and structure needed rework too.

## What Changes

- Reorder nav to: **Home → Program (mega-menu) → Tentang Kami → FAQ → Donasi Sekarang (CTA)**. Drop `Cara Kerja` as a top-level link (folds into future `Tentang Kami` page content, out of scope here).
- Add a mega-menu dropdown to the "Program" nav item: 3 equal columns, one per category (`bagiberbagimakanan`, `bagiberbagibantuan`, `bagiberbagipendidikan`, 7 items total) + a 4th promo column pointing at Jumat Berkah (the only live program). Category headers use the existing `Icon.astro` system. Only the Jumat Berkah item is a real link (to the new `/jumat-berkah` page); the other 6 items render as muted, non-clickable text with a "Segera Hadir" badge (mirrors the existing `disabled` pattern in the `programs` Content Collection). Trigger is click (not hover), matching the existing `aria-expanded` + click-outside-to-close pattern in `mobile-nav.js`. Collapses to an accordion inside the mobile nav panel on small screens.
- Add `/jumat-berkah` page — dedicated landing page for the one active program.
- `Tentang Kami` nav item is a plain link, temporarily pointing at the existing `#tentang` anchor (`JoinUs.astro`) until a real about page ships in a later change.
- `FAQ` nav item is a plain link to the existing `/faq` page (unchanged).
- Mega-menu taxonomy (categories + 7 items) lives in `src/consts.ts` as a plain array — not a new Content Collection — since the relationship between this taxonomy and the existing 4-item `programs` collection (used by the Donation Calculator) is deliberately undecided; revisit as a collection later if/when that's unified and needs CMS editing.
- Design reference assets (`Kebijakan Privasi.svg`, `Syarat dan Ketentuan.svg`, `megamenu.svg`, `hero_image.png` at repo root) are visual references only — not committed as web assets, not embedded directly.

## Out of Scope (deferred to a later change)

- Real `/tentang-kami` about page (nav points at the existing `#tentang` section for now).
- Homepage program-showcase section (3 program cards below Hero/Stats).
- Unifying the mega-menu's 7-item/3-category taxonomy with the existing 4-item `programs` collection.

## Capabilities

### New Capabilities
- `program-mega-menu`: Click-triggered, categorized dropdown for the "Program" nav item (desktop) collapsing to an accordion (mobile), with active/coming-soon item states.
- `jumat-berkah-page`: Dedicated landing page for the Jumat Berkah program.

### Modified Capabilities
(none — no existing spec files in `openspec/specs/` to modify; `programs` Content Collection and Donation Calculator are unchanged)

## Impact

- `src/consts.ts` — replace `NAV_LINKS` (drop `cara-kerja`, add ordered Home/Program/Tentang Kami/FAQ entries) and add a new `PROGRAM_MENU` (or similarly named) categories/items array.
- `src/components/Header.astro` — nav reorder; "Program" becomes a mega-menu trigger (desktop dropdown markup + mobile accordion markup); new small JS module in `src/scripts/` (sibling to `mobile-nav.js`) for open/close + click-outside behavior.
- `src/pages/jumat-berkah.astro` — new page, following existing page patterns (`BaseLayout` + `Header` + content + `Footer`, cf. `src/pages/faq.astro`).
- No changes to deploy pipeline, Keystatic config, or the `programs`/`faqs`/`settings`/`footerCols`/`legal` Content Collections.
