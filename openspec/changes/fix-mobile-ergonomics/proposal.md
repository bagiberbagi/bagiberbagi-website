# Fix mobile ergonomics

## Why

A mobile-first responsive audit of the whole site (4 August 2026, production build driven
through a real browser at 320 / 390 / 430 / 768 / 1024 / 1280) found that the layout itself
is sound. Horizontal overflow is zero at all 18 routes and all six widths, measured twice:
once as shipped and once with `body { overflow-x: hidden }` neutralised, so the clean result
is not the clip hiding a defect. Content width still has exactly one owner. Fluid type is
already in place. Nothing in this change rewrites a working layout.

What is broken is the mobile navigation, and it breaks the primary conversion path.

Opening the "Pintu Berbagi" submenu inside the mobile menu grows `#mobile-nav-panel` from
298px to 1483px. The header is `position: sticky; top: 0`, so the panel is pinned to the top
of the viewport and never scrolls with the page. Scrolling the document to the very bottom
leaves the panel's own top at 82px, unchanged. Eight of the panel's thirteen targets never
enter the viewport at any phone size tested, and the last of them is **Donasi Sekarang**.

Below that sits a second, quieter class of problem: interactive elements that are too small
or too tightly packed to hit reliably on a phone. The share row puts five 32×32 targets in a
row with 2px between them. The only slide control on the homepage programme band is a 30×22
tick, because the arrows are hidden below 768. Footer links are 33.7px tall with 0.3px
between them, and two measured pairs are touching.

Finally there are two oversized image assets and a small amount of breakpoint drift. Neither
is urgent, both are cheap.

The full measurement record, including the three starting hypotheses that the audit refuted,
is in `AUDIT.md`. Read it before re-raising anything.

## What Changes

Split by whether a human has to look at the result before it merges.

### Group 1, no visual approval needed

These are either invisible to the eye (bytes, semantics, naming, dead code) or the current
state is unambiguously broken and there is exactly one correct value.

- **Give the mobile nav panel its own height cap and scroll**, so every item stays reachable.
- **Add `widths`/`sizes` to the logo** in header and footer. It currently ships at its full
  2522px source width, 76 KB, on every page, to fill a 201px slot.
- **Route organisasi logos through `astro:assets`**, like programme and jejak photos already
  are. The first real upload is 1079×979 and 66 KB, served raw at every viewport width into
  a 44×44 box.
- **Make the FAQ search wrapper a `<label>`** so the whole 48px field is tappable instead of
  only its inner 22px.
- **Name the 900px breakpoint.** Eight rules across five components switch the page from
  stacked to wide in unison at exactly 900px. It is a real threshold that simply has no name.
- **Clear the small drift**: the dead `relative` alongside `sticky` on the header, the raw
  `md:w-[240px]` on the legal sidebar, the unimported `WhyFood.astro`, and an undocumented
  `body { overflow-x: hidden }`.

### Group 2, needs the owner's eyes on a dev server first

Each of these changes the composition, spacing, or proportion of something that currently
looks fine, and each has more than one defensible answer.

- **Share row** from 32×32 with a 2px gap to 44×44 with a real gap.
- **Programme stage ticks** from a 22px anchor to a 44px one, keeping the 3px bar.
- **Footer link padding** to clear 44px, which grows the mobile footer by roughly 200px and
  may want a column rethink at the same time.
- **The footer's SEO paragraph** into the `prose` tier. It runs 200 characters per line at
  1280px, at 12px, at 65% opacity. The copy does not change, only the measure.
- **Carousel arrows and breadcrumbs** on jejak, programme and pintu pages.
- **Package buttons** on the Ramadhan programme page.
- **Body text on programme and jejak pages**, which have almost no 16px text at all.
- **The hero's 960px breakpoint** folded into 900px, so the page stops splitting in two
  stages 60px apart.

## Capabilities

### Modified Capabilities

- `design-system` — see `specs/design-system/spec.md`. Five requirements are added: expanding
  panels stay reachable, standalone controls meet a 44×44 minimum on phones, every layout shape
  change references a named breakpoint, page shell widths come from the tier vocabulary, and
  assets are served at the size they render.

