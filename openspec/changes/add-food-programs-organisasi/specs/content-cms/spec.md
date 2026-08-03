## MODIFIED Requirements

### Requirement: Non-developer content editing via Keystatic
The site SHALL expose a Keystatic admin UI at a dedicated route that allows editing the settings singleton, FAQs, programs, footer columns, and organisasi entries through form fields, without requiring the editor to write code or run git commands directly.

#### Scenario: Editor saves a change
- **WHEN** an authenticated editor edits a field (e.g. adds an FAQ entry, or publishes a new organisasi profile) and saves in the Keystatic UI
- **THEN** the change SHALL be committed to the `main` branch of the repository, triggering the existing GitHub Actions build-and-deploy pipeline

#### Scenario: Unauthenticated access is blocked
- **WHEN** a visitor who is not authenticated via GitHub attempts to reach the Keystatic admin route
- **THEN** the system SHALL require GitHub authentication before allowing any edit

## ADDED Requirements

### Requirement: Jejak entries can be attributed to an organisasi and carry a report attachment
The Keystatic form for the `jejak` collection SHALL expose an optional relationship field to the `organisasi` collection and an optional file-upload field for a PDF report attachment, both editable without a code change.

#### Scenario: Editor attributes a jejak to an organisasi
- **WHEN** an editor selects an organisasi in the `jejak` entry form and saves
- **THEN** the jejak entry SHALL persist the organisasi relationship, and the site SHALL reflect it in that organisasi's aggregate impact on the next build
