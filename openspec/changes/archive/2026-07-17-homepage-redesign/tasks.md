## 1. Data

- [x] 1.1 Add `MAKANAN_PROGRAMS` to `src/consts.ts`: 3 entries (Jumat Berkah `active: true` + `href: '/jumat-berkah'`, Ramadhan Berkah `active: false`, Berbagi Makanan Harian `active: false`), each with label/desc/image reference.

## 2. New program-cards section

- [x] 2.1 Create `src/components/ProgramHighlights.astro`: render 3 cards from `MAKANAN_PROGRAMS`.
- [x] 2.2 Active card (Jumat Berkah): CTA button to `/jumat-berkah`.
- [x] 2.3 Other 2 cards: "Segera Hadir" state, no CTA.
- [x] 2.4 Insert `<ProgramHighlights />` in `index.astro` between `<Stats />` and `<ProgramFeatures />`.

## 3. Visual updates

- [x] 3.1 `Stats.astro`: add yellow/gold background band; keep `stats-counter.js` behavior and markup ids intact.
- [x] 3.2 `ProgramFeatures.astro`: replace plain blue promo block with image + caption-overlay card; keep `FEATURES` bullets and heading/intro text unchanged.
- [x] 3.3 `HowItWorks.astro`: redesign `STEPS.map()` output as rounded card boxes with alternating-colored numbered badges; keep `STEPS` content and `id="cara-kerja"` unchanged.

## 4. Removals

- [x] 4.1 Remove `<Documentation />` and `<Legal />` usage from `index.astro`.
- [x] 4.2 Delete `src/components/Documentation.astro` and `src/components/Legal.astro` (confirmed unused elsewhere).

## 5. Verification

- [x] 5.1 `bunx astro check` passes.
- [x] 5.2 Manually verify in browser: new program-cards section renders between Stats and ProgramFeatures with only Jumat Berkah active; Stats shows yellow band and counters still animate; ProgramFeatures shows image-based promo card with unchanged bullets; Cara Kerja shows card-styled steps with unchanged text; Documentation/Legal sections no longer appear; ImpactSection/JoinUs unchanged.
- [x] 5.3 `bun run build` succeeds.
