# program-donation-cta Specification

## Purpose
TBD - created by archiving change add-food-programs-organisasi. Update Purpose after archive.
## Requirements
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

### Requirement: The donation link is valid before the visitor has chosen a quantity
The self-serve panel SHALL NOT preselect a quantity. Its call to action SHALL be usable with nothing chosen, in which case the WhatsApp message names the programme and asks for the quantity in words rather than asserting a number the visitor did not pick.

This replaces an earlier default of 6 porsi, removed on the owner's instruction: *"aku mau melepaskan diri dari default 6porsi, biar orang pilih sesuka hati aja."* The presets are 6 / 12 / 20 plus a free-entry option.

The no-JS path is what makes this a requirement rather than a preference. The panel is server-rendered and the quantity is applied by a vanilla script, so with scripting off the link must still say something true.

#### Scenario: Nothing chosen
- **WHEN** a visitor opens a self-serve programme page and taps the CTA without touching a preset
- **THEN** the button SHALL read "Donasi lewat WhatsApp" with no quantity or total in its label
- **AND** the message SHALL name the programme and ask for the quantity, e.g. `Halo, saya ingin donasi program "Jumat Berkah". Boleh dibantu untuk jumlah porsinya?`

#### Scenario: Analytics does not record a choice that was not made
- **WHEN** the CTA is rendered with no quantity chosen
- **THEN** the `data-track-pax` attribute SHALL be absent rather than empty, because `Analytics.astro` copies `data-track-*` verbatim and an empty value would enter the funnel as a selection

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

