## MODIFIED Requirements

### Requirement: Layout-bound content stays out of the CMS
`FEATURES`, `STEPS`, `IMPACTS`, and `NAV_LINKS` SHALL remain plain exports in `src/consts.ts` and SHALL NOT be exposed in the Keystatic admin UI, since they are coupled to hardcoded icon enums and fixed section layout rather than editorial content.

`CATEGORY_CONTENT.contribute` SHALL NOT remain among them. It is the exception that proves where the line sits: it is prose in the owner's voice, describing ways a visitor can take part, and its length changes what the pintu page renders. That is editorial content wearing a layout constant's clothes, and it moves to the `aksi` collection. The rest of `CATEGORY_CONTENT` stays in `consts.ts` unchanged.

The test that separates the two: **would an editor changing this be expressing an editorial intent, or reaching for a developer's lever?** Reordering ways to help is the first. Adding a step to `STEPS` means picking an icon from a hardcoded enum, which is the second.

#### Scenario: Layout data change still requires a code change
- **WHEN** someone wants to change an icon, add a new step, or reorder impact cards
- **THEN** they SHALL edit `src/consts.ts` and go through the normal git commit/push/CI flow, not the Keystatic UI

#### Scenario: Ways to take part are editable without a developer
- **WHEN** an editor wants to add a way to take part, reword one, or attach a WhatsApp message to one
- **THEN** they SHALL do it in the Keystatic admin, and SHALL NOT need a code change

## ADDED Requirements

### Requirement: The aksi collection agrees on file extension across both configs
`src/content.config.ts` and `keystatic.config.ts` SHALL agree on the `aksi` file extension. Keystatic derives the extension from `format`, so a mismatch makes the admin list zero entries while the site keeps rendering, with no error anywhere.

Both sides are `*.json`. This is stated as a requirement rather than left to review because it has already failed once in this repo, on a collection whose `format: { data: 'yaml' }` looked for `*.yaml` while the files were `*.md`.

#### Scenario: Editor opens the aksi section
- **WHEN** an editor opens any of the six per-pintu aksi singletons in the admin
- **THEN** the existing entries SHALL be listed, not an empty form

### Requirement: A conditional field's stored shape is verified before anything reads it
Where a Keystatic field type is used for the first time in this repo, the shape it actually writes to disk SHALL be confirmed against a real saved entry before any reader is written against it.

`fields.conditional` is new here and carries the mechanism union, so it is load-bearing. The verification is cheap while nothing reads the collection and expensive afterwards. If it turns out not to nest inside `fields.array`, the fallback is a flat select plus all mechanism fields side by side, absorbed by the reader so nothing downstream notices.

#### Scenario: Wire shape confirmed against a saved entry
- **WHEN** the schema is added and before any reader exists
- **THEN** one throwaway entry per mechanism kind SHALL be saved through the admin and the file on disk read back
- **AND** the zod schema SHALL be corrected to match what was actually written, rather than what the documentation implies
