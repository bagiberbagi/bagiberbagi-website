# Aksi and Ajakan

## Status

**Design complete, nothing implemented, nothing approved.** `design.md` holds the model,
`AUDIT.md` the adversarial review of it, `tasks.md` the tracked plan. Six owner decisions are
listed at the top of `tasks.md`; one of them blocks a whole track.

## Why

The site describes ways to take part that it cannot offer. `CATEGORY_CONTENT.contribute` in
`src/consts.ts` gives each of the six pintu three `{ title, desc }` entries, eighteen in all,
written in the owner's own voice. Not one carries a mechanism: no href, no `wa.me`, no button.
Meanwhile the component that does carry the mechanism, `DonationCard.astro`, is mounted in
exactly two places because each mount hand-assembles nine props from three unrelated sources.

So the pintu page says "Donasi paket" as prose with nothing to click, while the button that does
exactly that lives on a card that page never renders. Same concept, two representations, unable
to see each other.

Three slug-matched special cases exist because of the same gap: `INQUIRY_PROGRAMS`,
`RAMADHAN_PACKAGES`, and the `25000` literal inside `calcTotal()`.

## What changes

`aksi` becomes editable content owned by the pintu, each entry carrying an optional relationship
to the programme that fulfils it and a mechanism of one of three kinds. `ajakan` becomes one
reader, `getAjakan()`, that answers "what is the ask for this programme" the way
`getProgramCover()` already answers "what does this programme look like". The three special cases
become data.

Storage follows the `legal` precedent already in this repo: Keystatic writes six per-pintu
singletons, Astro reads them as one collection, so the fixed set cannot gain a seventh member
through the admin.

## Scope

The owner set it deliberately: *"aku butuh mekanisme yg bold, pekerjaan banyak bukan masalah
bagiku."* The plan is eleven tracks. Seven need no approval, four need his eyes before merging.

## Deliberately not in this change

Threading the roughly fifteen hardcoded "porsi" literals. The reader carries `unit` from day one
with the value `porsi` and nothing reads it yet. Reserve the seam, do not build the machine.
