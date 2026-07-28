# Design System

Single source of truth for the **measurable** half of the design: colors, type scale, spacing, layout, radius, shadow, breakpoints, contrast, motion, and reusable component classes. Defined in `tailwind.config.mjs` (theme tokens) and `src/styles/global.css` (`@layer components` classes). Use these instead of arbitrary Tailwind values (`text-[17px]`, `bg-[#F1F5F9]`, etc.) — if you need a value that doesn't exist yet, add it here first, don't invent a one-off.

The judgement half lives in `DESIGN_PRINCIPLES.md`: what we are building, what it should feel like, and how to decide. That file states the rule, this one states the number. A rule stated there with no number here is how sections drift apart when different people build them.

Tailwind is v4 via `@tailwindcss/vite`, with `tailwind.config.mjs` loaded through `@config` in `src/styles/global.css`. The v4 spacing scale is dynamic, so *any* numeric step resolves (`py-24`, `py-28`, `gap-14` all work). Nothing stops you from inventing a spacing value, which is exactly why the layout values below are prescribed.

Exception: **bespoke scoped-style pages** (`src/pages/berbagi/[category].astro`, and the hero pintu-accent map in `Hero.astro`) intentionally carry their own raw hex inside `<style>` blocks or component-local maps. They are one-off page treatments, not shared surfaces, so they live outside the token system on purpose — don't "fix" them into tokens. Everything under `src/components/` that renders a *shared* surface (cards, buttons, sections, eyebrows) still uses tokens.

## Colors

| Token | Value | Use for |
|---|---|---|
| `brand.yellow` | `#FFD900` | Hero background, accents |
| `brand.blue` | `#1D46B9` | Primary brand color, links, CTAs |
| `brand.orange` | `#F4791D` | Secondary brand color, CTAs, eyebrow labels. Also pintu **Makanan** identity + `FEATURES` icons — keep in sync |
| `brand.orangeDark` | `#C25D0F` | `.btn-primary` hover state |
| `brand.orangeTint` | `#FDEEE1` | Light orange card/icon-box backgrounds |
| `brand.blueTint` | `#E3EAFB` | Light blue card/icon-box backgrounds |
| `ink` | `#0F172A` | Primary text |
| `muted` | `#505D6F` | Secondary/body text |
| `border` | `#EEF0F3` | Borders, dividers |
| `gray.50` | `#F8FAFC` | Light section backgrounds (was also `#F4F6F8` — consolidated) |
| `gray.100` | `#F1F5F9` | Light surface backgrounds (buttons, chips) |
| `gray.300` | `#B4BCC8` | Faint footer text |
| `gray.400` | `#687281` | Muted/placeholder text (lighter than `muted`) |
| `surface.warm` | `#F7F6F3` | Warm neutral section ground. `gray.50` leans blue and reads cold beside the brand yellow; this is its warm counterpart. Section backgrounds only, not card backgrounds |

Font family: `font-sans` = **Plus Jakarta Sans** (`tailwind.config.mjs` `fontFamily.sans`). It's the only family; there is no serif/mono token.