No new capability, no capability removed. This change is corrective: it writes down rules the
codebase already mostly follows, and fixes the places where it does not.

## Impact

- **Code**: `src/components/Header.astro`, `Footer.astro`, `Share.astro`, `ProgramStage.astro`,
  `DonationCard.astro`, `Hero.astro`, `Faq.astro`, `OrganisasiCard.astro`, `TrustSection.astro`,
  `ImpactSection.astro`, `ClosingSection.astro`, `SolutionSection.astro`,
  `_variants/PintuS1.astro`, `src/layouts/BaseLayout.astro`, `src/layouts/LegalLayout.astro`,
  `src/pages/program/[program].astro`, `src/pages/jejak/index.astro`,
  `src/pages/jejak/[slug].astro`, `src/styles/global.css`, `tailwind.config.mjs`,
  `keystatic.config.ts`, `src/content.config.ts`, `src/lib/organisasi.ts`, `src/lib/assets.ts`.
- **Deleted**: `src/components/WhyFood.astro` (replaced by `ProgramStage.astro`, imported by
  nothing).
- **Content**: none. No copy is rewritten anywhere in this change.
- **Dependencies**: none added. No CSS framework, no client-side framework, no new package.
- **Risk concentrated in two places**: Track B moves an image field's storage path, which is
  the `fields.image` `.slice(prefix.length)` trap already documented in
  `.claude/rules/image-pipeline.md`; and Track D touches five components at once, so it has
  to prove its output is byte-identical rather than be eyeballed.

## Parallelisation

Every track owns its files exclusively, so agents can run at the same time without
overwriting each other. Two ordering constraints exist and are marked.

### Group 1, mergeable without waiting for the owner

| Track | File territory | Depends on |
|---|---|---|
| **A. Header shell + logo** | `Header.astro`, and only the `<Image>` line in `Footer.astro` | none |
| **B. Organisasi logo pipeline** | `OrganisasiCard.astro`, `keystatic.config.ts`, `src/content.config.ts`, `src/lib/organisasi.ts`, `src/lib/assets.ts` | none |
| **C. FAQ search field** | `Faq.astro` | none |
| **D. Name the 900px breakpoint** | `tailwind.config.mjs`, `TrustSection.astro`, `ImpactSection.astro`, `ClosingSection.astro`, `SolutionSection.astro` | none |
| **E. Drift cleanup** | `LegalLayout.astro`, `global.css`, `BaseLayout.astro`, delete `WhyFood.astro` | none |

### Group 2, hold for the owner's visual approval

| Track | File territory | Depends on |
|---|---|---|
| **F. Footer** | `Footer.astro` | **A** (shares the file) |
| **G. Share row** | `Share.astro` | none |
| **H. Programme stage ticks** | `ProgramStage.astro` | none |
| **I. Programme, jejak and pintu pages** | `program/[program].astro`, `jejak/index.astro`, `jejak/[slug].astro`, `_variants/PintuS1.astro` | **D** (uses the new `wide` screen) |
| **J. Donation package buttons** | `DonationCard.astro` | none |
| **K. Hero breakpoint** | `Hero.astro` | **D** (uses the new `wide` screen) |

`Header.astro` and `Footer.astro` are the only files two tracks want. A owns both first and is
small enough to land quickly; F starts after A merges.

## Out of scope

- Copy. Not one sentence of visitor-facing text changes here. The footer's SEO paragraph gets
  a narrower measure, not a rewrite.
- `dvh` instead of `vh`. The only `78vh` that ships is behind `@media (min-width: 768px)`, so
  no phone ever sees it, and the phone path already uses `min-height: 560px`. `Hero.astro`
  already uses `100svh`. Worth doing one day, worth nothing today.
- The `/jejak/` pintu filter chips. They never render with the current content, because only
  one pintu has jejak, so the component falls back to a meta row. Untestable until a second
  pintu has documentation.
- Any automated responsive regression check. Adding one means adding Playwright as a dev
  dependency, which is a separate decision. `tasks.md` carries the manual probe instead.
