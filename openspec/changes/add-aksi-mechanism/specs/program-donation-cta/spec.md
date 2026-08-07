## MODIFIED Requirements

### Requirement: Program page renders a CTA appropriate to its package type
The `/program/[program]` page SHALL render the CTA its programme's aksi mechanism declares. The choice SHALL come from content, never from a slug tested against a hardcoded list.

This replaces `INQUIRY_PROGRAMS` and the `isInquiry ? … : …` branch in `program/[program].astro`. The two behaviours the branch produced are unchanged on screen; only their source moves. The "PAKET CUSTOM" panel moves from a branch in the page into a branch in the component, keyed on the mechanism.

#### Scenario: Quantity mechanism shows the self-serve panel
- **WHEN** a visitor views a programme whose aksi mechanism is `quantity`
- **THEN** the page SHALL show the picker and a donation button linking to a pre-filled WhatsApp message naming the programme

#### Scenario: Conversation mechanism shows the inquiry CTA
- **WHEN** a visitor views a programme whose aksi mechanism is `conversation`
- **THEN** the page SHALL show a "Diskusikan Program {label}" button linking to that aksi's own WhatsApp message, and SHALL NOT show the picker

#### Scenario: Changing a programme's CTA needs no code change
- **WHEN** an editor switches a programme's mechanism between `quantity` and `conversation`
- **THEN** the rendered CTA SHALL change accordingly with no edit to `program/[program].astro`

### Requirement: A multi-package programme carries its package in the donation message
For a programme whose `quantity` mechanism declares more than one package, the generated WhatsApp message SHALL name the package the panel is currently showing. The package list SHALL come from that programme's own aksi content, replacing the `RAMADHAN_PACKAGES` constant and the `program.slug === 'ramadhan-berbagi'` test.

The markup that consumes the list is unchanged; only where the array comes from changes.

#### Scenario: Donation link reflects the selected package
- **WHEN** a visitor selects "Takjil" on the Ramadhan Berbagi page and proceeds to donate
- **THEN** the message SHALL reference Takjil, e.g. `donasi program "Ramadhan Berbagi (Paket Takjil)"`

#### Scenario: A seasonal programme gains packages without a developer
- **WHEN** an editor adds a package list to another programme's aksi
- **THEN** that programme's page SHALL render the package row, with no code change

#### Scenario: Package preselection is declared, not implicit
- **WHEN** a programme's page is rendered with a package row
- **THEN** whether a package starts selected SHALL be a property of the content, not a consequence of being first in the array

  This closes the inconsistency recorded when `add-food-programs-organisasi` was archived: quantity deliberately has no default so the visitor chooses freely, while package silently defaults to the first entry, so a visitor who taps straight through sends `Ramadhan Berbagi (Paket Sahur)` without ever having chosen it. Two controls in the same card following opposite rules. The owner picks which rule wins; the requirement here is only that the answer stop being an accident of array order.
