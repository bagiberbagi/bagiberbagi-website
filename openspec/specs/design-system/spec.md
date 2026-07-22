# design-system Specification

## Purpose
Keep the visual language (colors, type scale, radius, shadow, component classes) centralized and documented so shared surfaces stay consistent and a contributor knows which token/class to reach for. Tokens live in `tailwind.config.mjs` + `src/consts.ts`, component classes in `src/styles/global.css`, and the human-readable reference in `DESIGN_SYSTEM.md`.
## Requirements
### Requirement: Centralized color tokens on shared surfaces
All colors used by **shared surfaces** (cards, buttons, sections, eyebrows, nav) in `src/components/`, `src/pages/`, and `src/layouts/` SHALL reference a named Tailwind theme token (via `tailwind.config.mjs`) or a `src/consts.ts` constant mirroring one; no raw hex color values SHALL remain in the markup or inline styles/SVG attributes of those surfaces.

**Bespoke scoped-style pages** are exempt: a page with a one-off visual treatment (`src/pages/berbagi/[category].astro` scoped `<style>`, and the hero pintu-accent map in `Hero.astro`) MAY carry raw hex, because it is a single-page treatment, not a shared surface. The 5-door pintu identity colors themselves are centralized in the `src/consts.ts` `PINTU` array (`color`/`colorTint`/`colorDeep`).

#### Scenario: No raw hex on shared surfaces
- **WHEN** the codebase is searched for hex color literals (`#[0-9A-Fa-f]{3,6}`) in shared-surface markup under `src/components/`, `src/pages/`, `src/layouts/`
- **THEN** no matches are found outside `tailwind.config.mjs`, `src/consts.ts`, and the exempt bespoke scoped-style pages

#### Scenario: Near-duplicate grays are consolidated
- **WHEN** a component previously used `#F8FAFC` or `#F4F6F8` for a light background
- **THEN** it now uses the single consolidated `gray.50` token, with no visible change to the rendered page

### Requirement: Centralized type scale
Font sizes SHALL use a named scale defined in `tailwind.config.mjs`, not arbitrary bracket values (e.g. `text-[26px]`).

#### Scenario: No arbitrary font-size brackets remain
- **WHEN** the codebase is searched for `text-\[` arbitrary font-size utilities in `src/components/`, `src/pages/`
- **THEN** no matches are found

### Requirement: Reusable component classes
`.btn-primary`, `.btn-secondary`, `.btn-sm`, `.section`, and `.eyebrow` SHALL exist as `@layer components` classes in `global.css`, and SHALL be used by every component matching that visual pattern.

#### Scenario: Section wrapper pattern uses the shared class
- **WHEN** any homepage section component renders its outer wrapper
- **THEN** it uses the `.section` class instead of repeating `px-5 md:px-10 py-12 md:py-[88px]` inline

#### Scenario: Eyebrow label pattern uses the shared class
- **WHEN** any section renders its small uppercase orange label (e.g. "PROGRAM", "FAQ", "CARA KERJA")
- **THEN** it uses the `.eyebrow` class instead of repeating the same utility combination inline

#### Scenario: Button size modifier is reusable
- **WHEN** a smaller variant of a pill CTA is needed
- **THEN** it composes `.btn-sm` alongside `.btn-primary`/`.btn-secondary` instead of redefining tighter padding inline

### Requirement: No visual regression from retrofit
Retrofitting existing components to use tokens/classes SHALL NOT change the rendered visual output of any existing page.

#### Scenario: Homepage renders identically before and after
- **WHEN** the homepage is compared before and after this change (build output / browser render)
- **THEN** layout, colors, spacing, and typography appear the same to visual inspection

### Requirement: Written design system reference
A written reference documenting the tokens and component classes, and when to use each, SHALL exist in the repo.

#### Scenario: Reference is discoverable
- **WHEN** a contributor needs to know which token/class to use for a new visual element
- **THEN** `DESIGN_SYSTEM.md` (or the equivalent `CLAUDE.md` section) documents the available tokens and classes with usage guidance

