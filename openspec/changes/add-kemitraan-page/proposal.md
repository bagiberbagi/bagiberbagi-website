# Kemitraan: the page a UMKM reads before they message

## Status

**Design only. Nothing is implemented, nothing is approved, and the owner has explicitly deferred
the build.** This directory holds `design.md` (the model and the page), `tasks.md` (the tracked
plan, blocked at the top on five owner answers), and the spec delta. No source file outside
`openspec/` is touched by this change.

The owner's words when commissioning it: *"aku ingin page kemitraan ini di tuang dalam rancang
aja, krna aku belum ingin kerjakan sekarang."*

## Why

Three places on the live site invite a UMKM to become a kitchen partner. All three end in the
same WhatsApp message and none of them says what the partnership is.

| entry point | what the reader sees before deciding |
|---|---|
| `ClosingSection.astro` (`PICKS`, id `dapur`) | one word, "dapur saya" |
| `src/content/aksi/food.json` (`Jadi mitra dapur`) | one sentence, "UMKM kuliner bergabung memasak untuk penyaluran mingguan." |
| `CATEGORY_CONTENT.food.ctaTitle` in `src/consts.ts` | a question, "Punya surplus makanan atau ingin jadi mitra penyalur?" |

So a small food business taps a button on the strength of one sentence, and everything that
actually binds them — how often they cook, what gets checked before they are accepted, whether
and when money moves — is discovered inside a WhatsApp thread, one at a time, by asking. That is
a fine conversation to have and a bad way to decide whether to have it.

`/kemitraan` is the page that answers, in order, "if I send that message, what am I signing up
for". It sits before contact, not instead of it: the page still ends in the same WhatsApp
message, only now the reader arrives at it already knowing what they are agreeing to.

## What this is not

- **Not a partner showcase.** No logos, no testimonials, no "why it pays off" section. The owner
  reserved `/mitra` for that and it is a separate future change.
- **Not a form.** The site has no server and no form handler anywhere; every action on every page
  ends in WhatsApp, and this page keeps that.
- **Not a second `/syarat`.** Service-wide obligations have exactly one home. This page links
  there rather than restating it, the same discipline `Ketentuan.astro` already follows.

## Two facts found while checking the design, one of which changes it

**`IMPACTS` in `src/consts.ts:46` promises UMKM partners "bayaran tepat waktu", and it is dead
code.** A grep for the identifier across `src/` returns exactly one hit, its own declaration;
`ImpactSection.astro` computes its numbers from `getGlobalImpact()` instead. So the promise is
not published today. It matters anyway, for two reasons: it is the only place in the repo that
states money reaches the kitchen at all, and it is one import away from being live. Anyone who
wires that array up publishes a payment guarantee whose terms nobody has written. Deleting it or
backing it belongs to whoever answers Q1 in `tasks.md`, not to this change.

**`Faq.astro` already declares a `Kemitraan` category and it holds zero questions.** `CATEGORIES`
lists five slugs; `faq.json` has items in three of them. The empty group is filtered out by
`.filter((g) => g.items.length > 0)`, so nothing renders and nothing is broken. It is named here
because it is the nearest existing home for this content and it is the wrong one: an FAQ answers
questions a reader already thought to ask, and the gap this change closes is that a UMKM does not
yet know which questions exist. The sequence has to be readable in order, which is a page, not an
accordion.

## Impact

- New capability: `kemitraan-page` (spec delta in `specs/`).
- Touches `content-cms` when built: one new Keystatic singleton, `kemitraan`.
- **A duplicate string has to be resolved before a fourth mount is added.** The kitchen-partner
  WhatsApp message is written out twice today, at `ClosingSection.astro:54` and
  `src/content/aksi/food.json:40`, character for character, in two files that do not know about
  each other. Adding this page without picking one source makes it three.
- **The page is not finished when it is built.** While all three entry points still link straight
  to WhatsApp, nobody reaches it. Rerouting them ships with the page.
