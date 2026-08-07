# organisasi-directory Specification

## Purpose
TBD - created by archiving change add-food-programs-organisasi. Update Purpose after archive.
## Requirements
### Requirement: Organisasi collection stores institutional donor profiles
The site SHALL define an editor-managed `organisasi` collection with fields `label` (slug source), `logo` (optional image), `summary`, `detail` (`description`, `since`, optional `instagram`/`website`), and `active`, with no type/subtype distinction between community and corporate entries.

#### Scenario: Entry without detail description stays unpublished
- **WHEN** an `organisasi` entry has `active: true` but `detail.description` is empty
- **THEN** the entry SHALL NOT generate a `/organisasi/[slug]` page, consistent with the `programs` collection's publish gate

#### Scenario: Cleared logo resolves to null
- **WHEN** an editor clears the `logo` field in Keystatic
- **THEN** the stored value SHALL be `null`, and the page SHALL render without a logo rather than failing the build

### Requirement: Jejak can reference an organisasi independently of its program
The `jejak` collection SHALL expose an optional `organisasi` relationship field, decoupled from the existing `program` field, so a single jejak entry can be attributed to both a program and, optionally, an organisasi, without requiring the organisasi to be fixed to one program.

#### Scenario: One organisasi's jejak span multiple programs
- **WHEN** an organisasi has published jejak entries under more than one `program` (e.g. one under Community Giving, another under Ramadhan Berbagi)
- **THEN** the organisasi's impact aggregation SHALL sum metrics across all of them

#### Scenario: Jejak without an organisasi is unaffected
- **WHEN** a jejak entry leaves `organisasi` empty (e.g. a regular Jumat Berkah jejak)
- **THEN** the jejak SHALL continue to render and aggregate normally under its program and pintu, with no organisasi-related requirement blocking it

### Requirement: Organisasi index page lists active organisasi
The site SHALL serve `/organisasi/` listing every `organisasi` entry that has a generated detail page (active and description filled).

#### Scenario: No organisasi active yet
- **WHEN** no `organisasi` entry is active with a filled description
- **THEN** `/organisasi/` SHALL render a graceful empty state instead of an empty list or a build failure

### Requirement: Organisasi detail page shows aggregate impact and jejak history
The site SHALL serve `/organisasi/[slug]` for each page-eligible `organisasi` entry, showing the organisasi's profile (logo, description, since), its aggregate impact metrics summed across all its jejak, and a list of those jejak entries ordered by date.

#### Scenario: Aggregate metrics match underlying jejak
- **WHEN** an organisasi has jejak entries with metrics `{porsi: 50}` and `{porsi: 30}`
- **THEN** the organisasi's page SHALL show an aggregate of 80 porsi

#### Scenario: Orphaned organisasi reference excluded from aggregation
- **WHEN** a jejak entry references an `organisasi` slug that no longer exists or is inactive
- **THEN** that jejak SHALL be excluded from the organisasi's impact aggregation and jejak list, mirroring how orphaned `program` references are already excluded elsewhere

### Requirement: Jejak can carry an optional downloadable PDF attachment
The `jejak` collection SHALL expose an optional `reportPdf` file field, manually uploaded by an editor with no automatic PDF generation, rendered as a download link on the jejak detail page when present.

#### Scenario: PDF attachment renders as a download link
- **WHEN** a jejak entry has `reportPdf` set
- **THEN** `/jejak/[slug]` SHALL render a visible download link pointing to the uploaded file

#### Scenario: No attachment, no link
- **WHEN** a jejak entry leaves `reportPdf` empty
- **THEN** `/jejak/[slug]` SHALL NOT render a download link section

