## MODIFIED Requirements

### Requirement: The set of pintu is closed to the admin

The `aksi` content SHALL be stored as one file per pintu, written by Keystatic as named singletons
and read by Astro as one collection. An editor SHALL be able to add, reorder and remove aksi
within a pintu, and SHALL NOT be able to create a pintu that `PINTU_IDS` does not name.

`PINTU_IDS` in `src/consts.ts` stays the single source of the taxonomy, so the storage shape
cannot drift from it. The singleton keys follow the six peruntukan ids — `food`, `education`,
`health`, `empowerment`, `humanitarian`, `environment` — not the retired form-of-contribution
ids.

**In addition to the per-pintu files, the collection SHALL be able to hold ways to take part that
belong to no single pintu.** Under the previous taxonomy every aksi necessarily belonged to one,
because the axis was the form of the contribution and every contribution has exactly one form.
On a purpose axis that stops being true: offering skills as a volunteer, lending a vehicle,
registering an interest in zakat, or bringing a company's CSR budget each serve several purposes
or none in particular. Fourteen of the twenty-one existing items are of this kind.

Forcing them into a pintu would misfile them; deleting them would discard written copy that
describes real ways to help. So `AKSI_KEYS` SHALL admit site-level buckets alongside the
per-pintu singletons, while still refusing a pintu key that `PINTU_IDS` does not name.

#### Scenario: Editor reorders ways to take part
- **WHEN** an editor drags an aksi above another inside one pintu
- **THEN** the page SHALL render them in the new order, since the array's own order is the display order

#### Scenario: Admin cannot invent a pintu
- **WHEN** an editor opens the Aksi section of the admin
- **THEN** they SHALL see exactly the pintu named in `PINTU_IDS`, with no control to add another

#### Scenario: A way to take part serves no single pintu
- **WHEN** a way to take part applies across pintu rather than to one
- **THEN** it SHALL be storable in a site-level bucket, and SHALL NOT be required to name a pintu

### Requirement: A described way to take part carries a mechanism

Every way to take part that the site presents to a visitor SHALL either carry a mechanism the
visitor can act on, or declare that it has none. A description with no mechanism and no
declaration SHALL NOT exist, because it is indistinguishable on screen from one whose button
failed to render.

This requirement now carries a second edge. Three pintu — `education`, `health`,
`humanitarian` — inherit no aksi from the previous taxonomy, because the items that would have
served them described forms of giving rather than purposes. A pintu page whose "cara ikut" list
is empty presents a door with no handle, which is the same failure this requirement was written
against, reached from the other direction.

A pintu SHALL therefore either carry at least one actionable way to take part, or present itself
as *sedang disiapkan* so that the absence is stated rather than merely visible.

#### Scenario: A pintu has no ways to take part
- **WHEN** a pintu page renders with an empty aksi list
- **THEN** the page SHALL present the pintu as being prepared, and SHALL NOT render an empty
  "cara ikut" section as though the list had failed to load
