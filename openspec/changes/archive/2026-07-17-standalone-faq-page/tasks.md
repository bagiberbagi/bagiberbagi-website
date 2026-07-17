## 1. Nav data shape

- [x] 1.1 In `src/consts.ts`: add explicit `href` to each `NAV_LINKS` entry (`#id` for existing anchors, `/faq` for FAQ).
- [x] 1.2 Remove `'faq'` from `NAV_SECTION_IDS`.

## 2. Header rendering

- [x] 2.1 Update `Header.astro` desktop nav to render `link.href` directly; only set `data-nav-link` when `href` starts with `#`.
- [x] 2.2 Apply the same fix to the mobile nav panel's `NAV_LINKS.map()` block.

## 3. Homepage

- [x] 3.1 Remove the `<Faq />` import and usage from `src/pages/index.astro`.

## 4. Verification

- [x] 4.1 `bunx astro check` passes (0 errors).
- [x] 4.2 Verified via built output (`dist/index.html` has 0 matches for FAQ heading text, `dist/faq/index.html` has 1; both desktop and mobile nav render `href="/faq"`). Scrollspy behavior (JS interaction) not manually browser-tested this session — no browser tool available, user accepted this risk (same as the `design-system` change).
- [x] 4.3 `bun run build` succeeds.
