## ADDED Requirements

### Requirement: Shared programme terms live in one singleton
The terms that hold for every programme SHALL live in a `ketentuan` singleton
(`src/content/ketentuan/ketentuan.json`), an ordered array of `{ title, body }`, editable in the
Keystatic admin with drag-to-reorder.

It SHALL be a singleton array rather than a collection, for the reason already settled for `faq`
and `footer`: display order matters, the entry count stays small, and no item is individually
routed. Keystatic derives a collection's filenames from `slugField` and does not reproduce a
filename-prefix ordering, so an item added through the admin would sort arbitrarily.

Its Keystatic key SHALL be `ketentuan`, not `terms`. `terms` is already taken by the `/syarat`
legal singleton, and the sidebar has to be able to tell the two apart: "Legal → Syarat dan
Ketentuan" is the platform's obligations, "Konten Situs → Ketentuan Program" is what a participant
needs to know about a programme.

#### Scenario: Editor reorders the shared terms
- **WHEN** an editor drags a shared term above another and saves
- **THEN** every programme page SHALL reflect the new order, with no code change

#### Scenario: Both configs agree on the extension
- **WHEN** an editor opens Ketentuan Program in the admin
- **THEN** the seeded items SHALL be listed, because `format: 'json'` in `keystatic.config.ts` and
  the `*.json` glob in `src/content.config.ts` name the same files

### Requirement: A programme carries its own terms inside its detail block
The `programs` collection SHALL gain `detail.ketentuan`, an ordered array of `{ title, body }`.

It sits inside `detail` because it is page-only content, alongside `eyebrow`, `description` and
`features`: a programme without a page has nothing to put terms on. It SHALL be optional with an
empty-array default, since Keystatic writes an absent key rather than an empty array for an empty
array field, and a schema that demanded the key would fail the build on the first programme saved
without one.

The field name SHALL be `ketentuan` on both sides, matching the singleton, the reader, the
component and the section id — one word for one role.

#### Scenario: An untouched programme entry stays valid
- **WHEN** the schema gains the field and no existing `*.yaml` is edited
- **THEN** the build SHALL succeed and every programme page SHALL render its shared terms only

#### Scenario: A programme gains a term without a developer
- **WHEN** an editor adds a term to a programme in the admin
- **THEN** that programme's page SHALL render it, with no code change
