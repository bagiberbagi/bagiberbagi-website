# Kemitraan: the page a UMKM reads before they message

**Recommendation: one static page at `/kemitraan/`, four sections, backed by a `kemitraan`
singleton — and the unknowns are modelled as empty fields that render nothing, never as
placeholder text in the copy.**

The second half of that sentence is the design. Most of what this page has to say is not known
yet (see the five questions at the top of `tasks.md`), and there are two ways to ship a page in
that state. Writing `[X hari kerja]` into the copy produces a page full of square brackets that
reads as unfinished, and a placeholder that reaches Keystatic is a placeholder that reaches
production. Leaving the field empty produces a page that is *shorter*. Short and true beats long
and bracketed, so the empty-renders-nothing rule runs through every section below.

---

## The one job

> If I send that WhatsApp message, what am I signing up for — in order, from the first message to
> the day the food actually goes out?

Everything that does not serve that sequence is cut. The clearest casualty is an FAQ section,
which the first draft of this design carried: three of its four questions were obligations and
belong in `#syarat`, the fourth fits in one sentence at the CTA, and what would have been left is
an accordion holding four questions nobody has answered yet. That does not read as careful, it
reads as not ready.

---

## The page

Four sections, tier `standard` (the non-beranda default in `layout-tiers.md`), ids in Indonesian
kebab-case per `section-ids.md`, `scroll-mt-24` on all but the first.

```
/kemitraan/
├── #pembuka      what this page answers, and that there is no form here
├── #cara-kerja   the sequence, split: joining (once) / cycle (every distribution)
├── #syarat       what you need to have, and what we ask of you
└── #bergabung    one WhatsApp CTA, plus one honest sentence about what happens next
```

### `#pembuka` — "Sebelum kamu kirim pesan pertama"

Frames the page as the answer to one question, and says up front that there is no form, so the
reader stops looking for a signup button that will never appear. Everything the site does ends in
a conversation; a reader who does not know that spends the whole page waiting for the real
mechanism.

### `#cara-kerja` — "Urutannya, dari pesan pertama sampai penyaluran berjalan"

The spine. Two groups, because they answer different worries:

- **Bergabung**, once at the start: the first message, who replies, what gets checked, what is
  agreed before the first cook.
- **Siklus**, every distribution: how the portion count and date arrive, handover and
  documentation, and the money step *if there is one*.

Splitting them is the single most useful thing on the page. "What do I have to do once" and "what
do I have to do forever" are different commitments, and a flat eight-item list hides which is
which.

Each step carries an optional free-text `durasi`. Free text, not a number with a unit, so the
owner can write "biasanya 2 hari kerja" as they would say it instead of being forced to pick a
unit the reality does not have. Empty means no timing line renders — not a bracket.

**Render threshold: fewer than three filled steps and the section does not render at all.** A
two-step sequence ("you message us, we reply") is not an explanation. It is the WhatsApp button
that already exists in three other places, wearing a heading.

### `#syarat` — "Yang perlu kamu punya, dan yang kami minta"

Two groups in one section: prerequisites checked before the partnership starts, and obligations
that hold while it runs (frequency, minimum term, what happens on a missed schedule, hygiene and
quality standards). One section rather than two, because the reader is making one judgement —
*am I a fit* — and should not have to make it in two places.

Closes by pointing at `/syarat` rather than restating it.

### `#bergabung` — "Kalau ini terdengar cocok"

One WhatsApp CTA carrying exactly the message the other three entry points use, plus one sentence
saying what happens after the tap. That sentence is what replaces the deleted FAQ: unanswered
questions go to the conversation, not into an accordion of unanswered questions.

---

## Content model

A `kemitraan` singleton, JSON, modelled on `about` — which means Keystatic writes one singleton
and Astro reads it through a `defineCollection` with a `*.json` glob, the same split `legal` and
`aksi` already use. Not a collection proper (there is only ever one of this page) and not Markdoc
(this is structured blocks, not one continuous article).

```
kemitraan (singleton, src/content/kemitraan/kemitraan.json)
├── seo        seoFields('judul hero'), same as about
├── pembuka    { eyebrow, judul, lead }
├── langkah[]  { kelompok: 'bergabung' | 'siklus', judul, deskripsi, durasi? }
├── syarat[]   { kelompok: 'punya' | 'diminta', teks }
└── bergabung  { judul, teks }
```

**`langkah` and `syarat` are each one array holding both groups, not two arrays.** Keystatic
gives an array drag-and-drop reordering, and one list the owner can drag freely is easier to
think in than two lists whose boundary is fixed by the schema. The group is a field on the item.

