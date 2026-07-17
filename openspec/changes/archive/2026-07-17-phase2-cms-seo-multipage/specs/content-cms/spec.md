## ADDED Requirements

### Requirement: Editorial content is stored as Astro Content Collections
Site-wide settings (WhatsApp number, socials, stat targets), FAQ entries, program list, and footer link columns SHALL be defined as Astro Content Collections (one singleton for settings, one list collection each for FAQs, programs, and footer columns), validated by a zod schema in `src/content/config.ts`.

#### Scenario: Build fails on invalid content
- **WHEN** a content entry is missing a required field or has the wrong type
- **THEN** `astro check`/`bun run build` SHALL fail, and the deploy pipeline SHALL NOT publish the change to the VPS

#### Scenario: Existing data is preserved
- **WHEN** the migration from `src/consts.ts` to Content Collections runs
- **THEN** the rendered HTML for unchanged content SHALL be identical to the pre-migration output (no visible content change from the migration itself)

### Requirement: Non-developer content editing via Keystatic
The site SHALL expose a Keystatic admin UI at a dedicated route that allows editing the settings singleton, FAQs, programs, and footer columns through form fields, without requiring the editor to write code or run git commands directly.

#### Scenario: Editor saves a change
- **WHEN** an authenticated editor edits a field (e.g. adds an FAQ entry) and saves in the Keystatic UI
- **THEN** the change SHALL be committed to the `main` branch of the repository, triggering the existing GitHub Actions build-and-deploy pipeline

#### Scenario: Unauthenticated access is blocked
- **WHEN** a visitor who is not authenticated via GitHub attempts to reach the Keystatic admin route
- **THEN** the system SHALL require GitHub authentication before allowing any edit

### Requirement: Layout-bound content stays out of the CMS
`FEATURES`, `STEPS`, `IMPACTS`, and `NAV_LINKS` SHALL remain plain exports in `src/consts.ts` and SHALL NOT be exposed in the Keystatic admin UI, since they are coupled to hardcoded icon enums and fixed section layout rather than editorial content.

#### Scenario: Layout data change still requires a code change
- **WHEN** someone wants to change an icon, add a new step, or reorder impact cards
- **THEN** they SHALL edit `src/consts.ts` and go through the normal git commit/push/CI flow, not the Keystatic UI
