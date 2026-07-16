## 1. Tokens

- [x] 1.1 Extend `tailwind.config.mjs` colors: add `brand.orangeDark` (`#d9660f`), `gray.50` (`#F8FAFC`, replacing `#F4F6F8` too), `gray.100` (`#F1F5F9`), `gray.300` (`#B4BCC8`), `gray.400` (`#94A3B8`).
- [x] 1.2 Extend `tailwind.config.mjs` fontSize: define named scale covering current 11–56px range, snapping genuine near-duplicates together (verify each snap visually per 5.x).
- [x] 1.3 Extend `tailwind.config.mjs` borderRadius: added as `card` → `20px` (not `2xl` — that key already means 16px via Tailwind default and is in live use in `JoinUs`/`Hero`/`DonationCalculator`; overriding it would have been a silent regression).

## 2. Component classes

- [x] 2.1 Add `@layer components` block to `global.css`: `.section` (`px-5 md:px-10 py-12 md:py-[88px]`).
- [x] 2.2 Add `.eyebrow` (orange, bold, uppercase, tracking-wide, small text). Color overridable by a trailing utility class (e.g. `text-brand-yellow` in `ImpactSection`) since Tailwind's utilities layer wins over `@layer components`.
- [x] 2.3 Add `.btn-primary` (orange filled pill) and `.btn-secondary` (outline/white pill).
- [x] 2.4 Add `.card` (white, `rounded-card`).
- [x] 2.5 Add `.badge-coming-soon` ("Segera Hadir" muted pill).

## 3. Retrofit — layout & nav

- [x] 3.1 `src/layouts/BaseLayout.astro` — `<style>` block now uses `theme(colors.brand.yellow)`/`theme(colors.ink)` instead of raw hex; favicon data-URI hex left as-is (not page markup).
- [x] 3.2 `Header.astro`, `Footer.astro` — raw hex SVG strokes/fills → `currentColor` + `text-*` token classes; `.btn-primary` applied to CTA links; `text-[15px]`/`text-[13.5px]` snapped to `text-body`/`text-eyebrow`; `#94A3B8`/`#B4BCC8`/`#F8FAFC` → `gray-400`/`gray-300`/`gray-50`.

## 4. Retrofit — homepage sections

- [x] 4.1 `Hero.astro` — font sizes snapped, `stroke`/`bg` hex → `currentColor`/`bg-brand-orange/20`.
- [x] 4.2 `Stats.astro` — `text-[32px]` → `text-heading-lg`.
- [x] 4.3 `ProgramFeatures.astro` — `.section`/`.eyebrow`, font sizes, `rounded-card`.
- [x] 4.4 `HowItWorks.astro` — `.eyebrow`, font sizes (kept `pb`-only wrapper padding as-is, not `.section`, since it's asymmetric by design).
- [x] 4.5 `ImpactSection.astro` — `.section`, `.eyebrow` (color override via trailing `text-brand-yellow`), font sizes, `rounded-card`.
- [x] 4.6 `JoinUs.astro` — `.section`, `.eyebrow`, `.btn-primary`/`.btn-secondary`, new `brand.orangeTint`/`brand.blueTint` tokens (discovered mid-retrofit, added to `tailwind.config.mjs`), `rounded-card`, font sizes, hex strokes → `currentColor`.
- [x] 4.7 `Faq.astro` — `.section`, `.eyebrow`, font sizes, hex stroke → `currentColor`.
- [x] 4.8 `DonationCalculator.astro` — font sizes, `#94A3B8`/`#F1F5F9` → `gray-400`/`gray-100`, hex strokes → `currentColor`, `rounded-card`.
- [x] 4.9 `Icon.astro` callers — `FEATURES` in `consts.ts` now reference named `BRAND_ORANGE`/`BRAND_BLUE`/`*_TINT` constants (mirroring the Tailwind tokens) instead of inline raw hex; `IMPACTS` already passed non-hex (`"white"`), no change needed.

**Skipped**: `Documentation.astro`, `Legal.astro` — slated for deletion in `homepage-redesign`; retrofitting them here would be wasted work regardless of merge order.

## 5. Retrofit — pages & verification

- [x] 5.1 `privasi.astro`/`syarat.astro`/`transparansi.astro` — `.section`, `.eyebrow`, font sizes fixed (identical pattern across all 3). `index.astro`/`faq.astro` had no raw values to begin with.
- [x] 5.2 Visual check: every consolidated value (gray merges, snapped font-sizes) maps to a pixel-identical or negligibly-different (≤0.5px) replacement; no property changed beyond color/size naming.
- [x] 5.2b Skipped — no browser tool available this session (Playwright MCP connected mid-session but its tools didn't load without a session restart). User accepted the risk and chose to proceed without a manual visual pass.
- [x] 5.3 `grep -rE '#[0-9A-Fa-f]{3,6}'` over `src/components/`, `src/pages/`, `src/layouts/` returns no matches, **excluding** `Documentation.astro`/`Legal.astro` (deliberately skipped — slated for deletion in `homepage-redesign`, see tasks.md section 4 note).
- [x] 5.4 `grep -rE 'text-\['` over the same paths, same exclusion, returns no matches.
- [x] 5.5 `bunx astro check` passes (0 errors, 0 warnings, 4 pre-existing hints in `legacy/support.js` unrelated to this change).
- [x] 5.6 `bun run build` succeeds. Caught one real bug: Tailwind v4 (config via `@config`, not native `@theme`) doesn't resolve the `theme()` CSS function the way v3 did — `BaseLayout.astro`'s `::selection` rule failed the build. Fixed by switching to Tailwind's `selection:*` utility variant on `<body>` instead of a plain-CSS `<style>` block.

## 6. Documentation

- [x] 6.1 Wrote `DESIGN_SYSTEM.md`: full token tables (color/type/radius), component class reference, and a 3-step "adding a new value" guide.
