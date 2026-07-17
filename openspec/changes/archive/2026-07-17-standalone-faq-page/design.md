## Context

`NAV_LINKS` (`src/consts.ts`) is currently `{ id, label }[]`; `Header.astro` unconditionally renders `href={`#${link.id}`}` and `data-nav-link={link.id}` for scrollspy. All 4 current entries are homepage anchors. Making FAQ a real page link is the first case that breaks that assumption.

## Goals / Non-Goals

**Goals:**
- FAQ content exists in exactly one place (`/faq`).
- Nav's FAQ entry navigates to `/faq`, not `#faq`.
- `NAV_LINKS` shape supports both anchor and page links without a special-cased if/else per entry in the future.

**Non-Goals:**
- Broader nav reorder / mega-menu (owned by the separate `program-megamenu-pages` change; this change touches the same files but only for the FAQ-specific piece).
- Any redesign of the `/faq` page or `Faq.astro` component itself.

## Decisions

**1. `NAV_LINKS` entries gain an explicit `href`, replacing the implicit `#${id}` construction.**
`{ id: 'faq', label: 'FAQ', href: '/faq' }` vs. e.g. `{ id: 'program', label: 'Program', href: '#program' }`. `Header.astro` renders `link.href` directly. `id` is kept only as the scrollspy key (used to compute `data-nav-link`), and is only attached to the anchor's `data-nav-link` attribute when `href` starts with `#` — page links get no `data-nav-link` (nothing to scroll-spy).
Alternative considered: a `type: 'anchor' | 'page'` discriminator. Rejected — `href`'s own prefix (`#` vs `/`) already tells you which it is; a redundant discriminator field is one more thing to keep in sync.

**2. `NAV_SECTION_IDS` drops `'faq'`.**
It's derived/used only for `scrollspy.js`'s `IntersectionObserver` targets; observing a nonexistent element is harmless (guarded by `if (el)`) but leaving a dead id in a const meant to enumerate real homepage sections is misleading.

## Risks / Trade-offs

- **[Risk]** Merge conflict with `program-megamenu-pages` (both touch `NAV_LINKS`/`Header.astro`) → **Mitigation**: documented in proposal.md; whichever change merges second rebases, no code-level action needed now.
- **[Risk]** Any other code assuming every `NAV_LINKS` entry is an anchor (e.g. mobile nav panel rendering) needs the same `href`-aware treatment → **Mitigation**: `Header.astro`'s mobile panel reuses the same `NAV_LINKS.map()` pattern as desktop, so fixing the render logic once covers both.

## Migration Plan

No data migration. Order: update `consts.ts` shape → update `Header.astro` rendering (desktop + mobile) → remove `<Faq />` from `index.astro` → verify. Rollback = revert the merge commit.
