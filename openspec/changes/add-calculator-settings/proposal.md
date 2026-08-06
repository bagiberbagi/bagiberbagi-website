# Calculator settings

## Status

**Draft. Not approved, not scheduled, nothing implemented.** This folder exists so the design
survives the session that produced it. `design.md` holds the full recommendation.

## Why

Every number the donation calculator uses is hardcoded. Rp 25.000 per porsi lives inside
`calcTotal()` in `src/lib/format.ts`, the presets live in `DonationCard.astro`, and the Ramadhan
package names live in `program/[program].astro` behind an `if` on the programme slug. The owner
can edit the agenda's target and collected porsi from Keystatic and nothing else, so the one
number most likely to change in real life — the price — needs a developer and a deploy.

The owner also said the donation calculator will not be the only calculator, naming a
"community calculator" as one example and leaving the rest open. That turns a three-value
settings change into a modelling question, because moving the values now and discovering the
shape later means moving them twice.

## What changes

See `design.md`. In one sentence: a `calculators` Keystatic collection, one YAML per calculator,
which each programme points at through a `fields.relationship`, so today's hardcoded values
become content and a second calculator with the same arithmetic costs one file and no code.

## Blocked on

Three questions, ranked, at the end of `design.md`. The first one blocks everything: what the
community calculator actually counts, and whether it has a fixed price per unit. Community
Giving is currently inquiry-only on purpose, so a fixed-price picker there would reverse an
existing decision rather than extend it.

## Out of scope until those are answered

Any schema, any migration, any code.