For SVG icons, prefer `stroke="currentColor"` / `fill="currentColor"` plus a `text-*` color class on the element or its wrapper, over passing a raw hex to a `color` prop. Where a literal string value is unavoidable (e.g. `Icon.astro`'s `color` prop, consumed as an SVG attribute, not a class), reference a named constant that mirrors the token (see `BRAND_ORANGE`/`BRAND_BLUE`/etc. in `src/consts.ts`) — never a bare hex literal.

## Pintu colors (5-door identity)

The five "Pintu Berbagi" each carry an identity accent, defined once in `src/consts.ts` (`PINTU` array) as `color` (accent) / `colorTint` (soft background) / `colorDeep` (hover/pressed). Consumed by `/berbagi/[category]` pages via a `--cat` CSS var, the homepage "Arah Kami" cards, and the mega-menu. These are **accents, not full-page themes** — the page chrome stays neutral, the pintu color tints only its own card/hero/marker.

| Pintu (id) | Accent | Tint | Deep |
|---|---|---|---|
| Makanan (`food`) | `#F4791D` | `#FDEEE1` | `#C25D0F` |
| Barang (`goods`) | `#7C4DDA` | `#ECE6FB` | `#5E33B0` |
| Waktu (`time`) | `#E0447B` | `#FBE4EE` | `#B22C5C` |
| Ruang (`space`) | `#0EA5C4` | `#DBF2F8` | `#0B7E97` |
| Dana (`money`) | `#16A34A` | `#DCF3E4` | `#10803A` |

Makanan's accent/tint/deep are deliberately identical to `brand.orange`/`orangeTint`/`orangeDark` — food is the flagship pintu, so its identity *is* the brand orange. Change one, change both.

Note: `Hero.astro` keeps a **separate, lighter** pintu map (`#FF9E4D`, `#A98BF0`, …) for the watermark over its dark hero — those are hero-only accent variants, not the canonical `PINTU` values, and intentionally don't reference this table.

## Type scale

| Token | Value | Typical use |
|---|---|---|
| `label` | 11px | Smallest label size: uppercase labels inside cards and panels, and small captions beside them. Added because this role kept appearing and every author reached for a raw `font-size: 11px` in a scoped block, since `micro` felt too heavy. Pair it with the `.label` component class for the uppercase variant |
| `micro` | 12px | Tiny badges, small uppercase labels |
| `eyebrow` | 13px | Eyebrow labels, small badge/checklist text |
| `body-sm` | 14.5px | Secondary body copy, `.btn-sm` |
| `body` | 15px | Card/list body text, footer column titles |
| `title-sm` | 17px | Small card/feature titles |
| `title` | 22px | Card headings (e.g. donation calculator) |
| `heading-sm` | 26px | H2, mobile |
| `heading` | 28px | H2, mobile (larger sections) |
| `heading-md` | 30px | H1, legal pages, desktop |
| `heading-lg` | 32px | H1, Hero, mobile |
| `heading-xl` | 34px | H2, desktop |
| `display` | 38px | H2, desktop (larger sections) |
| `display-lg` | 56px | Hero H1, desktop |

Tailwind's own default scale (`text-xs`/`sm`/`base`/`lg`/`xl`/`2xl`/`3xl`, etc.) is untouched and still in active use — don't repurpose those keys for new sizes; add a new named key here instead.

## Layout & spacing

The rules `DESIGN_PRINCIPLES.md` states as judgement ("whitespace is composed", "no idle half-column",
"elements proportionate to their field") are enforced by these numbers. They were derived from the
`/new-home` build, where each section was authored independently and drifted until they were pinned
down.

### Section padding

| Context | Class | Computed |
|---|---|---|
| Standard section | `px-5 md:px-10 py-24 md:py-32` | 20/40px horizontal, 96/128px vertical |
| Legacy `.section` helper | `px-5 md:px-10 py-12 md:py-[88px]` | pre-existing sections only, don't use for new work |
| Full-bleed photo section | no padding on the section | padding lives on the inner content block |

Do not invent a third vertical rhythm. If a section genuinely needs more air, that is a composition
problem, not a padding problem.

### Container widths

| Role | Value | Use for |
|---|---|---|
| Page chrome | `max-w-7xl` (80rem / 1280px) | header pill, hero. Hero aligns to the navbar, not to content sections |
| Content section | `max-w-6xl` (72rem / 1152px) | the default for every standard section |
| Section head | `46rem` | eyebrow + H2 + lead block inside a wide section |
| Prose column | `max-w-3xl` (48rem) | a section whose only content is text |
| Minimal CTA | `44rem` | closing CTA |
| Lead paragraph | `58ch` | measure cap, applied on top of the container |
| Body paragraph | `52ch` | measure cap |

Hero sitting at 80rem while content sections sit at 72rem is deliberate: the hero belongs to the
page chrome and lines up with the navbar. Everything below is a reading column.

### Alignment

Section heads align **left**. The single exception is a minimal closing CTA, which may center.
Mixing left and centered heads down a page is the most visible way to make it look unfinished.

### Two-column composition

| Value | Number |
|---|---|
| Column gap, desktop | 56px, up to 64px when both columns are text |
| Split when one column is a photo or diagram | roughly `1.5fr 1fr` in favour of the visual |
| Split when both columns are text | roughly `1.15fr 1fr` |
| Collapse to one column below | 900px (see Breakpoints) |

When a two-column row has one short column, stretch both to the same height and distribute the
short column's content (`align-items: stretch` + `justify-content: space-between`) rather than
leaving a hole under it.

### Gap ceilings inside a section

| Gap | Maximum |
|---|---|
| Section head to its visual anchor | 56px (desktop) |
| Between blocks inside one section | 64px |
| Any empty region inside one section | 96px, hard ceiling |
| Between repeated rows (e.g. one row per program) | 96px mobile, 128px desktop |

A gap larger than the ceiling is a defect, not restraint. Fix it by composition, not by shrinking
type.

### Idle space

No text block may leave 40 percent or more of its container empty beside it with nothing in it.
Either fill the other side with real content, or narrow the container to a prose column so the
space reads as a margin instead of a hole.

## Radius

- `rounded-card` (20px) — the standard card radius (donation calculator, program cards, blue promo blocks).
- Everything else uses Tailwind's default scale (`rounded-xl`, `rounded-2xl`, `rounded-full`, etc.) unchanged — don't override those defaults; they're already relied on elsewhere at their default pixel values.

## Shadow

Centralized shadow scale (`tailwind.config.mjs` `boxShadow`) — avoid slightly-different arbitrary shadows per component.

| Token | Use for |
|---|---|
| `shadow-card` | Large card surfaces |
| `shadow-cardSoft` | Softer large surface |
| `shadow-cardSm` | Small card / hover lift |
| `shadow-menu` | Mega-menu panel |
| `shadow-pill` | Dark badge / pill |

## Breakpoints

Two structural switches, plus Tailwind's defaults for everything else.

| Name | Width | Switches |
|---|---|---|
| `nav` | 860px | header: mobile hamburger vs desktop nav |
| layout | 900px | section layout: single column vs two columns, in scoped `<style>` blocks |
| Tailwind `md` | 768px | utility-class responsive steps (padding, type) |
| Tailwind `lg` | 1024px | rarely needed; prefer the 900px layout switch |

The two structural values are intentionally different: the header changes shape before content does,
so the nav never collapses mid-composition. Do not add a third structural breakpoint. A handful of
older components still use one-off `960px` and `640px` queries; migrate them to 900px when touched.

**Widths to verify before approving any layout:** 390, 768, 1024, 1440. No horizontal overflow at
any of them.

## Contrast floor

Color creates hierarchy, so it has to stay legible. Minimums, following WCAG AA:

| Text | Minimum ratio |
|---|---|
| Body and small text (under 24px, or under 19px bold) | 4.5:1 |
| Large text (24px+, or 19px+ bold) | 3:1 |
| Non-text UI boundaries that carry meaning | 3:1 |

Worked examples on the brand yellow field (`#FFD900`), which is where this breaks most often:

| Combination | Approx. ratio | Verdict |
|---|---|---|
| `ink` `#0F172A` on yellow | ~12.9:1 | safe at any size |
| `brand.orangeDark` `#C25D0F` on yellow | ~3.3:1 | large text only, never for an eyebrow |
| `brand.orange` `#F4791D` on yellow | ~2.2:1 | never |

Same trap on `gray.50`: `#C25D0F` lands around 4.1:1 there, so it is fine for headings and wrong for
13px labels. When an accent colour fails, keep the accent on the *marker* (a dot, a ring, a rule) and
set the text in `ink` or `muted`.

## Motion

Values behind the motion rules in `DESIGN_PRINCIPLES.md`.

| Purpose | Duration | Easing |
|---|---|---|
| Reveal on scroll (fade + rise) | 0.7s | `ease-out` |
| Stagger between items in one group | 90ms, capped at 6 steps | — |
| Hover / focus state | 0.2s | `ease` |
| Line drawing itself in | 0.9s | `ease-out` |
| Count-up | 1.2s to 1.6s | `ease-out` |
| Ambient loop (flowing dot, slow drift) | 7s to 11s | `linear` |

Rise distance for a reveal is 14 to 24px. Anything larger reads as movement for its own sake.

Every one of these must be wrapped in `@media (prefers-reduced-motion: no-preference)` or paired
with a `reduce` branch, and the reduced state must render the **full content immediately**. A
reveal that leaves a section blank when motion is off is a bug, not a graceful degradation.

The shared reveal is `src/scripts/fade-in.js`, driven by `data-fade`. Use it instead of writing a
new IntersectionObserver, unless the section needs per-item choreography (a rail drawing itself, a
timeline unrolling), in which case scope the observer to that component.

## Component classes (`src/styles/global.css`)

- `.section` — standard section wrapper padding (`px-5 md:px-10 py-12 md:py-[88px]`). Only for sections with *symmetric* vertical padding — a section stacked directly under another with intentionally asymmetric (e.g. bottom-only) padding should keep its own utility classes instead (see `HowItWorks.astro`).
- `.label` — the in-card sibling of `.eyebrow`: same role (bold uppercase label) at `text-label` (11px) with wider tracking, no default margin and **no default colour**, because it appears over photos, on amber panels, and on the blue field. Always set the colour where it's used.
- `.eyebrow` — small bold uppercase label above section headings. Defaults to `text-brand-orange`; override color with a trailing utility class (e.g. `class="eyebrow text-brand-yellow"`) when on a dark background — utility classes win over component classes in Tailwind's layer order.
- `.btn-primary` — orange filled pill CTA.
- `.btn-secondary` — white filled pill CTA (for use on colored/dark backgrounds).
- `.btn-sm` — size modifier, use alongside `.btn-primary`/`.btn-secondary`: tighter padding + `text-body-sm`. Defined after the base buttons so it wins.

## Adding a new value

1. Check this file and `tailwind.config.mjs` first — the value you need may already exist under a different name than you expected.
2. If it genuinely doesn't exist, add it to `tailwind.config.mjs` (colors/fontSize/borderRadius/boxShadow/screens) or `global.css` (`@layer components`), then document it here in the same change.
3. Never reintroduce an arbitrary bracket value (`text-[Npx]`, `bg-[#hex]`) for a *shared* surface already covered by a token. Bespoke scoped-style pages (see top note) are the one exception.
4. Layout, spacing, breakpoint, contrast, and motion values are **prescriptions, not defaults**. Tailwind v4 will happily resolve a step this file doesn't list; that it compiles is not permission. Changing one of them changes every section, so change it here first and say why in the commit body.
5. If a change starts as a principle rather than a number, update `DESIGN_PRINCIPLES.md` in the same branch and link the two.
