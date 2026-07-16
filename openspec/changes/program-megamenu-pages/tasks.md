## 1. Data

- [ ] 1.1 Update `NAV_LINKS` in `src/consts.ts`: order Home, Program, Tentang Kami, FAQ (drop `cara-kerja`); `Tentang Kami` targets existing `#tentang` anchor, `FAQ` targets `/faq`.
- [ ] 1.2 Add new `PROGRAM_MENU` array in `src/consts.ts`: 3 categories (`bagiberbagimakanan`, `bagiberbagibantuan`, `bagiberbagipendidikan`) with their items; mark "Jumat Berkah" as the only active/linked item, others coming-soon.
- [ ] 1.3 Drop `'cara-kerja'` from `NAV_SECTION_IDS` in `src/consts.ts` — no longer a nav-linked scroll target now that it's removed from `NAV_LINKS` (the `#cara-kerja` section itself stays on the homepage, just untracked by scrollspy).

## 2. Header + mega-menu component

- [ ] 2.1 Update `src/components/Header.astro`: render new nav order, "Donasi Sekarang" as distinct CTA.
- [ ] 2.2 Build desktop mega-menu markup: 3 even columns (icon + label per category, using `Icon.astro`) + promo column linking to `/jumat-berkah`.
- [ ] 2.3 Render active vs. coming-soon item states (real `<a>` for Jumat Berkah; non-interactive text + "Segera Hadir" badge for the other 6).
- [ ] 2.4 Add mobile accordion markup for the same content inside `mobile-nav-panel`.
- [ ] 2.5 Create `src/scripts/program-menu.js`: click-to-open, `aria-expanded` toggle, click-outside/Escape to close, mobile accordion expand/collapse. Import it in `Header.astro` alongside the existing `mobile-nav.js`/`scrollspy.js` imports.

## 3. Jumat Berkah page

- [ ] 3.1 Create `src/pages/jumat-berkah.astro` using the `BaseLayout` + `Header` + content + `Footer` skeleton (cf. `src/pages/faq.astro`).
- [ ] 3.2 Add program description content and a WhatsApp donation CTA (reuse `buildWaLink` from `src/lib/format.ts`, mirroring `DonationCalculator.astro`'s pattern).

## 4. Verification

- [ ] 4.1 `bunx astro check` passes.
- [ ] 4.2 Manually verify in browser: desktop mega-menu open/close (click, click-outside, Escape), mobile accordion, Jumat Berkah link navigates correctly, other 6 items are non-clickable with badge, nav order matches spec on both breakpoints.
- [ ] 4.3 `bun run build` succeeds.
