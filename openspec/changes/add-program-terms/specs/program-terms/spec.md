## ADDED Requirements

### Requirement: A programme page states its own operational terms
The `/program/[program]` page SHALL render a `#ketentuan` section stating what a participant needs
to know before taking part **that is true of this programme and not of the others**: an order
cut-off, a coverage area, a minimum, what a package contains, a lead time.

The section SHALL be operational, not a second declaration of obligations. `/syarat` remains the
only place the platform declares obligations, and the section SHALL link to it rather than restate
it in a form that can drift.

**A statement that would be true of every programme SHALL NOT appear here at all**, not even
rephrased for a donor's ear. How a donation is processed, what it covers, what report follows, what
happens when a distribution cannot run: each is a service-wide obligation, so each belongs on
`/syarat` and only there. This was learned by shipping the opposite — a shared block whose seven
items were `/syarat` clauses rewritten in second person — and reading the result as one sentence
published twice.

The section SHALL be omitted entirely when the merged list is empty, rather than rendering a
heading over nothing.

#### Scenario: Visitor reads the terms before donating
- **WHEN** a visitor opens an active programme page that has terms of its own
- **THEN** the page SHALL show a "Ketentuan" section between Cara Kerja and Rekam Jejak
- **AND** the donation panel SHALL carry one link into it

#### Scenario: A programme with no terms at all
- **WHEN** the shared block is empty and the programme declares no terms of its own
- **THEN** no `#ketentuan` section SHALL be rendered, and the link in the donation panel SHALL be
  absent rather than pointing at an id that does not exist

### Requirement: Terms come from two content layers merged into one list
The rendered list SHALL be the merge of a shared block (the `ketentuan` singleton) and the
programme's own block (`detail.ketentuan`).

The merge SHALL work as follows: programme items first in their own order, then every shared item
whose title no programme item claims. Title comparison SHALL be normalised — trimmed, lowercased,
internal whitespace collapsed. An item missing either a title or a body SHALL be dropped. A title
that appears twice within one block SHALL keep the first occurrence.

#### Scenario: A programme adds a term
- **WHEN** an editor adds "Tenggat pesanan" to one programme's terms
- **THEN** it SHALL appear on that programme's page above the shared items, and on no other
  programme's page

#### Scenario: A programme overrides a shared term
- **WHEN** a programme declares a term whose title matches a shared term, e.g. "Libur panjang"
- **THEN** the programme's wording SHALL be shown in the programme's own block, and the shared
  wording SHALL NOT also appear

#### Scenario: An empty row saved by the admin
- **WHEN** an editor adds an array row and saves it with the body left blank
- **THEN** that row SHALL NOT render as an empty disclosure

### Requirement: The terms are readable with JavaScript disabled
Each term SHALL be a native `<details>`/`<summary>` disclosure, not a scripted accordion. The
section SHALL carry no client-side script.

This is a requirement rather than an implementation note because the content is what a participant
is told to read before paying. A scripted accordion with scripting off renders headings whose
bodies cannot be opened, which is this section failing at its only job.

#### Scenario: Scripting off
- **WHEN** a visitor with JavaScript disabled opens a programme page
- **THEN** every term SHALL be openable, and the programme-specific terms SHALL already be open

#### Scenario: Keyboard
- **WHEN** a visitor tabs to a term heading and presses Enter or Space
- **THEN** the term SHALL open and close, with no key handler written for it

### Requirement: Specific terms are open, the shared frame is closed
Items originating from the programme SHALL render expanded; items originating from the shared block
SHALL render collapsed.

#### Scenario: Resting shape of the section
- **WHEN** a programme declares two terms of its own and the shared block holds one
- **THEN** the page SHALL show two open terms followed by one collapsed heading
- **AND** while the shared block is empty, as it is today, the section SHALL be entirely open terms
