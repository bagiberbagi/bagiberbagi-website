# The ask card

## Status

**Draft. Not approved, not scheduled, nothing implemented.** `design.md` holds the full
recommendation. It was rewritten once already, after the owner corrected the premise.

## Why

The card that carries the site's call to action is mounted in exactly two places, and each mount
hand-assembles nine props plus a slot from three unrelated sources: the programmes collection,
the `settings` singleton, and `impact.ts`. That assembly cost, not anything about content, is why
the card is not reused anywhere else. Any third placement re-derives all of it and can drift.

Separately, every number inside it is hardcoded: Rp 25.000 per porsi inside `calcTotal()`, the
presets in the component, the Ramadhan package names behind an `if` on the programme slug. The
owner can edit the agenda's target and collected porsi from Keystatic and nothing else.

The first version of this design treated the numbers as the problem and proposed a `calculators`
collection. The owner corrected it: what he means by "calculator" is the card itself, always the
reference, placeable anywhere, with arithmetic as one thing inside it rather than its definition.

## What changes

See `design.md`. In one sentence: one reader that answers "what is the ask for this programme",
mirroring how `getProgramCover()` is already the only answer to what a programme looks like, so
mounting the card costs one prop instead of ten and the hardcoded numbers move to content as a
rider rather than as the point.

## Blocked on

Four questions at the end of `design.md`. The first is the name: `DonationCard` is already wrong,
since the card renders on programmes whose ask is a conversation. The proposal is `ajakan`. That
noun ends up in a component, a lib file, and every import, so it is cheap now and expensive later.

## Out of scope until those are answered

Any schema, any migration, any code.