**Step numbers are computed at render from array position, never stored.** Inserting a step in
the middle should not make the owner renumber the ones after it.

**No `waNumber` and no message field.** Both come from `settings/site` through `buildWaLink`, the
same as the rest of the site.

**No `src/lib/kemitraan.ts` yet.** The three strict rules below fit in the page frontmatter, and a
lib file is earned by a real derivation rather than taken up front. `programs.ts` and `aksi.ts`
both exist because several unrelated callers needed the same answer; this page is its own only
caller.

### Permissive schema, strict reader

Straight from `content-model.md`, and it is not stylistic. `astro:content` validates at build even
when no page reads the collection, so a zod rule that rejects something the admin UI can produce
takes the whole build down from a CMS click with no developer present. Every array
`.default([])`, every text `.default('')`, every image `.nullish()`.

The strictness lives in the component, and it is exactly three rules:

1. A `langkah` with an empty `deskripsi` is dropped.
2. `#cara-kerja` does not render if fewer than three `langkah` survive rule 1.
3. A `syarat` group with no items does not render its heading.

Remember that an empty Keystatic field is an **absent key**, not `null` — every serialiser returns
`{ value: undefined }` and `undefined` disappears in JSON. A reader testing `=== null` misses
every real case.

---

## What gets reused

| from | for |
|---|---|
| `Container.astro`, tier `standard` | page shell, the non-beranda default |
| `buildWaLink` in `src/lib/format.ts` | the CTA link, same as everywhere else |
| the WhatsApp glyph in `Footer.astro` / `ClosingSection.astro` | one channel keeps one icon |
| `TrustSection.astro` | precedent for a numbered sequence rendered as argument, not as cards |
| `Ketentuan.astro` | precedent for stance: operational, links `/syarat` instead of copying it |
| `seoFields()` and the `seo` block from `about` | search and share metadata |

---

## The duplicate string, and why it has to be settled first

`"Halo, saya punya usaha kuliner dan ingin jadi Mitra Dapur UMKM."` is written out twice today:

```
src/components/ClosingSection.astro:54   PICKS, id 'dapur'
src/content/aksi/food.json:40            mechanism.conversation.message
```

Two files, character for character identical, neither aware of the other. "Reuse the existing
message" is not a decision until one of them is named the source; without that, this page becomes
the third copy and the next edit desynchronises three places instead of two.

**Recommendation: `aksi/food.json` wins.** It is editor-owned, it already has a reader
(`src/lib/aksi.ts`), and `ClosingSection`'s `PICKS` is a hardcoded array in a component. The
change is for `PICKS.dapur` to resolve its message through `getAksiForProgram`-style lookup
instead of carrying its own literal. That work is small and it does not belong to this change; it
belongs to whichever change ships first after this one is approved.

---

## What was rejected

**A payment step written as a sentence.** The first draft had "pembayaran ditransfer dalam [X hari
kerja]". Whether money moves from bagiberbagi to the kitchen at all is stated nowhere anyone has
confirmed — the only line in the repo that says so is `IMPACTS` in `consts.ts`, which is dead code
(see `proposal.md`). The partnership could be purchase-per-portion, partial subsidy, or the
partner donating the cooking. Inventing a payment term is worse than leaving a gap, because a
gap invites a question and a wrong term invites a dispute.

**Rp25.000 per porsi as the partner's rate.** That number lives in `aksi/food.json` as the
*donor's* price. Not one line in the repo connects it to what a kitchen receives. Carrying it
across would be inventing a margin.

**A requirements list assembled from general culinary-partnership patterns.** Wrong requirements
do not merely misinform, they filter out partners who would actually have fit, and that loss never
shows up in analytics. The groups exist in the schema; their items wait for the owner.

**An FAQ section.** Covered above.

**Prerequisites and obligations as two separate sections.** Merged; one judgement, one place.

**Treating the page as done once it is built.** While `ClosingSection`, the aksi card on
`/berbagi-makanan/`, and the programme-page link all still go straight to WhatsApp, nobody reaches
`/kemitraan`. Rerouting them is in `tasks.md`, not in a follow-up.

---

## Consequence, stated plainly

Before the owner answers the five questions in `tasks.md`, this page renders `#pembuka` and
`#bergabung` and nothing else — no sequence, no requirements. That is by design and it also means
**the page should not be published in that state.** An almost-empty `/kemitraan` is worse than no
`/kemitraan`, because the three existing entry points at least do not pretend to explain anything.
Content first, build second.
