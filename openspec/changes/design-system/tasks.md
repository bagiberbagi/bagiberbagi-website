## 1. Tokens

- [ ] 1.1 Extend `tailwind.config.mjs` colors: add `brand.orangeDark` (`#d9660f`), `gray.50` (`#F8FAFC`, replacing `#F4F6F8` too), `gray.100` (`#F1F5F9`), `gray.300` (`#B4BCC8`), `gray.400` (`#94A3B8`).
- [ ] 1.2 Extend `tailwind.config.mjs` fontSize: define named scale covering current 11–56px range, snapping genuine near-duplicates together (verify each snap visually per 5.x).
- [ ] 1.3 Extend `tailwind.config.mjs` borderRadius: add `2xl` → `20px`.

## 2. Component classes

- [ ] 2.1 Add `@layer components` block to `global.css`: `.section` (`px-5 md:px-10 py-12 md:py-[88px]`).
- [ ] 2.2 Add `.eyebrow` (orange, bold, uppercase, tracking-wide, small text).
- [ ] 2.3 Add `.btn-primary` (orange filled pill) and `.btn-secondary` (outline/white pill).
- [ ] 2.4 Add `.card` (white, rounded-2xl, shadow).
- [ ] 2.5 Add `.badge-coming-soon` ("Segera Hadir" muted pill).

## 3. Retrofit — layout & nav

- [ ] 3.1 `src/layouts/BaseLayout.astro` — any raw hex/font-size values (e.g. favicon accent colors can stay as-is if not visible in markup; check `<style>` block).
- [ ] 3.2 `Header.astro`, `Footer.astro` — replace raw hex SVG stroke/fill colors with token references; apply `.eyebrow`/`.section` where applicable.

## 4. Retrofit — homepage sections

- [ ] 4.1 `Hero.astro`
- [ ] 4.2 `Stats.astro`
- [ ] 4.3 `ProgramFeatures.astro`
- [ ] 4.4 `HowItWorks.astro`
- [ ] 4.5 `ImpactSection.astro`
- [ ] 4.6 `JoinUs.astro`
- [ ] 4.7 `Faq.astro`
- [ ] 4.8 `DonationCalculator.astro`
- [ ] 4.9 `Icon.astro` — ensure `color` prop callers pass token-derived values, not raw hex.

**Skipped**: `Documentation.astro`, `Legal.astro` — slated for deletion in `homepage-redesign`; retrofitting them here would be wasted work regardless of merge order.

## 5. Retrofit — pages & verification

- [ ] 5.1 `src/pages/index.astro`, `faq.astro`, `privasi.astro`, `syarat.astro`, `transparansi.astro` — any page-level raw values.
- [ ] 5.2 Visual before/after check for every consolidated near-duplicate value (grays, snapped font sizes) — confirm no visible regression.
- [ ] 5.3 `grep -rE '#[0-9A-Fa-f]{3,6}'` over `src/components/`, `src/pages/`, `src/layouts/` returns no matches.
- [ ] 5.4 `grep -rE 'text-\['` over the same paths returns no matches.
- [ ] 5.5 `bunx astro check` passes.
- [ ] 5.6 `bun run build` succeeds.

## 6. Documentation

- [ ] 6.1 Write `DESIGN_SYSTEM.md` (or add a `## Design System` section to `CLAUDE.md`): token list, component classes, usage guidance for future work.
