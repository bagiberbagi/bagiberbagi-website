## Context

Tailwind v4 project (`@import "tailwindcss"; @config "../../tailwind.config.mjs";` in `global.css`), config-based theme extension (not CSS `@theme` blocks). Current `tailwind.config.mjs` already has a partial token set (`brand.yellow/blue/orange`, `ink`, `muted`, `border`, font family, one custom breakpoint) — this change extends that same mechanism, not a rewrite of the approach. Audit findings (this session): 12 raw hex colors in component markup (some duplicating existing tokens, some genuinely untokenized), 14 arbitrary font sizes, 2 ad hoc radii, 15 repeats of the same section-wrapper/eyebrow markup.

## Goals / Non-Goals

**Goals:**
- One named token per distinct visual value currently expressed as a raw hex/px arbitrary value.
- Reusable classes for the patterns repeated across most section components (eyebrow, section padding, cards, buttons, coming-soon badge).
- Every existing component retrofitted to the new tokens/classes, with equivalent visual output (no intended redesign).
- Written reference so the 4 queued changes can consume this system directly.

**Non-Goals:**
- Changing the actual visual design/branding (colors, type scale values are consolidations of what's already used, not new aesthetic choices).
- Migrating inline SVG icons to a different icon system (out of scope; `Icon.astro` already exists for the cases that use it — this change ensures its `color` prop values come from tokens, not raw hex, but doesn't convert every inline SVG in `Header`/`Footer`/`DonationCalculator`/`JoinUs` to `Icon.astro` — that's a separate, larger refactor).
- Applying this system to the 4 queued changes' new markup (they're unimplemented; they'll consume the system when built, per the proposal's merge-order note).

## Decisions

**1. Extend `tailwind.config.mjs theme.extend`, don't introduce CSS `@theme` or a separate tokens file.**
Matches the project's existing pattern exactly (already has `colors`, `fontFamily`, `screens` under `extend`); no new tooling/mental model for a small static site.

**2. Color consolidation**: keep `brand.yellow/blue/orange` and `ink`/`muted`/`border` as-is (already correct, just under-used — many components hardcode their hex instead of referencing them). Add:
- `brand.orangeDark` (`#d9660f`) — the existing hover-state shade, currently hardcoded 3×.
- `gray.50` (`#F8FAFC`), replacing both `#F8FAFC` and the near-duplicate `#F4F6F8` with one value — audit found no visual reason for two near-identical light grays; treated as accidental drift, consolidated to one.
- `gray.100` (`#F1F5F9`) — light surface/border gray.
- `gray.400` (`#94A3B8`) — muted/placeholder gray (distinct from `muted` `#64748B`, which is darker body-text gray).
- `gray.300` (`#B4BCC8`) — faint footer text gray.
Alternative considered: map every near-duplicate to the single closest existing token (e.g. force `#F4F6F8` to `#64748B`-derived gray). Rejected where the visual distinction is real (e.g. `muted` vs. placeholder gray are used at different text weights/contexts) — only merged the pair with no evident distinction (`F8FAFC`/`F4F6F8`).

**3. Type scale**: introduce a named `fontSize` scale in the config (e.g. `xs`/`sm`/`base`/`md`/`lg`/`xl`/`2xl`/`3xl`/`4xl`/`5xl`/`6xl`) mapped to the actual values in use today, snapping the closest near-duplicates together (e.g. `13px`/`13.5px` → one `xs`; `26px`/`28px` stay distinct only if genuinely used at different hierarchy levels — resolved case-by-case during implementation, not pre-decided here to avoid guessing wrong before touching real markup).
Alternative considered: use Tailwind's default type scale outright. Rejected — several current sizes (30px, 32px, 34px, 38px for headings) don't map cleanly onto Tailwind defaults, and forcing them would be an actual visual change, which is a non-goal.

**4. Radius scale**: `rounded-xl` styled utilities already exist in Tailwind defaults; add `2xl` → `20px` (the dominant card radius) as a named theme value since `20px` doesn't match Tailwind's default `rounded-2xl` (16px) closely enough to reuse silently.

**5. Component classes via `@layer components` in `global.css`** (`.btn-primary`, `.btn-secondary`, `.card`, `.badge-coming-soon`, `.section`, `.eyebrow`) rather than Astro component wrappers.
Alternative considered: turn these into `.astro` components (e.g. `<Button>`, `<Card>`). Rejected for this change — many existing usages have slightly different surrounding markup (icons inside buttons, different link targets/attributes) that would need prop APIs designed per case; plain utility classes retrofit in place with a smaller diff per file and no new component API surface to design and review. Component-izing can be a later refinement once the classes prove stable.

**6. Retrofit is markup/class-only, no visual redesign.**
Every existing component keeps its current visual output; the change replaces `rounded-[20px]` with `rounded-2xl` (etc.), not the actual radius value. Where an exact snap-together would visibly change something (e.g. two font sizes merged into one), that specific instance is checked against the live site before/after to confirm no visible regression.

## Risks / Trade-offs

- **[Risk]** Touching nearly every component file creates large diff surface and merge conflicts with all 4 queued changes → **Mitigation**: proposal.md recommends merging this first; if the user instead wants to implement the queued changes first, this change's retrofit step should be redone against their landed state (documented as a redo cost, not silently absorbed).
- **[Risk]** Consolidating near-duplicate values (grays, font sizes) could introduce a visible pixel-level shift → **Mitigation**: task list includes an explicit before/after visual check step per consolidated value, not just a build-passes check.
- **[Risk]** `@layer components` classes can be overridden unpredictably by later utility classes if specificity/order isn't managed → **Mitigation**: keep component classes minimal (structural properties only: padding, radius, base color) and let call-site utility classes continue to handle layout/spacing variations, matching how Tailwind's own component-class guidance recommends composing.

## Migration Plan

No data migration (styling-only). Order: extend `tailwind.config.mjs` → add `@layer components` classes to `global.css` → retrofit components in dependency-light order (Icon → Header/Footer → section components → pages) → write `DESIGN_SYSTEM.md` → full visual pass (build + browser check) before merge. Rollback = revert the merge commit (safe since no data/schema involved).

## Open Questions

- Final merge order relative to the 4 queued changes — recommended here (design-system first) but not yet decided by the user.
