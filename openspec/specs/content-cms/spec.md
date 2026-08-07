# content-cms Specification

## Purpose
TBD - created by archiving change phase2-cms-seo-multipage. Update Purpose after archive.
## Requirements
### Requirement: Editorial content is stored as Astro Content Collections
Site-wide settings (WhatsApp number, socials, stat targets), FAQ entries, program list, and footer link columns SHALL be defined as Astro Content Collections (one singleton for settings, one list collection each for FAQs, programs, and footer columns), validated by a zod schema in `src/content/config.ts`.

#### Scenario: Build fails on invalid content
- **WHEN** a content entry is missing a required field or has the wrong type
- **THEN** `astro check`/`bun run build` SHALL fail, and the deploy pipeline SHALL NOT publish the change to the VPS

#### Scenario: Existing data is preserved
- **WHEN** the migration from `src/consts.ts` to Content Collections runs
- **THEN** the rendered HTML for unchanged content SHALL be identical to the pre-migration output (no visible content change from the migration itself)

### Requirement: Non-developer content editing via Keystatic
The site SHALL expose a Keystatic admin UI at a dedicated route that allows editing the settings singleton, FAQs, programs, footer columns, and organisasi entries through form fields, without requiring the editor to write code or run git commands directly.

#### Scenario: Editor saves a change
- **WHEN** an authenticated editor edits a field (e.g. adds an FAQ entry, or publishes a new organisasi profile) and saves in the Keystatic UI
- **THEN** the change SHALL be committed to the `main` branch of the repository, triggering the existing GitHub Actions build-and-deploy pipeline

#### Scenario: Unauthenticated access is blocked
- **WHEN** a visitor who is not authenticated via GitHub attempts to reach the Keystatic admin route
- **THEN** the system SHALL require GitHub authentication before allowing any edit

### Requirement: Layout-bound content stays out of the CMS
`FEATURES`, `STEPS`, `IMPACTS`, and `NAV_LINKS` SHALL remain plain exports in `src/consts.ts` and SHALL NOT be exposed in the Keystatic admin UI, since they are coupled to hardcoded icon enums and fixed section layout rather than editorial content.

#### Scenario: Layout data change still requires a code change
- **WHEN** someone wants to change an icon, add a new step, or reorder impact cards
- **THEN** they SHALL edit `src/consts.ts` and go through the normal git commit/push/CI flow, not the Keystatic UI

### Requirement: Jejak entries can be attributed to an organisasi and carry a report attachment
The Keystatic form for the `jejak` collection SHALL expose an optional relationship field to the `organisasi` collection and an optional file-upload field for a PDF report attachment, both editable without a code change.

#### Scenario: Editor attributes a jejak to an organisasi
- **WHEN** an editor selects an organisasi in the `jejak` entry form and saves
- **THEN** the jejak entry SHALL persist the organisasi relationship, and the site SHALL reflect it in that organisasi's aggregate impact on the next build

