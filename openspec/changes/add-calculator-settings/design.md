# The ask card: one source, placeable anywhere

**Recommendation: give the card a single-source reader the way programme covers already have
one, so mounting it costs one prop instead of ten. Making its numbers editable is a rider on
that, not the point of it.**

This document was rewritten after the owner corrected the premise. The first version modelled a
`calculators` collection of unit, price and presets. That answered the wrong question. His words:

> "aku tidak menganggap calculator itu sebatas itung2an sih, jadi mungkin kita perlu istilah lain
> kali ya, tpi yg jelas yg kumaksd kalkulator itu adalah ya card yg akan selalu jadi rujukan itu
> dan bisa di tempel dimana2 gt nantinya."

So the subject is **the card**. Arithmetic is one thing inside it, not its definition. What he
wants is a canonical card that is always the reference and can be placed anywhere.

## What the first pass got wrong, and what survives

Wrong: that the blocker was hardcoded numbers. It is not. The numbers are a real annoyance and a
separate, smaller fix.

**The blocker is the mount cost.** `DonationCard.astro` declares twelve props and is mounted in
exactly two places, `Hero.astro` and `program/[program].astro`. Each mount hand-assembles nine
props plus a named slot, pulled from three unrelated sources:

```astro
<DonationCard
  id="donasi" photo={programCover} programLabel={programLabel}
  programSummary={program?.summary} programHref={program?.href}
  agenda={site.data.nextAgenda} schedule={site.data.schedule}
  waNumber={site.data.waNumber} trackSource="hero_card"
>
  {impact.jejakCount > 0 && <a slot="foot" href="/jejak/">…</a>}
</DonationCard>
```

`programCover` comes from the programmes collection, `agenda`/`schedule`/`waNumber` from the
`settings` singleton, `jejakCount` from `impact.ts`. A third mount site means re-deriving all of
it correctly, and any of it can drift out of step with the other two. That is the actual reason
the card is not "ditempel di mana-mana" today.

Survives from the first pass, because it was measured rather than assumed:

- **"porsi" is hardcoded in roughly fifteen string literals** across `DonationCard.astro`,
  `donation-card.js` and `buildDonationMessage` in `format.ts`. Any editable unit field that does
  not thread all of them is a setting that lies: the admin offers a choice, the page ignores it.
- **Rp 25.000** lives inside `calcTotal()` in `format.ts:43`, which is unit-tested and imported by
  both the server markup and the browser script. Whatever replaces it has to reach a vanilla
  script with no access to `astro:content`.
- `RAMADHAN_PACKAGES` and the `INQUIRY_PROGRAMS` gate are slug-matched `if`s in
  `program/[program].astro`, so a seasonal programme cannot get packages without a developer.

## The pattern this repo already uses

`getProgramCover()` in `src/lib/programs.ts` is documented in `.claude/rules/content-model.md` as
*the only answer* to "what does this program look like", and every surface that shows a programme
calls it: the hero card, the programme page, the parked highlights card, the jejak CTA. One
function, one answer, no drift.

The card needs the same thing one level up: **one reader that answers "what is the ask for this
programme", returning everything the card needs.** Mounting it then looks like this:

```astro
---
import { getAjakan } from '../lib/ajakan';
const ajakan = await getAjakan('jumat-berkah');
---
<AjakanCard ajakan={ajakan} trackSource="hero_card" />
```

Two props instead of ten, and the second one is only there because analytics needs to know where
the click happened. A new placement becomes an import, not an assembly job.

## The term

`DonationCard` is already the wrong name: the card is mounted on programmes whose call to action
is a conversation, not a donation, and the owner has said it will not stay donation-only.

Proposed: **`ajakan`**, the ask. `AjakanCard.astro`, `src/lib/ajakan.ts`, `getAjakan()`. It fits
the repo's habit of naming domain concepts with one Indonesian noun — pintu, jejak, dampak — and
it stays true when the ask is to volunteer, to lend a room, or to partner, none of which are
donations.

Runner-up: `aksi`. Accurate but generic; it names the visitor's verb rather than the site's
offer, and almost any interactive element is an "aksi".

**This is the owner's call, and it is cheap now and expensive later**, because the noun ends up in
a component name, a lib file, a collection, and every future mention.

## What the reader returns, and where the content lives

`getAjakan(programSlug)` joins three sources that mount sites currently join by hand:

| piece | source today | stays there |
|---|---|---|
| label, summary, href, cover | `programs` collection | yes |
| WhatsApp number, schedule, next agenda | `settings` singleton | yes |
| jejak count for the footer link | `impact.ts` | yes |
| price per unit, presets, packages | hardcoded | **moves to content** |

Only the last row is new content. Everything above it already exists and is simply being read in
one place instead of three.

Where the last row lives depends on an unanswered question below. If every food programme shares
one price forever, it belongs in `settings` as one field. If prices will differ per programme, it
belongs on the programme entry. **Do not build a `calculators` collection to hold three values
until there is a second thing that needs them.**

## What placing it elsewhere actually costs

| placement | cost under this design |
|---|---|
| pintu landing page, jejak detail, organisasi page | one import, one call, one component |
| inside editor prose (a Markdoc tag in a jejak body) | the reader plus a Markdoc component registration; the reader is the hard part and it is shared |
| a programme whose ask is a conversation, not a quantity | already works: the card renders without a picker when there is nothing to pick |
| a card for an `organisasi` rather than a programme | needs a second reader, since organisasi has no agenda or price; the component can stay one |

## The community card

`community-giving.yaml` exists, is active, pintu `food`, and is one of the two programmes
hardcoded into `INQUIRY_PROGRAMS` so its CTA is a WhatsApp conversation rather than a picker.
Whatever a "community" card turns out to be, it **starts by reversing a decision that was made on
purpose**, not by extending one. That is worth being deliberate about rather than discovering
mid-build.

Under the reframe this matters less than it did: if the card is a card and the picker is optional
inside it, a community card is the same component with no picker, which is what Community Giving
already renders. The open question is whether it should gain one.

## Open questions, ranked

1. **The noun.** `ajakan`, `aksi`, or something of the owner's own. Everything else can start
   once this is settled, and renaming later touches a component, a lib file, and every import.
2. **Is Rp 25.000 per porsi uniform across every food programme, forever?** This decides whether
   the price is one field in `settings` or a field on each programme. It is the difference
   between a five-minute change and a schema.
3. **Will any card ever show a unit other than "porsi"?** If no, leave the word in the code where
   it is honest and skip the fifteen strings entirely. If yes, they get threaded in the same pass
   that introduces the reader, because doing it later means touching the same fifteen twice.
4. **Should Community Giving gain a picker?** Only answerable by the owner, and it is the one
   question that is genuinely about product rather than structure.

## Not in scope

No schema, no migration, no code, and no `calculators` collection. Nothing here is approved.
