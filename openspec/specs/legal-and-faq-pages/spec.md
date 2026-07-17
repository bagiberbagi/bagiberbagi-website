# legal-and-faq-pages Specification

## Purpose
TBD - created by archiving change phase2-cms-seo-multipage. Update Purpose after archive.
## Requirements
### Requirement: Legal documents are rendered as standalone routed pages
Each entry in the existing `legal` Content Collection (privacy, terms, transparency) SHALL be rendered at its own routable page (`/privasi`, `/syarat`, `/transparansi`), rather than existing only as unrouted collection data.

#### Scenario: Direct navigation to a legal page
- **WHEN** a visitor navigates directly to `/privasi` (via a link, bookmark, or search result)
- **THEN** the full privacy policy content SHALL render as a standalone page, independent of the home page

#### Scenario: Legal content update requires no routing change
- **WHEN** the content of an existing legal entry is edited (text change only)
- **THEN** the corresponding page SHALL reflect the update on next build without any change to `src/pages/`

### Requirement: FAQ has a dedicated indexable page
The site SHALL provide a `/faq` page that renders all entries from the `faqs` Content Collection, in addition to the existing on-page FAQ section on the home page.

#### Scenario: FAQ page reflects CMS content
- **WHEN** an editor adds, removes, or edits an FAQ entry via Keystatic
- **THEN** both the home page's inline FAQ section and the standalone `/faq` page SHALL reflect that change after the next build

### Requirement: Existing home page anchors remain functional
Adding standalone pages SHALL NOT break or change the behavior of existing in-page anchor links (`#faq`, `#privasi`, `#syarat`, `#tentang`, etc.) on the home page.

#### Scenario: Home page anchor navigation still works
- **WHEN** a visitor clicks an in-page nav link (e.g. "FAQ" in the header) on the home page
- **THEN** it SHALL scroll to the home page's inline FAQ section exactly as before, not redirect to the standalone `/faq` page

