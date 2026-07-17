## Why

An audit of `src/components/` found 12 distinct raw hex colors (several duplicating existing `brand.*`/`ink`/`muted` tokens by typing the hex instead of using the token; others — `#d9660f`, `#F1F5F9`, `#94A3B8`, `#F8FAFC` vs. near-identical `#F4F6F8` — with no token at all), 14 distinct arbitrary font sizes (`text-[11px]` through `text-[56px]`), 2 ad hoc border-radius values, and the same "eyebrow label + section padding" markup pattern hand-repeated 15 times. Four other changes are queued for implementation (`program-megamenu-pages`, `legal-page-layout`, `standalone-faq-page`, `homepage-redesign`) that will each add new visual elements (badges, cards, buttons) — without a shared reference, they'll each invent their own one-off values, compounding the inconsistency. A design system (tokens + reusable component classes) gives every future and existing visual a single source of truth.

## What Changes

- Extend `tailwind.config.mjs` with a complete token set: full color palette (fill gaps: orange hover/dark shade, consolidated gray scale replacing the near-duplicate `#F8FAFC`/`#F4F6F8`, muted-light/placeholder gray, faint text gray), a border-radius scale, and a type scale (replacing the 14 arbitrary font sizes with a consistent named scale).
- Add reusable component-level classes (Tailwind `@layer components` in `global.css`): `.btn-primary` / `.btn-secondary` (CTA pill buttons), `.card` (rounded white card), `.badge-coming-soon` (the "Segera Hadir" pattern needed by 3 of the 4 queued changes), `.section` (the repeated `px-5 md:px-10 py-12 md:py-[88px]` wrapper), `.eyebrow` (the repeated orange uppercase label).
- **Retrofit all existing components** (`Header`, `Hero`, `Stats`, `ProgramFeatures`, `Documentation`, `HowItWorks`, `ImpactSection`, `JoinUs`, `Faq`, `Legal`, `Footer`, `DonationCalculator`, `Icon`, and the 4 legal/faq pages) to use the new tokens/classes instead of arbitrary values — **BREAKING** in the sense that it touches nearly every component file, though visual output is intended to be pixel-equivalent (a consolidation, not a redesign).
- Add a short written reference (`DESIGN_SYSTEM.md` or a new `## Design System` section in `CLAUDE.md`) documenting the tokens/classes and when to use each, so the 4 queued changes (and future work) consume this instead of reinventing values.

## Capabilities

### New Capabilities
- `design-system`: Centralized design tokens (color/type/radius scale) and reusable component classes (button/card/badge/section/eyebrow), documented, and applied across all existing components.

### Modified Capabilities
(none — no existing spec files in `openspec/specs/`)

## Impact

- `tailwind.config.mjs` — extended theme (colors, borderRadius, fontSize).
- `src/styles/global.css` — new `@layer components` block.
- Every file in `src/components/`, plus `src/pages/*.astro` and `src/layouts/BaseLayout.astro` where section/eyebrow/button patterns appear — visual-equivalent markup/class changes only, no behavior/data changes.
- New `DESIGN_SYSTEM.md` (or `CLAUDE.md` addition).
- **Merge-order note**: this change touches nearly every component also touched by `program-megamenu-pages`, `legal-page-layout`, `standalone-faq-page`, and `homepage-redesign`. Recommend merging this change to `main` **before** those four, so they're implemented against (and consume) the new tokens/classes directly instead of each rebasing a token refactor afterward. Flagged for user's merge-order decision, not assumed.
