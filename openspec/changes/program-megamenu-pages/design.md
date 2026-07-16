## Context

Astro static site (`output: 'static'`, no adapter). Nav currently lives in `src/consts.ts` (`NAV_LINKS`) and renders identically for desktop + mobile in `Header.astro`, with `mobile-nav.js` handling the mobile panel toggle via `aria-expanded` + click. No dropdown/mega-menu pattern exists yet anywhere in the codebase. The `programs` Content Collection (4 flat items, `label`/`disabled` schema) already established an active/coming-soon convention, consumed only by `DonationCalculator.astro`.

Decided with the user (this session, not re-litigated here): nav order Home → Program → Tentang Kami → FAQ → Donasi Sekarang; mega-menu is click-triggered, 3 even columns + promo column, only Jumat Berkah clickable; `/jumat-berkah` page ships in this change; `/tentang-kami` real page does NOT ship in this change (nav item temporarily points at existing `#tentang` anchor).

## Goals / Non-Goals

**Goals:**
- Ship a working categorized Program mega-menu (desktop dropdown + mobile accordion) with correct active/coming-soon states.
- Ship the reordered nav.
- Ship `/jumat-berkah` as the mega-menu's one real destination, so the "active" item isn't a dead link.

**Non-Goals:**
- Building the real `/tentang-kami` about page (separate change).
- Building the homepage program-showcase section (separate change).
- Unifying the mega-menu taxonomy with the `programs` Content Collection.
- Any CMS (Keystatic) wiring for the new taxonomy.

## Decisions

**1. Mega-menu taxonomy lives in `src/consts.ts`, not a new Content Collection.**
Alternative considered: new `programCategories` collection (consistent with Phase 2's Keystatic-editable pattern). Rejected for now — the relationship to the existing `programs` collection is explicitly unresolved, and creating a second, differently-shaped "programs" data source before that's decided risks a rework. `consts.ts` already holds layout-bound, fixed-size data (`FEATURES`, `STEPS`, `NAV_LINKS`); this taxonomy (3 categories × ~2-3 items, effectively static until a taxonomy decision is made) fits the same bucket.

**2. Click-to-open trigger, not hover.**
Matches the existing `aria-expanded` + click-outside pattern already used for mobile nav (`mobile-nav.js`). Avoids hover-vs-touch inconsistency, and lets one interaction model + one JS module cover both desktop dropdown and mobile accordion (open/close state, not open/hover state).

**3. Non-active items render as non-interactive text with a "Segera Hadir" badge, not disabled links.**
Alternative: real `<a>` tags pointing nowhere or to `#`. Rejected — dead links are worse for a11y/SEO than plain text, and this mirrors the `disabled` boolean pattern already established in the `programs` collection / `DonationCalculator`'s `<option disabled>`.

**4. One new JS module (e.g. `src/scripts/program-menu.js`), sibling to `mobile-nav.js`, not a shared abstraction.**
Rejected building a generic "dropdown" utility — only one mega-menu exists; premature abstraction for a single consumer.

**5. `/jumat-berkah` page follows the existing page skeleton** (`BaseLayout` + `Header` + content + `Footer`, matching `src/pages/faq.astro` / `privasi.astro`). Content specifics (copy, imagery) TBD at implementation time — this design only fixes the technical shape, not the editorial content.

## Risks / Trade-offs

- **[Risk]** `Tentang Kami` nav item pointing at `#tentang` (JoinUs/mitra-CSR section) is semantically mismatched with the label until the real about page ships → **Mitigation**: acceptable, explicit user-approved interim state; tracked as follow-up (not silently forgotten) via this design doc + `plan.md`.
- **[Risk]** `consts.ts`-based taxonomy will need manual code changes (not CMS) if program categories change before the taxonomy-unification decision is made → **Mitigation**: acceptable short-term; data shape kept simple (array of `{category, items}`) so a later migration to a Content Collection is a mechanical move, not a redesign.
- **[Risk]** New click-outside/keyboard handling for the dropdown could regress existing mobile nav behavior if not isolated carefully → **Mitigation**: separate JS module/DOM ids from `mobile-nav.js`, no shared state.

## Migration Plan

No data migration. Deploy via normal flow: work happens on `feature/program-megamenu-pages` branch, PR reviewed informally, merge to `main` (user confirms before that push, per standing instruction — `main` auto-deploys via GitHub Actions). Rollback = revert the merge commit; no DB/content migration to undo.

## Open Questions

- When does the real `/tentang-kami` page ship, and does the nav item change again at that point? (tracked for a future change, not blocking this one)
- Will the mega-menu's 3-category/7-item taxonomy eventually replace or merge with the `programs` Content Collection? (explicitly deferred by user)
