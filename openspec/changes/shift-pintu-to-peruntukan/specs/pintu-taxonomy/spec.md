## ADDED Requirements

### Requirement: Pintu classifies by what changes for the recipient

The `pintu` taxonomy SHALL classify a programme by the change it produces for the recipient, and
SHALL NOT classify it by the form of the contribution, by who funds it, or by when it happens.

The taxonomy is closed at six values — `food`, `education`, `health`, `empowerment`,
`humanitarian`, `environment` — and `PINTU_IDS` in `src/consts.ts` SHALL remain their single source,
so `PintuId`, the zod enum, and the Keystatic options continue to derive from it.

The umbrella label SHALL remain `'Pintu Berbagi'`. Individual labels SHALL be bare nouns, so that
the verb is carried once by the umbrella rather than repeated by every door.

Form of contribution — food, goods, time, space, money — SHALL be expressed through `aksi` items
and their mechanism, not through pintu. This is the axis being retired: it produced three pintu
with no programme at all while a single pintu held every published one.

#### Scenario: A programme is classified
- **WHEN** an editor assigns a programme to a pintu
- **THEN** the choice SHALL be determined by what the programme changes for the recipient, and a
  programme that changes two things SHALL declare both rather than being forced into one

#### Scenario: The set stays closed
- **WHEN** an editor opens the programme form
- **THEN** they SHALL see exactly the six pintu named in `PINTU_IDS`, with no control to add another

### Requirement: A programme declares every pintu it serves, and exactly one that owns its numbers

`programs.pintu` SHALL be a list of every pintu the programme serves. `programs.pintuUtama` SHALL
name exactly one of them, and SHALL own the programme's card, its breadcrumb, and its metrics.

Aggregation SHALL filter on `pintuUtama` and SHALL NOT filter on list membership. Without this,
one jejak recording 500 portions under a programme serving two pintu is counted twice, and the
claim the taxonomy exists to support — impact stated per area in an annual report — inflates. A
figure that overstates is worse than no figure.

A pintu page SHALL be free to present a programme whose `pintuUtama` lies elsewhere, provided it
presents metrics belonging to its own pintu rather than borrowing that programme's headline
numbers.

#### Scenario: A programme serves two purposes
- **WHEN** a programme declares `pintu: [food, empowerment]` with `pintuUtama: pangan`
- **THEN** it SHALL appear on both pintu pages, its card and breadcrumb SHALL name Pangan, and its
  portion metrics SHALL be counted under Pangan only

#### Scenario: Impact is aggregated for a pintu
- **WHEN** metrics are aggregated for a pintu
- **THEN** only jejak whose programme names that pintu as `pintuUtama` SHALL contribute, so that
  totals across all pintu never exceed the total across the site

### Requirement: Emergency is a state, not a classification

`mode: routine | emergency` SHALL record whether a programme is currently an active emergency
response. It SHALL be independent of the `humanitarian` pintu.

The two answer different questions and SHALL NOT be collapsed. `humanitarian` classifies a
programme whose purpose is relief and recovery, and stands open year-round including when nothing
is happening. `mode: emergency` is temporal: it raises the siaga surface, and lapses when the
response period ends, without the programme being reclassified.

Seasonality (`season`) and funding channel (`channel`) SHALL likewise be fields rather than pintu.
Each described a programme in the previous taxonomy only because no other field existed to hold it.

#### Scenario: A food response during a disaster
- **WHEN** a programme delivers food in response to a disaster
- **THEN** it SHALL be able to declare `pintu: [humanitarian, food]` with `mode: emergency`, and
  SHALL NOT require the editor to choose between the two pintu

#### Scenario: The response period ends
- **WHEN** an emergency response concludes
- **THEN** `mode` SHALL return to `rutin` and the programme's pintu SHALL be unchanged

### Requirement: A pintu states whether it is open or being prepared

Every pintu SHALL carry a status. A pintu that has no published programme SHALL be presented as
*sedang disiapkan* rather than as an open door.

A pintu SHALL be presented as fully open only once it has **three published jejak entries, one
standing PIC, and one way to take part that a visitor can act on.** The same test SHALL apply in
reverse as the instrument for retiring a pintu.

This exists because the taxonomy being replaced published three doors — Waktu, Ruang, Pohon —
each with a colour identity, a hand-written `seoDescription`, and a live route, and none with a
single programme. The test replaces judgement with a condition that can be checked.

#### Scenario: A pintu has no published programme
- **WHEN** a pintu page renders and no programme naming it is published
- **THEN** the page SHALL state that the pintu is being prepared, and SHALL NOT present itself as
  ready to receive contributions

#### Scenario: A pintu meets the test
- **WHEN** a pintu reaches three published jejak, a named PIC, and one actionable way to take part
- **THEN** it MAY be presented as fully open

### Requirement: Pintu pages live under one namespace with a hub

Pintu pages SHALL be served from `/peduli/<slug>/`, and `/peduli/` SHALL exist as a hub listing
every pintu with its status.

A hub is required now because pintu owns the primary navigation. The earlier decision that pintu
was "a category/filter, not a page-owning entity" — and therefore needed no hub — applied while
pintu sat beside programme as a filter, and no longer holds. The hub also lets `/peduli/<slug>/`
derive its breadcrumb from the URL rather than declaring it by hand.

The namespace word `peduli` deliberately does not appear in the interface, where the umbrella
reads "Pintu Berbagi". No single Indonesian prefix reads naturally across all six purposes, so
each page SHALL carry the phrase natural to its own field in its `title` and `h1`. This mismatch
SHALL be documented as intentional; undocumented, it reads as an error to be repaired.

Every retired `/berbagi-<slug>/` URL SHALL redirect with a permanent server-side redirect. A
retired pintu with no single successor SHALL redirect to the hub rather than to the pintu that
happens to have absorbed one of its programmes.

#### Scenario: A visitor follows a shared link to a retired pintu URL
- **WHEN** a request arrives for a `/berbagi-<slug>/` URL
- **THEN** it SHALL be answered with a permanent redirect to its successor, or to `/peduli/` where
  no single successor exists

#### Scenario: A deep link carries a retired filter value
- **WHEN** `/jejak/` receives a pintu filter value that matches no current pintu
- **THEN** the full feed SHALL render unfiltered, rather than an empty result
