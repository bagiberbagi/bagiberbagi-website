# homepage-makanan-program-cards Specification

## Purpose
TBD - created by archiving change homepage-redesign. Update Purpose after archive.
## Requirements
### Requirement: Makanan program cards section
A new homepage section SHALL render between `Stats` and `ProgramFeatures`, showing 3 cards for the `bagiberbagimakanan` category's items: Jumat Berkah, Ramadhan Berkah, Berbagi Makanan Harian.

#### Scenario: Section renders in the correct position
- **WHEN** the homepage renders
- **THEN** a section with all 3 makanan-program cards appears directly after `Stats` and before `ProgramFeatures`

### Requirement: Only Jumat Berkah is functionally active
Only the Jumat Berkah card SHALL show a CTA button (linking to `/jumat-berkah`). Ramadhan Berkah and Berbagi Makanan Harian SHALL show a "Segera Hadir" state with no CTA button, regardless of the source mockup's visual styling showing buttons on all 3.

#### Scenario: Jumat Berkah CTA works
- **WHEN** a user views the Jumat Berkah card
- **THEN** a CTA button is visible and links to `/jumat-berkah`

#### Scenario: Other 2 cards have no CTA
- **WHEN** a user views the Ramadhan Berkah or Berbagi Makanan Harian card
- **THEN** no CTA button is rendered; a "Segera Hadir" indicator is shown instead

### Requirement: Stats visual update
The `Stats` section SHALL render with a yellow/gold full-width background band. Existing count-up behavior and stat labels SHALL be unchanged.

#### Scenario: Stats band renders, counters still work
- **WHEN** the homepage renders and the Stats section scrolls into view
- **THEN** the section shows a yellow/gold background and the 4 stat values still count up to their targets as before

### Requirement: ProgramFeatures visual update
The `ProgramFeatures` section's promo block SHALL be an image with a caption overlay, replacing the previous plain-color block. `FEATURES` bullet content and the section's eyebrow/heading/intro text SHALL be unchanged.

#### Scenario: Image-based promo card renders
- **WHEN** the `ProgramFeatures` section renders
- **THEN** the promo block shows an image with "Dari Kebaikan Anda Menjadi Dampak Nyata" as a caption overlay, and all 4 `FEATURES` bullets render unchanged

### Requirement: Cara Kerja visual update
The `HowItWorks` ("Cara Kerja") section's 5 steps SHALL render as individual rounded card boxes with alternating-colored numbered badges. `STEPS` content SHALL be unchanged.

#### Scenario: Steps render as cards
- **WHEN** the `HowItWorks` section renders
- **THEN** all 5 steps appear as distinct card boxes, each with a numbered badge and unchanged title/description text

### Requirement: Documentation and Legal sections removed from homepage
The homepage SHALL NOT render the `Documentation` ("Bukti Nyata dari Lapangan") or `Legal` (inline privacy/terms snippet) sections.

#### Scenario: Neither section appears
- **WHEN** the homepage renders
- **THEN** no "Bukti Nyata dari Lapangan" photo grid and no inline legal/privacy snippet section appears anywhere on the page

### Requirement: ImpactSection and JoinUs unchanged
`ImpactSection` and `JoinUs` SHALL render with their existing content and layout, unchanged by this redesign.

#### Scenario: No regression to Impact/JoinUs
- **WHEN** the homepage renders
- **THEN** `ImpactSection` ("Satu Aksi. Banyak Dampak.") and `JoinUs` ("Bangun Dampak Bersama") render with the same content and structure as before this change

