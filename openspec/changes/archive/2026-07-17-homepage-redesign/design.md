## Context

Discovered by rasterizing and inspecting `megamenu.svg` (a full-homepage design export, not just the nav dropdown its filename suggests) against the live components. Text copy for `ProgramFeatures` (`FEATURES`) and `HowItWorks` (`STEPS`) matches the mockup verbatim — only visual treatment differs for those two. `Documentation` and `Legal` components are used nowhere except `index.astro`.

This change intentionally bundles several small, mockup-driven section changes into one, per explicit user decision — they all originate from the same design reference and are easier to land as one coherent visual pass than as five-plus separate branches.

## Goals / Non-Goals

**Goals:**
- Homepage visually matches the mockup for: Stats band, new makanan-program-cards section, ProgramFeatures image swap, Cara Kerja card redesign, Documentation/Legal removal.
- Only Jumat Berkah is functionally active in the new program-cards section (button + link), regardless of the mockup showing all 3 with buttons.
- No regression to `ImpactSection`/`JoinUs` (confirmed unchanged).

**Non-Goals:**
- Reconciling this section's data with `program-megamenu-pages`'s planned `PROGRAM_MENU` or the now-superseded `homepage-program-showcase`'s `PROGRAM_CATEGORIES` (that change was scrapped/replaced by this one).
- Redesigning `ImpactSection`/`JoinUs` icons to match the mockup's plain white squares — treated as an export artifact, not a real design intent.
- Reintroducing `Documentation`/`Legal` content elsewhere (out of scope; can be a future change if needed).

## Decisions

**1. New minimal data `MAKANAN_PROGRAMS` in `src/consts.ts`** — 3 entries (Jumat Berkah, Ramadhan Berkah, Berbagi Makanan Harian), each with `label`, `desc`, image reference, and `active: boolean` (only Jumat Berkah `true`) plus `href` for the active one.
Scoped to exactly what this section needs (3 items of 1 category), not the full 3-category/7-item mega-menu taxonomy — avoids depending on `program-megamenu-pages`'s not-yet-implemented `PROGRAM_MENU`, and avoids resurrecting the scrapped `PROGRAM_CATEGORIES` shape. Naming deliberately distinct from both to keep the eventual reconciliation (there will be 3 overlapping "program data" shapes across 3 branches) a visible, deliberate merge step rather than an accidental collision.

**2. New component `src/components/ProgramHighlights.astro`** (or similar) for the makanan-program-cards section, inserted between `Stats` and `ProgramFeatures` in `index.astro`. Kept separate from `ProgramFeatures.astro` — they're adjacent but distinct sections with different content shapes (specific programs vs. generic trust bullets).

**3. `Documentation.astro` and `Legal.astro` are deleted outright**, not just unimported.
Confirmed via `grep` they're referenced only from `index.astro`. Per repo convention, unused code is deleted rather than left as dead weight.

**4. Stats/ProgramFeatures/HowItWorks changes are markup+class edits in place** — no new data shape, no schema change; `data-target-*` attributes and `stats-counter.js`/`fade-in.js` behavior on `Stats`/`ProgramFeatures`/`HowItWorks` are preserved as-is.

## Risks / Trade-offs

- **[Risk]** Three separate branches (`program-megamenu-pages`, this one) will independently define similarly-shaped "program" data in `consts.ts` under different names → **Mitigation**: intentional and documented; reconciled as an explicit step when merging, not silently auto-resolved.
- **[Risk]** Deleting `Documentation.astro`/`Legal.astro` removes content (placeholder photo grid, inline legal snippet) some users might expect to find → **Mitigation**: user-confirmed removal; legal content already lives at dedicated `/privasi`/`/syarat`/`/transparansi` pages, so nothing is actually lost, just de-duplicated.
- **[Risk]** Mockup's all-3-active button styling could be mis-copied literally by whoever implements this → **Mitigation**: explicitly called out here and in the spec that only Jumat Berkah is functionally active.

## Migration Plan

No data migration. Order: add `MAKANAN_PROGRAMS` to `consts.ts` → build `ProgramHighlights.astro` → update `Stats.astro`/`ProgramFeatures.astro`/`HowItWorks.astro` visuals → delete `Documentation.astro`/`Legal.astro` and their imports in `index.astro` → insert new section in `index.astro` → verify. Rollback = revert the merge commit.
