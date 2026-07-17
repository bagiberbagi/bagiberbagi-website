# legal-page-layout Specification

## Purpose
TBD - created by archiving change legal-page-layout. Update Purpose after archive.
## Requirements
### Requirement: Legal page header block
Each legal page SHALL render an eyebrow label, an H1 page title, and a "Terakhir diperbarui" line showing the entry's `updatedAt` value, above the two-column body.

#### Scenario: Header renders entry metadata
- **WHEN** `/syarat`, `/privasi`, or `/transparansi` renders
- **THEN** the page shows an eyebrow label, the collection entry's `title` as H1, and "Terakhir diperbarui: {updatedAt}"

### Requirement: Auto-generated Table of Contents
The page SHALL render a Table of Contents listing every H2-level heading found in the entry's rendered content, in document order, without a hand-maintained separate list.

#### Scenario: TOC matches content headings
- **WHEN** a legal entry's markdown body contains a set of H2 headings
- **THEN** the TOC lists exactly those headings, in the same order they appear in the content, each linking to that heading's id

#### Scenario: Adding a heading updates the TOC automatically
- **WHEN** a new H2 section is added to a legal entry's markdown body
- **THEN** the TOC includes the new section on next build, with no code or config change required

### Requirement: Scrollspy active-section highlighting
The TOC SHALL highlight the entry corresponding to whichever section is currently in view as the user scrolls, using an approach independent of the main nav's `scrollspy.js`/`NAV_SECTION_IDS`.

#### Scenario: Scrolling updates the active TOC item
- **WHEN** a user scrolls the page so a new section enters the viewport's tracked region
- **THEN** the TOC entry for that section becomes visually active, and the previously active entry is no longer marked active

### Requirement: Responsive layout
On desktop, the Table of Contents SHALL be sticky-positioned alongside the scrolling content. On mobile, the Table of Contents SHALL render as a non-sticky block above the content.

#### Scenario: Desktop sticky TOC
- **WHEN** the page renders on a desktop-width viewport
- **THEN** the TOC remains visible in a fixed left column as the content column scrolls

#### Scenario: Mobile stacked TOC
- **WHEN** the page renders on a mobile-width viewport
- **THEN** the TOC renders as a block above the content, not sticky, not in a side column

### Requirement: Shared layout across legal pages
`/syarat`, `/privasi`, and `/transparansi` SHALL all use the same layout component for the header block, TOC, and content structure described above.

#### Scenario: All three pages share the layout
- **WHEN** `/syarat`, `/privasi`, and `/transparansi` each render
- **THEN** all three use the same underlying layout component (identical header/TOC/content structure), differing only in their content

### Requirement: Syarat dan Ketentuan content depth
The `/syarat` page's content SHALL cover at least the following sections: Definisi, Ruang Lingkup Layanan, Akun Pengguna, Donasi, Penggunaan Dana, Transparansi dan Pelaporan, Program dan Pelaksanaan, Pembatalan dan Pengembalian Dana, Mitra, Hak Kekayaan Intelektual, Larangan Penggunaan, Batas Tanggung Jawab, Perubahan Ketentuan, Hukum yang Berlaku, Hubungi Kami.

#### Scenario: All required sections are present
- **WHEN** `/syarat` renders
- **THEN** the TOC and content include all 15 listed sections, each as its own H2

