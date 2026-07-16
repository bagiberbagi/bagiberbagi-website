# Design System

Single source of truth for colors, type scale, radius, and reusable component classes. Defined in `tailwind.config.mjs` (theme tokens) and `src/styles/global.css` (`@layer components` classes). Use these instead of arbitrary Tailwind values (`text-[17px]`, `bg-[#F1F5F9]`, etc.) — if you need a value that doesn't exist yet, add it here first, don't invent a one-off.

## Colors

| Token | Value | Use for |
|---|---|---|
| `brand.yellow` | `#FFD900` | Hero background, accents |
| `brand.blue` | `#1D46B9` | Primary brand color, links, CTAs |
| `brand.orange` | `#F4791D` | Secondary brand color, CTAs, eyebrow labels |
| `brand.orangeDark` | `#d9660f` | `.btn-primary` hover state |
| `brand.orangeTint` | `#FDEEE1` | Light orange card/icon-box backgrounds |
| `brand.blueTint` | `#E3EAFB` | Light blue card/icon-box backgrounds |
| `ink` | `#0F172A` | Primary text |
| `muted` | `#64748B` | Secondary/body text |
| `border` | `#EEF0F3` | Borders, dividers |
| `gray.50` | `#F8FAFC` | Light section backgrounds (was also `#F4F6F8` — consolidated) |
| `gray.100` | `#F1F5F9` | Light surface backgrounds (buttons, chips) |
| `gray.300` | `#B4BCC8` | Faint footer text |
| `gray.400` | `#94A3B8` | Muted/placeholder text (lighter than `muted`) |

For SVG icons, prefer `stroke="currentColor"` / `fill="currentColor"` plus a `text-*` color class on the element or its wrapper, over passing a raw hex to a `color` prop. Where a literal string value is unavoidable (e.g. `Icon.astro`'s `color` prop, consumed as an SVG attribute, not a class), reference a named constant that mirrors the token (see `BRAND_ORANGE`/`BRAND_BLUE`/etc. in `src/consts.ts`) — never a bare hex literal.

## Type scale

| Token | Value | Typical use |
|---|---|---|
| `micro` | 11px | Tiny badges (e.g. "KOMITMEN" ticker) |
| `eyebrow` | 13px | Eyebrow labels, small badge/checklist text |
| `body-sm` | 14.5px | Secondary body copy |
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

## Radius

- `rounded-card` (20px) — the standard card radius (donation calculator, program cards, blue promo blocks).
- Everything else uses Tailwind's default scale (`rounded-xl`, `rounded-2xl`, `rounded-full`, etc.) unchanged — don't override those defaults; they're already relied on elsewhere at their default pixel values.

## Component classes (`src/styles/global.css`)

- `.section` — standard section wrapper padding (`px-5 md:px-10 py-12 md:py-[88px]`). Only for sections with *symmetric* vertical padding — a section stacked directly under another with intentionally asymmetric (e.g. bottom-only) padding should keep its own utility classes instead (see `HowItWorks.astro`).
- `.eyebrow` — small bold uppercase label above section headings. Defaults to `text-brand-orange`; override color with a trailing utility class (e.g. `class="eyebrow text-brand-yellow"`) when on a dark background — utility classes win over component classes in Tailwind's layer order.
- `.card` — white background + `rounded-card`.
- `.btn-primary` — orange filled pill CTA.
- `.btn-secondary` — white filled pill CTA (for use on colored/dark backgrounds).
- `.badge-coming-soon` — muted "Segera Hadir" pill, for not-yet-active items (mega-menu, program cards).

## Adding a new value

1. Check this file and `tailwind.config.mjs` first — the value you need may already exist under a different name than you expected.
2. If it genuinely doesn't exist, add it to `tailwind.config.mjs` (colors/fontSize/borderRadius) or `global.css` (`@layer components`), then document it here in the same change.
3. Never reintroduce an arbitrary bracket value (`text-[Npx]`, `bg-[#hex]`) for something already covered by a token.
