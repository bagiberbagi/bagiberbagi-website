# program-donation-cta Specification

## Purpose
TBD - created by archiving change add-food-programs-organisasi. Update Purpose after archive.
## Requirements
### Requirement: Program page renders a CTA appropriate to its package type
The `/program/[program]` page SHALL render one of two CTA variants based on the program's package type: a self-serve donation panel (fixed price, immediate WhatsApp donation link) for programs with a fixed package, or an inquiry CTA ("Diskusikan Program") for programs with a custom/negotiated package.

#### Scenario: Fixed-package program shows self-serve panel
- **WHEN** a visitor views the page for a program with a fixed package (e.g. Jumat Berkah)
- **THEN** the page SHALL show the price panel with a donation button linking to a pre-filled WhatsApp message naming the programme

#### Scenario: Custom-package program shows inquiry CTA
- **WHEN** a visitor views the page for a program with a custom/negotiated package (e.g. Community Giving, CSR Food Program)
- **THEN** the page SHALL show a "Diskusikan Program {label}" button linking to a WhatsApp inquiry message, and SHALL NOT show the fixed-price self-serve panel

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
For a self-serve programme offering more than one fixed package (e.g. Ramadhan Berbagi: Sahur, Takjil, Buka Puasa), the generated WhatsApp message SHALL name the package the panel is currently showing.

#### Scenario: Donation link reflects the selected package
- **WHEN** a visitor selects "Takjil" on the Ramadhan Berbagi page and proceeds to donate
- **THEN** the message SHALL reference Takjil, e.g. `donasi program "Ramadhan Berbagi (Paket Takjil)"`

#### Scenario: Package defaults to the first, and this contradicts the quantity rule
- **WHEN** a visitor opens `/program/ramadhan-berbagi/` and taps the CTA without touching the package row
- **THEN** the message SHALL name `Ramadhan Berbagi (Paket Sahur)` — verified live on 7 August 2026, `aria-pressed="true"` on the first button

  This is recorded as the shipped behaviour, **not endorsed as correct.** An earlier draft of this
  spec claimed the page "SHALL require the visitor to select one package before the donation link
  is built", which was never true. The real state is worse than a wrong spec: quantity now
  deliberately has no default so the visitor chooses freely, while package still silently has one,
  so a visitor who taps straight through sends "Paket Sahur" without ever choosing it. The two
  controls sit in the same card and follow opposite rules. **Open question for the owner**, listed
  as Q2 in `add-aksi-mechanism`, which is where the packages become data.

