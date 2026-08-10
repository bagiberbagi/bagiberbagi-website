# aksi-and-ajakan Specification

## Purpose
TBD - created by archiving change add-aksi-mechanism. Update Purpose after archive.
## Requirements
### Requirement: A described way to take part carries a mechanism
Every way to take part that the site presents to a visitor SHALL either carry a mechanism the visitor can act on, or declare that it has none. A description with no mechanism and no declaration SHALL NOT exist, because it is indistinguishable on screen from one whose button failed to render.

This is the whole reason for the change. Today `CATEGORY_CONTENT.contribute` in `src/consts.ts` gives each of the six pintu three `{ title, desc }` entries, eighteen in all, and a grep for `href` or `wa.me` inside them returns zero. The pintu page says "Donasi paket" as prose with nothing to click, while the button that does exactly that lives on a card that page never renders.

A mechanism SHALL be one of exactly three kinds, each of which is something the site already does rather than something it might do:

| kind | behaviour |
|---|---|
| `quantity` | quantity presets, an optional package row, and a WhatsApp link built from the choice |
| `conversation` | a fixed pre-built WhatsApp message with no picker |
| `none` | title and description, nothing to click, stated deliberately |

#### Scenario: An aksi with a conversation mechanism
- **WHEN** a visitor reads an aksi whose mechanism is `conversation`
- **THEN** the page SHALL render a control opening WhatsApp with that aksi's own message, built server-side so it works with scripting off

#### Scenario: An aksi with no mechanism yet
- **WHEN** an aksi declares `none`
- **THEN** the page SHALL render its title and description with no control, and SHALL NOT render an empty or disabled one

#### Scenario: A quantity aksi with nowhere to send the visitor
- **WHEN** an aksi declares `quantity` but its programme reference does not resolve
- **THEN** the build SHALL warn and the page SHALL omit that aksi's control, rather than fail the build or render a dead link

### Requirement: The set of pintu is closed to the admin
The `aksi` content SHALL be stored as one file per pintu, written by Keystatic as six named singletons and read by Astro as one collection. An editor SHALL be able to add, reorder and remove aksi within a pintu, and SHALL NOT be able to create a seventh pintu.

This follows the `legal` precedent already in the repo, where Keystatic writes three singletons that Astro reads through fixed-id lookups. `PINTU_IDS` in `src/consts.ts` stays the single source of the taxonomy, so the storage shape cannot drift from it.

#### Scenario: Editor reorders ways to take part
- **WHEN** an editor drags an aksi above another inside one pintu
- **THEN** the page SHALL render them in the new order, since the array's own order is the display order

#### Scenario: Admin cannot invent a pintu
- **WHEN** an editor opens the Aksi section of the admin
- **THEN** they SHALL see exactly the six pintu named in `PINTU_IDS`, with no control to add another

### Requirement: One reader answers what the ask is for a programme
A single reader SHALL answer "what is the ask for this programme", returning everything the ask card needs, so that mounting the card costs a call rather than an assembly job.

The card is mounted in exactly two places today because each mount hand-assembles nine props from three unrelated sources: the programmes collection, the `settings` singleton, and `impact.ts`. That mount cost, not the hardcoded numbers, is why the card is not placed more widely. This mirrors `getProgramCover()`, which `.claude/rules/content-model.md` already names as *the only answer* to "what does this programme look like".

#### Scenario: Mounting the card in a new place
- **WHEN** a developer places the ask card on a page that does not have one
- **THEN** they SHALL supply the resolved ask plus presentation props only, and SHALL NOT re-derive the cover, WhatsApp number, schedule, agenda or jejak count

#### Scenario: A programme with no aksi authored yet
- **WHEN** the reader is asked for a programme that resolves but has no aksi attached
- **THEN** it SHALL synthesise a `conversation` mechanism from the site WhatsApp number and warn at build time
- **AND** it SHALL NOT return null, so a half-finished content backfill degrades to what already ships rather than silently removing the site's main call to action

#### Scenario: A stale programme reference
- **WHEN** an aksi points at a programme slug that has been renamed or deleted
- **THEN** the reader SHALL drop that reference the way `getProgramSection()` in `home.ts` already drops empty, unresolved and duplicate slugs

### Requirement: No page branches on a programme slug
A page SHALL NOT change its call to action by testing a programme's slug against a hardcoded list. Behaviour that differs per programme SHALL come from that programme's own content.

Three such branches exist today and all three are the same missing field: `INQUIRY_PROGRAMS`, `RAMADHAN_PACKAGES`, and the `25000` literal inside `calcTotal()`. Community Giving is not a special programme; it is a programme whose only aksi has a conversation as its mechanism.

#### Scenario: A programme becomes conversation-only
- **WHEN** an editor changes a programme's aksi mechanism to `conversation`
- **THEN** its page SHALL render the inquiry CTA instead of the picker, with no code change

#### Scenario: The price reaches the browser script without a second source of truth
- **WHEN** the quantity picker recalculates a total in the browser
- **THEN** the price SHALL come from the server-rendered attribute, and the script SHALL NOT carry a hardcoded fallback that could disagree with the content

