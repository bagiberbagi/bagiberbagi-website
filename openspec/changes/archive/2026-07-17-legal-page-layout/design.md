## Context

`legal` Content Collection (`src/content.config.ts`) currently schema `{ title: string }`, markdown body rendered via `getEntry` + `render()` + `<Content />`. Three pages (`syarat.astro`, `privasi.astro`, `transparansi.astro`) each duplicate the same `BaseLayout` + `Header` + prose section + `Footer` structure. Existing `scrollspy.js` hard-codes its target ids from `NAV_SECTION_IDS` (main nav) via `IntersectionObserver` + `[data-nav-link]` — a working, proven pattern, just not generic enough to reuse as-is for per-page, dynamically-numbered legal sections.

## Goals / Non-Goals

**Goals:**
- One shared layout for legal-style long-form pages: header block + sticky scrollspy TOC + content.
- TOC entries generated from actual content headings (no hand-kept duplicate list to drift).
- `/syarat` content matches the mockup's 15-section depth.
- `/privasi` and `/transparansi` adopt the new structural layout without a content rewrite.

**Non-Goals:**
- Rewriting `privacy.md`/`transparency.md` content depth.
- Any change to `Header.astro` nav or the mega-menu (separate change).
- A generic "TOC" component reused outside the legal-page context (only these 3 pages need it right now).

## Decisions

**1. TOC sourced from Astro's `render()` `headings` array, not a schema field or hand-written list.**
`render(entry)` already returns `{ Content, headings }` where `headings` is `{ depth, slug, text }[]` derived from the markdown's actual headings, and Astro auto-assigns matching `id` attributes to rendered heading elements. Filtering to `depth === 2` gives exactly the TOC list, always in sync with content — no separate data source to maintain.
Alternative considered: add a `toc` field to the schema. Rejected — pure duplication of what markdown already encodes structurally.

**2. New `LegalLayout.astro` in `src/layouts/`, taking `title`, `updatedAt`, and a `headings` prop, wrapping `<slot />` for content.**
Keeps `BaseLayout` untouched (still just the HTML shell); `LegalLayout` sits between it and the page content, matching the existing layering (`BaseLayout` → page → components).
Alternative considered: a shared `.astro` component instead of a layout. Rejected — this genuinely wraps a full page region (header block + two-column body around a content slot), which is what layouts are for; a plain component would need the same slot mechanics anyway.

**3. New `src/scripts/legal-toc-scrollspy.js`, generalized off DOM state rather than an imported id list.**
Query `[data-toc-link]` elements already in the DOM, read each one's own `data-toc-link` value (the target heading's slug), and observe those ids — no import of a fixed const array (unlike `NAV_SECTION_IDS`), since the section set differs per legal page. Kept as a separate script file rather than modifying `scrollspy.js`, to avoid touching the main-nav behavior that's already working in production.

**4. `updatedAt` added to `legal` schema as `z.string()` (display string, e.g. `"24 Juli 2026"`), not `z.date()`.**
Matches how the site already handles the one other date-ish thing (WA numbers, labels) as display-ready strings, and avoids introducing date-formatting/timezone logic for a value that's just displayed verbatim, never computed on. Keystatic's field UI for a plain string is also simpler for a non-technical editor than a date picker requiring a specific format.

**5. `/syarat` content (15 sections) is drafted by the assistant as a first pass, explicitly flagged for the user's review before merge** — this is legal-facing copy; the assistant is not a substitute for the user's own legal judgment on final wording.

## Risks / Trade-offs

- **[Risk]** Draft legal copy (new 8 sections) may not reflect the user's actual intended policies/terms → **Mitigation**: clearly marked as a draft in the PR/commit, user reviews before this branch merges to `main`.
- **[Risk]** Generalized scrollspy script duplicates ~80% of `scrollspy.js`'s logic → **Mitigation**: acceptable now (2 call sites, different data sources); revisit as a shared utility only if a third consumer appears (avoid premature abstraction).
- **[Risk]** Long TOC (15 items) may be visually heavy on mobile → **Mitigation**: TOC collapses to a non-sticky block above content on mobile (standard responsive pattern already used elsewhere on the site, e.g. mobile nav panel vs desktop nav).

## Migration Plan

No runtime data migration (static content collection, rebuilt at deploy time). Steps: add schema field → update 3 markdown frontmatters → build `LegalLayout` + scrollspy script → migrate 3 pages → expand `terms.md` content → user review → merge to `main` (confirm before push, per standing instruction). Rollback = revert the merge commit.

## Open Questions

- Exact final wording of the 8 new Syarat sections — drafted by assistant, pending user review (not a blocking technical unknown, but flagged so it isn't merged unreviewed).
