## Why

A full-homepage mockup (`megamenu.svg`, design reference only, rasterized and inspected this session) revealed several homepage sections have a different design than what's live, beyond just the Program mega-menu. Comparing section-by-section against current components surfaced a consistent, bounded set of changes — captured here as one change since they all come from the same mockup and compose one visual pass over the homepage.

## What Changes

- **New section** "Salurkan Kebaikan Melalui Program Kami": 3 cards for the `bagiberbagimakanan` category's items (Jumat Berkah, Ramadhan Berkah, Berbagi Makanan Harian), positioned between `Stats` and `ProgramFeatures`. Only Jumat Berkah is active (CTA button linking to `/jumat-berkah`); the other 2 show a "Segera Hadir" state, no button — matches `plan.md`'s "only Jumat Berkah active" intent even though the mockup itself visually shows all 3 with buttons (mockup treated as an idealized full-vision comp, not literal current-state truth).
- **Stats**: add a yellow/gold full-width background band. Content/behavior (count-up numbers, labels) unchanged.
- **ProgramFeatures**: replace the plain blue promo block with an image + caption-overlay card. `FEATURES` bullet copy and the eyebrow/H2/intro text are unchanged (mockup matches current copy exactly).
- **Cara Kerja (`HowItWorks`)**: redesign the 5 steps from bare numbered text into rounded card boxes with alternating orange/blue numbered badges. `STEPS` content unchanged (mockup matches current copy exactly).
- **Remove** `Documentation` section ("Bukti Nyata dari Lapangan" placeholder photo grid) from the homepage — not present in the mockup.
- **Remove** `Legal` section (inline privacy/terms snippet) from the homepage — not present in the mockup; superseded by the dedicated `/privasi`/`/syarat` pages.
- **No change**: `ImpactSection` and `JoinUs` — content and layout match the mockup already; the mockup's plain white-square icons in these two sections are treated as an SVG-export artifact (Icon.astro icons not surviving the design tool's export), not an intentional design change.

## Capabilities

### New Capabilities
- `homepage-makanan-program-cards`: New homepage section showing the 3 `bagiberbagimakanan` items as cards with one active/CTA state and two coming-soon states.

### Modified Capabilities
(none — no existing spec files in `openspec/specs/`; the visual-only changes to Stats/ProgramFeatures/HowItWorks and the removals are implementation detail under the same umbrella, covered by design.md + tasks.md rather than separate delta specs, since no prior spec exists to delta against)

## Impact

- `src/components/` — new component for the makanan-program-cards section; `Stats.astro`, `ProgramFeatures.astro`, `HowItWorks.astro` get visual/markup updates (no prop/data shape changes beyond what's noted); `Documentation.astro`, `Legal.astro` become unused (removed from `index.astro`, files left in place unless confirmed dead — see tasks).
- `src/consts.ts` — new data for the makanan-program-cards section (see design.md for shape/naming, given the known overlap with `program-megamenu-pages`'s `PROGRAM_MENU` and `homepage-program-showcase`'s superseded `PROGRAM_CATEGORIES`).
- `src/pages/index.astro` — insert new section between `Stats` and `ProgramFeatures`; remove `Documentation` and `Legal`.
- No changes to nav, Header.astro, or deploy pipeline.
