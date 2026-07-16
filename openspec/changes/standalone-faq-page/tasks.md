## 1. Nav data shape

- [ ] 1.1 In `src/consts.ts`: add explicit `href` to each `NAV_LINKS` entry (`#id` for existing anchors, `/faq` for FAQ).
- [ ] 1.2 Remove `'faq'` from `NAV_SECTION_IDS`.

## 2. Header rendering

- [ ] 2.1 Update `Header.astro` desktop nav to render `link.href` directly; only set `data-nav-link` when `href` starts with `#`.
- [ ] 2.2 Apply the same fix to the mobile nav panel's `NAV_LINKS.map()` block.

## 3. Homepage

- [ ] 3.1 Remove the `<Faq />` import and usage from `src/pages/index.astro`.

## 4. Verification

- [ ] 4.1 `bunx astro check` passes.
- [ ] 4.2 Manually verify: homepage has no FAQ section, nav "FAQ" (desktop + mobile) navigates to `/faq`, `/faq` still renders and its accordion still works, scrollspy still highlights remaining anchor-type nav entries correctly while scrolling the homepage.
- [ ] 4.3 `bun run build` succeeds.
