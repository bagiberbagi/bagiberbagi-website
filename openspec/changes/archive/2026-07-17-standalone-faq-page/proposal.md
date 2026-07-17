## Why

FAQ content currently lives in two places at once: an embedded homepage section (`<Faq />` in `index.astro`, anchored at `#faq`) and a standalone `/faq` page rendering the exact same `Faq.astro` component. The nav's "FAQ" link points at the homepage anchor (`#faq`), not the dedicated page. User wants `/faq` to be the single, standalone home for FAQ content — no duplicate homepage section.

## What Changes

- Remove the `<Faq />` section from `src/pages/index.astro` (homepage no longer embeds FAQ inline).
- `NAV_LINKS`'s "FAQ" entry becomes a direct link to `/faq` (a real page navigation), not an in-page anchor (`#faq`).
- `NAV_SECTION_IDS` (drives `scrollspy.js`'s `IntersectionObserver` targets) drops `'faq'`, since it's no longer a homepage section to scroll-spy.
- `Header.astro` / `NAV_LINKS` data shape generalized to support both anchor links (`#section`, on-page, scroll-spied) and page links (`/path`, plain navigation, not scroll-spied) — currently every entry is hardcoded as `href={`#${link.id}`}`.
- `/faq` page itself (`src/pages/faq.astro`, `Faq.astro` component) is unchanged — it already works standalone; only its "who else embeds this" status changes.

## Capabilities

### New Capabilities
- `standalone-faq-page`: FAQ exists only as its own routed page; homepage no longer duplicates it, and nav links there directly.

### Modified Capabilities
(none — no existing spec files in `openspec/specs/`)

## Impact

- `src/pages/index.astro` — remove `<Faq />` import + usage.
- `src/consts.ts` — `NAV_LINKS` "faq" entry gets a real `href: '/faq'` (page link, not anchor); `NAV_SECTION_IDS` drops `'faq'`.
- `src/components/Header.astro` — nav rendering must branch on link type (anchor vs. page) instead of always prefixing `#`.
- **Overlap note**: a separate in-flight change, `program-megamenu-pages` (branch `feature/program-megamenu-pages`), also restructures `NAV_LINKS`/`Header.astro` (full nav reorder + Program mega-menu). Both changes touch the same `NAV_LINKS` array and `Header.astro` nav-rendering logic — expect a merge conflict when both land; whichever merges to `main` second should rebase on the first rather than re-deriving the nav shape independently. Not a blocker to speccing/building this change now, just a known integration point.
