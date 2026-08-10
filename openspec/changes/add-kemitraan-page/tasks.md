# Tasks

**Nothing here is started, and Track C cannot start at all until the five questions below are
answered.** They are not preferences. Every one of them is a fact only the owner holds, and none
of them can be derived from the codebase — that was checked.

## Blocking: five questions for the owner

- [ ] **Q1. Are kitchen partners paid?** If yes, is it purchase-per-portion, partial subsidy, or
  something else? This decides whether the last step of `#cara-kerja` exists at all. Nothing in
  the repo answers it: the only line that claims money reaches the kitchen is `IMPACTS` in
  `src/consts.ts:46`, and that array is dead code.
- [ ] **Q2. If paid: what is the rate based on, when does it clear, and counted from what event?**
  Handover, photo verification, month end? The Rp25.000 in `aksi/food.json` is the *donor's*
  price, not an answer to this.
- [ ] **Q3. The real sequence from first WhatsApp message to first cook.** Who replies, is there a
  kitchen visit and who goes, what is agreed before starting, and is the first order a trial or
  full size?
- [ ] **Q4. What actually gets checked before a partner is accepted?** Which paperwork if any
  (NIB, PIRT, halal certification, or none), minimum capacity in portions per cook, and which
  areas distribution currently reaches.
- [ ] **Q5. What commitment is asked?** Weekly or occasional, minimum term, what happens on a
  missed schedule, and what happens if quality falls short.

Q1 also decides the fate of `IMPACTS`: either it gets backed by a real term and can be wired up,
or its payment sentence is wrong and the array should be deleted rather than left loaded.

---

## File territory

| Track | File territory | Depends on |
|---|---|---|
| **A. Schema, both sides** | `src/content.config.ts`, `keystatic.config.ts` | none |
| **B. Page and sections** | `src/pages/kemitraan.astro` | **A** |
| **C. Content authoring** | `src/content/kemitraan/kemitraan.json` | **A** + Q1–Q5 |
| **D. Message single-source** | `src/components/ClosingSection.astro`, `src/lib/aksi.ts` | none |
| **E. Rerouting the entry points** | `src/components/ClosingSection.astro`, `src/content/aksi/food.json`, `src/consts.ts` | **B**, **C** |
| **F. SEO and share image** | `src/content/seo/seo.json`, `src/pages/open-graph/[...route].ts` | **B** |

A and D can run at the same time as each other; both touch different files. E must come last
because it points readers at a page that has to be worth reaching.

---

## A. Schema, both sides

- [ ] Add the `kemitraan` singleton to `keystatic.config.ts`, modelled field-for-field on `about`:
      `seoFields('judul hero')`, `pembuka` object, `langkah` array, `syarat` array, `bergabung`
      object. Put it in a sensible `ui.navigation` group.
- [ ] Add the matching `defineCollection` to `src/content.config.ts` with a `*.json` glob over
      `./src/content/kemitraan`, permissive throughout: arrays `.default([])`, text `.default('')`,
      `seo` `.optional()` with any image `.nullish()`.
- [ ] `bunx astro check` clean, `bun run build` clean with the collection present and empty.

## B. Page and sections

- [ ] `src/pages/kemitraan.astro` at tier `standard`, four sections with the ids from `design.md`,
      `scroll-mt-24` on all but `#pembuka`.
- [ ] Implement the three strict rules in frontmatter: drop steps with empty `deskripsi`, skip
      `#cara-kerja` under three surviving steps, skip an empty `syarat` group heading.
- [ ] Step numbers computed from array index, not stored.
- [ ] CTA uses `buildWaLink` over `settings/site.waNumber` and the WhatsApp glyph already used in
      `Footer.astro`.
- [ ] Check at 320px that no section lands under the sticky header.

## C. Content authoring — blocked on Q1–Q5

- [ ] Write `#pembuka` and `#bergabung` copy in the owner's words.
- [ ] Fill `langkah` from Q3 and Q1/Q2, `syarat` from Q4 and Q5.
- [ ] **Do not publish the page while `langkah` holds fewer than three steps.** The threshold in
      Track B stops the section rendering; it does not stop a near-empty page going live.

## D. Message single-source

- [ ] Pick `aksi/food.json` as the source for the kitchen-partner WhatsApp message and have
      `ClosingSection.astro`'s `PICKS.dapur` read it instead of carrying its own literal.
- [ ] Confirm by grep that the string appears once, not twice, and not three times.

## E. Rerouting the entry points — blocked on B and C

- [ ] `ClosingSection.astro` `PICKS.dapur` points at `/kemitraan/` rather than `wa.me`.
- [ ] The `Jadi mitra dapur` aksi in `food.json` gets a destination that is the page.
- [ ] `CATEGORY_CONTENT.food.ctaTitle` in `consts.ts` links there too.
- [ ] Re-run the anchor check from `.claude/rules/section-ids.md` after the build.

## F. SEO and share image

- [ ] Add a `/kemitraan/` entry to `seo.pages[]`.
- [ ] Add the route to the manual entries in `open-graph/[...route].ts`.

---

## Out of scope, named so it is not re-litigated

- **`/mitra`**, the partner showcase with logos and stories. The owner reserved that route for a
  separate change.
- **Backing or deleting `IMPACTS`.** It follows from Q1 and belongs to whoever answers it.
- **A `src/lib/kemitraan.ts`.** Earned by a real derivation, not taken in advance.
