```markdown
# Tasks

Each track is written so it can be handed to one agent whole. Check the file territory table
below before running two tracks at once.

This change supersedes `openspec/changes/add-calculator-settings/design.md`. Track A resolves
the bookkeeping; nothing else in this file depends on it, so it can run in parallel with
everything.

## File territory

| Track | Group | File territory | Depends on |
|---|---|---|---|
| **A. OpenSpec bookkeeping** | 1 | `openspec/changes/add-aksi-mechanism/**`, `openspec/changes/add-calculator-settings/**` | none |
| **B. Schema, both sides + wire-shape spike** | 1 | `src/content.config.ts`, `keystatic.config.ts` | none |
| **C. Readers** | 1 | `src/lib/aksi.ts`, `src/lib/ajakan.ts`, `src/lib/aksi.test.ts` | **B** |
| **D. Content authoring** | 2 (copy) | `src/content/aksi/*.json` | **B** + owner |
| **E. Arithmetic seam** | 1 | `src/lib/format.ts`, `src/lib/format.test.ts`, `src/scripts/calculator.js`, `src/components/_parked/DonationCalculator.astro`, and **only lines 65 and 234** of `src/components/DonationCard.astro` | none |
| **F. The card and both mounts** | 2 (visual) | `src/components/DonationCard.astro`, `src/components/Hero.astro`, `src/pages/program/[program].astro`, `src/scripts/donation-card.js` | **C**, **E** |
| **G. Pintu page CTA** | 2 (visual) | `src/components/_variants/PintuS1.astro`, `src/pages/berbagi-[pintu].astro` | **C**, **D** |
| **H. Retire `contribute`** | 1 | `src/consts.ts` | **G** |
| **I. Rename to `Ajakan`** | 1 | the two file renames plus every import of them | **F**, **G**, **H** |
| **J. Rules docs** | 1 | `.claude/rules/content-model.md`, `.claude/rules/routing-taxonomy.md`, `.claude/rules/analytics.md` | **I** |

`DonationCard.astro` is the only file two tracks want. E owns two lines of it and is small enough
to land quickly; F starts after E merges, the same arrangement Track A and Track F had in
`fix-mobile-ergonomics`.

## Ordering

```
A                          independent, docs only
B ──► C ──┬──► F ──┐
          │        │
     └► D ─► G ────┼──► H ──► I ──► J
E ─────────► F ────┘
```

The live site is unchanged after A, B, C, D and E. It is not until F that anything a visitor
sees is fed by the new collection, and not until H that anything is deleted. Every track before
F is strictly additive: land them in any order the dependencies allow and the site keeps
rendering exactly what it renders today.

## Rules that apply to every track

- One agent, one worktree off `main`. Do not work in the main checkout.
- **Do not `git push`.**
- **Do not run git in the main checkout at `~/Developer/Project/bagiberbagi-website`.**
- **Never append a `Co-Authored-By` trailer to a commit.**
- Every Bash command that concerns the worktree starts with `cd <absolute-worktree-path> &&`.
  The shell's working directory has silently returned to the main checkout mid-session before.
- Real `bun install` in the worktree. Never symlink `node_modules`; it has caused an ELOOP
  failure in CI.
- Unique dev port per worktree. Trust the daemon log for the port actually bound, not the flag
  that was asked for.
- **Editor copy is the owner's, word for word.** Any `title` or `desc` that moves out of
  `consts.ts` moves as a diff, never through a script, never shortened, never "tightened".
- **Editor input must never fail the build.** Every degradation path in this change warns with
  `console.warn` and falls back, matching `createImageResolver`, `analytics.ts`'s `misconfigured`
  flag and `getProgramSection()`. A zod schema that throws on a value the admin UI can produce is
  a defect in this change, not a validation win.
- The no-JS path stays whole: every WhatsApp href ships fully formed from the server.
- No new dependency, no client-side framework. `src/scripts/*.js` stays vanilla.
- Keystatic and `content.config.ts` must agree on file extension. Both sides of this change are
  `json`. Editing one without the other makes the admin silently list zero entries.

## Completion gate, every track

```
bunx astro check                                       # 0 errors
bun test                                               # all pass
bun run build                                          # succeeds
bun run check:assets                                   # no unreferenced images in dist
```

## Decisions the owner owes before Track B and Track D start

Track B can write the schema for questions 1 and 2 either way in an hour; Track D cannot write
a single file without 3. None of them block Track A, C or E.

- [x] **Q1. Is Rp 25.000 a property of the ask, or of the site?** The design puts `pricePerUnit`
      on the `quantity` mechanism so Jumat Berkah and Ramadhan can differ. One number forever
      means one field in `settings` instead. **Recommendation: keep it on the mechanism.**

      **Answered 10 August 2026: "25000 milik program."** So `pricePerUnit` stays on the
      mechanism and `calcTotal(pax, pricePerUnit)` takes it as a required second parameter, with
      no default, so the literal cannot survive as a silent fallback.
- [ ] **Q2. Do Ramadhan's three packages share one price?** `packages: string[]` assumes yes and
      today that is true, because `calcTotal` knows nothing about the selected package. If Sahur
      and Buka Puasa should cost differently the field has to be `{ name, pricePerUnit }[]` —
      free to decide now, a content migration later.

      **Q2b, found on 7 August 2026 while reconciling the old spec against the live page.** The
      two controls in the same card now follow opposite rules. Quantity has no default, on your
      instruction, so the visitor chooses freely. **Package still defaults to the first one**
      (`aria-pressed="true"` on Sahur), so a visitor who taps straight through sends
      `Ramadhan Berbagi (Paket Sahur)` without ever having chosen it.

      Three ways out, and this change is where it gets decided because packages become data here:
      **(a)** packages get no default either, matching quantity, and the message names the
      programme alone until one is picked; **(b)** the default stays and is made visible as a
      default rather than as a selection; **(c)** the entry declares its own default in content,
      so Ramadhan can preselect Sahur deliberately while another programme preselects nothing.
      (c) is the one that fits the model, since every other special case in this change is
      becoming a field.

      **Answered 7 August 2026, option (a): "Paket ramadhan (sahur, takjil, dll) tidak perlu ada
      default."** Already shipped ahead of this change, on `fix/package-no-default`, because it
      is a live inconsistency rather than something to wait on a schema for.

      **The fix was bigger than removing a default, and this is the part worth carrying into the
      schema.** Taking the default away opens a state that could not previously exist: quantity
      chosen, package untouched. The message would then name a number and no package, and the
      team receives "12 pax Ramadhan Berbagi" with no way to know which one. Silence is worse
      than a wrong default, because a wrong default is at least answerable. So the message now
      states what it is still missing, matching how quantity already behaves.

      **So when `packages` becomes content, the mechanism must keep all four states honest**, not
      only the two the old code had. `buildDonationMessage` carries an `askPackage` flag for this.
- [x] **Q3. Who writes the fifteen WhatsApp messages?** Every non-food aksi needs one.
      Track D can draft each from its own `desc`, but the copy-voice rule says the owner's words
      are used verbatim, so a derived draft may not be acceptable even as a starting point.
      ~~**Track D is blocked until this is answered.**~~

      **Answered 7 August 2026: "kamu isi aja nanti aku evaluasi." Track D is unblocked.**
      Drafts are in `MESSAGES.md`, deliberately as a document rather than as content files, so
      they can be marked up before anything ships.

      Writing them found something the design missed, and it is now **Q7** below: two of the
      fifteen are not messages at all.
- [x] **Q4. Should Community Giving gain a quantity picker?** The only question here that is
      about the product rather than the structure. Under this model the answer is a field change
      in `src/content/aksi/food.json`, not a code change.

      **Answered 10 August 2026: "biarin diskusikan aja."** No picker. Community Giving keeps a
      `conversation` mechanism, which is what it renders today, so nothing about that page moves.
      What changes is why: it stops being a slug in `INQUIRY_PROGRAMS` and becomes a programme
      whose aksi declares a conversation.
- [x] **Q5. Should the CSR and community ways-in appear on `/berbagi-makanan/`?** Track D sets
      `showOnPintu: false` on all three programme-scoped aksi so the numbered list stays at its
      current three items. Flipping them on lengthens it to six and surfaces two real ways to
      take part that the pintu page hides today.

      **Answered 10 August 2026: stays at three.** Decided here rather than by the owner, on
      their instruction to carry on, because it is one boolean per entry and reversible the day
      anyone disagrees.

      Two reasons, and the second is the one that changed the answer. First, the pintu page is a
      channel page: it explains why the pintu exists and hands the reader to a programme. Six
      numbered items is a directory, and a directory competes with the programme list sitting
      right below it. Second, the CSR and community paths are no longer hidden the way the
      question assumed. `ClosingSection`'s picker offers "dapur saya" and "lewat perusahaan" and
      now closes three pages, the homepage, `/tentang/` and `/jejak/`, so both asks already reach
      the reader with a message written for them.

      **What would reverse it:** the picker never landing on the pintu pages *and* the enquiries
      from those two paths staying near zero. Then `/berbagi-makanan/` really is where they are
      missing, and the flag flips.
- [x] **Q6. Does `inquiry_click` survive?** See F5. **Recommendation: keep both event names**,
      `donate_click` for `quantity` and `inquiry_click` for `conversation`, so the historical
      conversion series stays comparable across the change.

      **Answered 10 August 2026: keep both.** No analytics delta is needed, so Track A3's
      conditional `analytics-tracking` spec is not written.
- [x] **Q7. Two of the fifteen aksi are not messages, so what are they?** Found while drafting
      `MESSAGES.md`. Dana's "Periksa dulu catatan penyalurannya" asks the visitor to open
      `/jejak/` and read; Pohon's "Rawat pohon yang sudah ada" asks nothing of bagiberbagi at all.
      `design.md` states there is no `link` kind, and the Dana row is a counter-example: a real
      internal page that no relationship derives. ~~**Recommendation: `none` for Pohon, which is
      correct rather than a compromise, and a `link` kind restricted to internal routes for
      Dana.**~~

      **Answered 10 August 2026, and the recommendation was not taken: "bagus kalo semua action by
      default ngobrol via whatsapp aja."** Every aksi defaults to `conversation`. So **no `link`
      kind is added**, which keeps the union at the three members each justified by something the
      site already does, and `none` stays in the schema as the state for an aksi whose message has
      not been written yet rather than as a designed destination.

      That resolves the structural question and leaves one copy problem, which is cheaper to fix
      in words than in schema. Dana's aksi tells the reader to check the record **before** sending
      money, so a button under it saying "chat us" would argue with the sentence above it. The
      message is written to agree with it instead: it says the reader has already looked. Same for
      Pohon, where the message is about what to do next rather than a request for help. Both are
      in `MESSAGES.md`.

---

# GROUP 1 — no approval needed

An agent may finish these and hand back a merge-ready branch. Nothing a visitor sees changes in
any of them.

## Track A — OpenSpec bookkeeping

Files: `openspec/changes/add-aksi-mechanism/**` and `openspec/changes/add-calculator-settings/**`.
No code. Runs in parallel with everything.

- [x] A1 Create `openspec/changes/add-aksi-mechanism/` with `.openspec.yaml`
      (`schema: spec-driven`, `created: <date>`), `proposal.md`, `design.md` (the approved design,
      moved in whole), and this `tasks.md`. The eleven migration steps that currently sit inside
      `design.md` belong here as tracks, not there — remove them from `design.md` when it moves,
      so there is exactly one ordering of the work in the repository.
- [x] A2 `proposal.md` needs the four sections the last change used: **Why**, **What Changes**
      (split Group 1 / Group 2), **Capabilities**, **Impact** (code, content, dependencies, where
      the risk concentrates), plus the **Parallelisation** table above.
- [x] A3 Delta specs under `add-aksi-mechanism/specs/`. Three capabilities, written 7 August 2026:
      - `aksi-and-ajakan` — **new capability.** The entity, the closed pintu set, the reader, and
        the ban on slug-branching.
      - `content-cms` — MODIFIED `Layout-bound content stays out of the CMS`, since
        `CATEGORY_CONTENT.contribute` leaves it; plus the extension agreement and the
        `fields.conditional` wire-shape verification, both as requirements rather than review notes.
      - `program-donation-cta` — MODIFIED, both requirements repointed from slug tests to mechanism.
      - `analytics-tracking` — not written; it depends on Q6 and is a one-scenario delta once
        that is answered.

      **The ordering question is resolved: `add-food-programs-organisasi` archived first**, on
      7 August 2026, so `program-donation-cta` is a real capability in `openspec/specs/` and this
      change MODIFIES it rather than two open changes describing the same CTA in opposite terms.
      That archive was possible because its two remaining tasks turned out to be dischargeable —
      one mechanically, one by production — see that change's `STATUS.md`.

      Reconciling the two surfaced a live defect neither had noticed, now carried here as **Q2b**:
      package silently defaults to the first entry while quantity deliberately defaults to nothing.
- [x] A4 Decide the fate of `openspec/changes/add-calculator-settings/`. It holds `proposal.md`
      as well as `design.md`, and this change supersedes only the latter. Two honest options,
      both fine, neither allowed to be left implicit: **cancel** it (delete the folder, and say
      so in the new `proposal.md`'s Why), or **archive** it as a rejected framing. Pick one and
      write one sentence in the new proposal saying which.

      **Cancelled and deleted**, with the reasoning in this change's `proposal.md` under "What
      this replaces". Archiving was the alternative and it loses: the folder's framing was
      corrected twice by the owner, so what would be preserved is a wrong premise the next reader
      has to open the folder to discover. Its three measured findings survive in `design.md`.
- [x] A5 Confirm `openspec validate` (or whatever the repo's checker is, if any) is clean on the
      new folder; if there is no checker, confirm the folder's shape matches
      `openspec/changes/fix-mobile-ergonomics/` file for file. — `openspec validate --all --strict`
      reports **13 passed, 0 failed**. Before this it reported 2 failed, both for the same reason:
      a change with no `specs/` deltas. `.openspec.yaml` added to match the archived changes.

**Done when**: the gate passes (trivially, no code changed), `add-aksi-mechanism/` is complete,
and A4's decision is written down in prose rather than implied by a deletion.

---

## Track B — the schema, on both sides, plus the wire-shape spike

Files: `src/content.config.ts`, `keystatic.config.ts`. Additive only. Nothing reads the
collection when this track ends, so the site is byte-identical.

**This track carries the change's technical risk.** `fields.conditional` is used nowhere in
`keystatic.config.ts` today. Its on-disk JSON shape is the single most fragile assumption in the
design, and B4 exists to find out what it actually is before any reader is written against it.

- [x] B1 Add the `aksi` collection to `src/content.config.ts`: `glob({ pattern: '*.json', base:
      './src/content/aksi' })`, schema `{ items: z.array(aksiItem).default([]) }`. Six files, one
      per `PintuId`, id = the pintu id.
- [x] B2 **The schema is permissive; the reader is strict.** This is the rule that closes the
      sharpest gap in the design, which had `pricePerUnit: z.number().positive()` and
      `presets: […].min(1)`. `fields.integer` in this repo is written with `defaultValue` and no
      `validation: { isRequired: true }` (`keystatic.config.ts:363,368,582`), so clearing the box
      writes `null`; `fields.array` accepts zero items. Either one would throw inside
      `astro:content` and take the whole build down from the admin UI, with no developer present.

      **Shipped even more permissive than the list below, and B4 is why.** Reading Keystatic's
      serialisers showed every empty field omits its key rather than writing a value, so the
      constraint that mattered was not `.positive()` but tolerating an absent key at every level
      including `value` itself. What shipped:
      - `pricePerUnit: z.number().nullish()` — `.positive()` dropped, see B4.1
      - `presets: z.array(z.number().nullish()).default([])`
      - `packages: z.array(z.string().nullish()).default([])`
      - `message: z.string().nullish()`, inside a `value` that is itself `.nullish()`
      - `title: z.string().default('')`, `desc: z.string().nullish()`
      - `program: z.string().nullish()` — `fields.relationship` writes `undefined` when cleared
      - `showOnPintu: z.boolean().default(true)` — safe as a `.default()`, and it is the one
        field where that is true: `fields.checkbox` serialises `{ value }` unconditionally, so
        `false` is written explicitly and can never be mistaken for an absent key.
      Every one of these is normalised or warned about in Track C, never rejected here.
- [x] B3 Add the Keystatic side in the **same commit**: an `aksiPintu(id: PintuId)` factory
      returning a `singleton()`, six entries in `singletons`, and an `Aksi` group in
      `ui.navigation`. `format: 'json'` on both sides.
      - [x] B3.1 **The six singleton keys must be literal.** `keystatic.config.ts:74-78` already
            records why, in the comment above `legalPage()`: `ui.navigation` needs literal keys
            to reference them, so a computed key from `Object.fromEntries(PINTU_IDS.map(...))`
            does not work. Guard the drift with
            `const AKSI_KEYS = { food: 'aksiFood', … } satisfies Record<PintuId, string>` so
            adding a pintu to `PINTU_IDS` fails to compile until its singleton exists.

            **`satisfies` alone was not enough.** With `satisfies Record<PintuId, string>` the
            property types widen to `string`, and `ui.navigation` demands the literal union of
            singleton keys, so it failed to compile with a type error naming `Aksi: string[]`.
            `as const satisfies Record<PintuId, string>` keeps both halves: literal values for
            navigation, exhaustiveness against `PintuId`.
      - [x] B3.2 `mechanism` is `fields.conditional` over a three-option select
            (`none` / `conversation` / `quantity`), default `conversation`.
      - [x] B3.3 Field descriptions in Indonesian, matching the tone of the existing ones. The
            `program` relationship's description must say it is required when the mechanism is
            "pilih jumlah", since the schema cannot enforce that (see B2).
- [x] B4 **The spike, before Track C starts and before anything is authored by hand.** Run as a
      round-trip against Keystatic's own `createReader()` rather than through the admin UI:
      `storage.kind` is `'cloud'`, so saving a throwaway entry from `/keystatic` would commit it
      to the real repository through Keystatic Cloud. Reading the serialisers in
      `@keystatic/core@0.5.51` and then feeding hand-written files back through `parseProps`
      tests the same code the admin uses, without writing anything to the cloud.

      - [x] B4.1 **The three raw JSON bodies, verified accepted by `createReader()` and by
            `astro:content`.**

            `discriminant: 'none'` — `fields.empty()` serialises `{ value: undefined }`, so the
            `value` key is absent from the file entirely:
            ```json
            { "title": "Aksi none", "showOnPintu": true,
              "mechanism": { "discriminant": "none" } }
            ```
            `discriminant: 'conversation'`:
            ```json
            { "title": "Aksi conversation", "desc": "Punya surplus makanan layak?",
              "showOnPintu": true,
              "mechanism": { "discriminant": "conversation",
                "value": { "message": "Halo, saya punya surplus makanan." } } }
            ```
            `discriminant: 'quantity'`:
            ```json
            { "title": "Aksi quantity", "program": "jumat-berkah", "showOnPintu": false,
              "mechanism": { "discriminant": "quantity",
                "value": { "unit": "porsi", "pricePerUnit": 25000,
                           "presets": [10, 20, 50], "packages": [] } } }
            ```

            **The finding Track C has to be built on: an empty field is an ABSENT KEY, not a
            null.** Every serialiser in `@keystatic/core@0.5.51` returns `{ value: undefined }`
            for its empty state, and `undefined` disappears when the file is written as JSON:
            `text` → `value === '' ? undefined : value`; `integer` and `relationship` →
            `value === null ? undefined : value`; `empty()` → `undefined` always. The design and
            B2 both said "writes `null`", which is what the *reader* hands back after filling
            defaults, not what is on disk. Both are covered by `.nullish()`, so nothing had to
            change twice — but a Track C reader written to test `x === null` would miss every
            real case.

            Confirmed by round-trip on the sparsest file a Keystatic save can produce
            (`{ "discriminant": "quantity", "value": { "presets": [], "packages": [] } }`):
            `createReader()` returns `unit: ""`, `pricePerUnit: null`, `presets: []`.

      - [x] B4.2 **`fields.conditional` nests inside `fields.array` and the fallback was not
            needed.** `parseProps` recurses through `array` → `object` → `conditional` with no
            special case, and it enforces that a conditional object carries exactly the keys
            `discriminant` and `value` and nothing else. The `{ discriminant, value }` wire shape
            the design guessed is correct. **The nested shape shipped**, not the flat `kind`
            select.
      - [x] B4.3 Delete the throwaway entries. **Track B ships no `src/content/aksi/` at all**,
            not an empty directory: verified that `bun run build` succeeds with the directory
            absent, so no `.gitkeep` is needed to keep a collection-with-no-entries valid. Track D
            creates the six files.
- [x] B5 Confirm `/keystatic` lists six Aksi singletons and that each one saves and reloads. A
      silently empty list is the extension-mismatch failure this repo has already had once.

      Verified structurally rather than by hand in the admin, because the admin writes to
      Keystatic Cloud: the build emits `/keystatic/singleton/aksiFood/` through `…/aksiTree/`,
      six routes, which only exist for registered singletons; `astro check` proves the six
      `ui.navigation` keys resolve against the singleton union; and `createReader()` read both
      test files back through the same parser the admin uses. The extension agreement holds,
      `format: 'json'` on the Keystatic side and `pattern: '*.json'` on the Astro side.
- [x] B6 Confirm `bun run build` still emits the same page count as `main` and that
      `git diff --stat` against a pre-change `dist/` is empty. Adding a collection nothing reads
      must change nothing.

      **Measured by checksumming every file in `dist/` outside `dist/keystatic/`, building both
      with and without the change: 360 files, one differs.** That one is
      `_astro/KeystaticAdmin.*.js`, the admin application's own bundle, which changes because six
      singletons were added to it. Every page, image, feed and script a visitor can reach is
      byte-identical. Page count goes 55 → 61, all six new pages being the
      `/keystatic/singleton/aksi*/` admin routes.

**Done when**: the gate passes, `dist/` is unchanged, and the report carries the three raw JSON
bodies from B4.1 plus the B4.2 verdict.

---

## Track C — the readers

Files: `src/lib/aksi.ts`, `src/lib/ajakan.ts`, `src/lib/aksi.test.ts`. Depends on **B**, and
specifically on B4.1's raw JSON. Nothing imports these when the track ends.

### C1. `src/lib/aksi.ts`

- [x] C1.1 Types:
      ```ts
      export type AksiMechanism =
        | { kind: 'none' }
        | { kind: 'conversation'; message: string }
        | { kind: 'quantity'; unit: string; pricePerUnit: number; presets: number[]; packages: string[] };

      export interface Aksi {
        pintu: PintuId;
        title: string;
        desc: string;
        program: Program | null;   // resolved entry, never a slug
        showOnPintu: boolean;
        mechanism: AksiMechanism;
      }
      ```
- [x] C1.2 `readAksi(raw): Aksi[]` — **pure**, the only place the `fields.conditional` wire shape
      is visible, and the only thing in this change that flattens `{discriminant, value}` into
      `{kind, …}`. It joins `format.ts` and `impact.ts`'s `aggregateMetrics` in `bun test`.
- [x] C1.3 `getAksiByPintu(pintuId)` and `getAksiForProgram(slug)`, both async, both resolving
      `program` through `programs.ts`.
- [x] C1.4 **Dangling references degrade, they do not throw.** Copy `getProgramSection()` in
      `src/lib/home.ts` line for line: drop empty slugs, drop slugs that resolve to nothing, drop
      duplicates. An aksi whose `program` no longer exists keeps its title and description and
      loses its mechanism's destination, exactly like a jejak with a dead `organisasi`.
- [x] C1.5 **Invalid `quantity` numbers degrade, they do not throw.** Closes gap 3, the half the
      schema cannot cover:
      - `pricePerUnit` null, zero or negative → `console.warn` naming the pintu and the aksi
        title, and the mechanism becomes `conversation` with a message derived from the
        programme label. The WhatsApp link still works; only the picker is gone.
      - `presets` empty → `console.warn`, and the mechanism keeps `presets: []`. The card then
        renders the "Lainnya" stepper alone, which is a valid card. **Do not silently substitute
        `[6, 12, 20]`** — a hidden default is a second source of truth, and it is the same class
        of thing as the `|| '25000'` that Track F deletes.
      - `unit` empty → `'porsi'`.
- [x] C1.6 `resolvePintuHref(aksi, waNumber): string | null` — pure, tested. The destination of
      **one aksi's button on the pintu page**, which is not the same thing as the card's own CTA:
      | mechanism | returns |
      |---|---|
      | `none` | `null` |
      | `conversation` | `buildWaLink(waNumber, message)` |
      | `quantity` with a resolvable `program.href` | `` `${program.href}#donasi` `` |
      | `quantity` with `program === null` | `null` + `console.warn` |
      | `quantity` where the programme resolves but `href` is `undefined` | `null` + `console.warn` |
- [x] C1.7 That last row closes gap 5 and needs a test of its own. `programs.ts:73` sets `href`
      only when `hasPage` is true, so attaching a quantity aksi to any inactive programme — a
      thing the admin's relationship picker allows, since it lists every programme — would
      otherwise render the literal string `undefined#donasi` on a live pintu page.
- [x] C1.8 `unit` is carried and read by nobody. The roughly fifteen `"porsi"` literals in
      `DonationCard.astro`, `donation-card.js` and `buildDonationMessage` stay exactly as they
      are. **Do not thread them in this change.** Reserve the seam, do not build the machine.

### C2. `src/lib/ajakan.ts`

- [x] C2.1 ```ts
      export interface Ajakan {
        aksi: Aksi;
        program: Program;
        waNumber: string;
        agenda: Agenda | null;
        schedule: { weekday: string; time: string } | null;
      }
      export async function getAjakan(programSlug: string): Promise<Ajakan | null>;
      ```
- [x] C2.2 **`agenda` is gated inside the reader, not at the mount.** Closes the worst gap in the
      design. `program/[program].astro:83` computes
      `isRunning = (await getPrograms()).find(p => p.active)?.slug === program.slug` and passes
      `agenda={isRunning ? site.data.nextAgenda : null}`. The comment above it says what happens
      without the test: *"tanpa penjagaan ini jadwal Jumat ikut nongol di halaman Ramadhan
      Berbagi"*. Move that test into `getAjakan` verbatim, carry the comment with it, and gate
      `schedule` the same way — the mount currently gates both.
- [x] C2.3 **No `cover` on `Ajakan`.** The hero passes a photo and the programme page
      deliberately passes none, which is what selects the flat panel via
      `class:list={['dcard', !photo && 'is-flat', …]}` at `DonationCard.astro:104`. A
      non-optional `cover` on the reader would grow a photo header on every programme page.
      Photo choice is presentation, so it stays a prop — see F2.
- [x] C2.4 **No `jejakCount` on `Ajakan`.** It is slot content the hero owns, not something the
      card renders. `Hero.astro` keeps its own `getGlobalImpact()` call and its own `slot="foot"`.
      Modelling it here would be a field nothing reads, which is the exact thing C1.8 refuses.
- [x] C2.5 **A programme with no aksi never returns `null`.** `null` is reserved for a slug that
      does not resolve to a programme at all. A programme that resolves but has no aksi attached
      gets a synthesised `conversation` mechanism built from `settings.waNumber` and the message
      the page hardcodes today —
      `` `Halo, saya ingin mendiskusikan program ${label}.` `` — plus a build-time
      `console.warn`. A half-finished Track D therefore degrades to what already ships instead of
      deleting the site's main CTA.
- [x] C2.6 `getAjakan` picks **one** aksi: the first, in array order, whose `program` resolves to
      that slug. Both mounts render one card with one mechanism today. Many-aksi-per-card is not
      modelled; adding it later changes `ajakan.ts` and neither caller.

### C3. Tests

- [x] C3.1 `readAksi()` against the three raw JSON bodies from B4.1, one test per mechanism kind.
- [x] C3.2 `readAksi()` against each degradation in C1.5, asserting the returned shape **and**
      that nothing throws.
- [x] C3.3 `resolvePintuHref()` across all five rows of C1.6.
- [x] C3.4 Keep the tests pure. `aksi.ts` must not import `astro:content` at module scope, for
      the same reason `impact.ts` imports `jejak.ts` lazily inside its async functions.

**Done when**: the gate passes, `bun test` shows the new cases, and nothing in `src/` imports
either new file yet.

**Report.** Shipped as three files: `src/lib/aksi.ts` (types, `readAksi`, `resolvePintuHref`,
`getAksiByPintu`, `getAksiForProgram`), `src/lib/ajakan.ts` (`getAjakan`), `src/lib/aksi.test.ts`
(17 cases, `bun test` 61 pass across 6 files, up from 44 across 5). Nothing in `src/` imports
either reader; the only mention outside them is one comment in `content.config.ts`.

Two things came out different from the spec, both deliberate:

- **`readAksi` takes `(pintu, items, bySlug)`, not `(raw)`.** C1.2 asks for it to be pure and
  C1.3 asks the pintu id to reach the warnings; passing the resolved programme map in is what
  lets both hold at once, and it is the same shape `aggregateMetrics` already uses.
- **The tests capture `console.warn` instead of letting it print.** Ten warning lines per run
  would have trained the next reader to ignore them, and worse, C1.5's requirement that the
  warning *names the pintu and the aksi title* had no test at all. `withWarnings()` fixes both:
  the log is clean and five cases now assert on the message text.

One case earns its own line because it is the only degradation that stays silent: an unknown
`discriminant` becomes `none` with **no** warning. `none` is a legitimate state, and Keystatic's
select cannot produce any other value, so the only way to get there is a hand edit in git.

---

## Track E — the arithmetic seam

Files: `src/lib/format.ts`, `src/lib/format.test.ts`, `src/scripts/calculator.js`,
`src/components/_parked/DonationCalculator.astro`, and **only lines 65 and 234** of
`src/components/DonationCard.astro`. No dependencies. Runs in parallel with B, C and D.

The design said `calcTotal`'s only other caller is `DonationCard.astro`. That is wrong twice over,
and this track's scope is the correction.

- [x] E1 `calcTotal(pax: number, pricePerUnit: number)`. **A required second parameter, not a
      default** — a default would keep `25000` alive as a fallback and reintroduce the second
      source of truth this whole change exists to remove.
- [x] E2 `src/lib/format.test.ts` gains the argument. Add a case asserting that two different
      prices give two different totals, so the literal cannot creep back.
- [x] E3 **`src/scripts/calculator.js:13` also calls `calcTotal(pax)`.** It is imported by
      `src/components/_parked/DonationCalculator.astro:82`, and `tsconfig.json` includes `**/*`
      with only `dist` excluded, so it is in `astro check`'s scope. Being parked means it fails
      as a silent `NaN` rather than loudly. Two acceptable answers, pick one and say which:
      - pass an explicit price constant declared in the parked component, or
      - delete `_parked/DonationCalculator.astro` and `src/scripts/calculator.js` outright.
        `_parked/README.md:17` already records that it was folded into `DonationCard.astro`,
        nothing outside `_parked/` imports it, and `index.astro:28` only mentions it in a comment.
      **Recommendation: delete both.** A parked component that would produce `NaN` if ever
      unparked is worse than no component.
- [x] E4 **`DonationCard.astro` has two call sites, not one**: `:65` (`const price = calcTotal(1)`)
      and `:234` (`{formatRupiah(calcTotal(n))}` inside the preset chip label). The chip labels
      are the numbers a visitor actually reads, so missing `:234` ships wrong prices with a green
      build. Update both to take a `PRICE_PER_UNIT` constant declared at the top of the file with
      the comment *"temporary; replaced by `ajakan.aksi.mechanism.pricePerUnit` in Track F"*.
- [x] E5 **Touch nothing else in `DonationCard.astro`.** Track F owns the rest of that file.
- [x] E6 Prove `dist/` is unchanged. Build before and after, diff `dist/**/*.html`. Any difference
      is a defect in this track, not an improvement: the arithmetic is identical, only its
      plumbing moved.

**Done when**: the gate passes, E6's diff is empty, and the report says which of E3's two answers
shipped.

**Report.**

**E3 shipped the deletion**, the recommended answer. Both `_parked/DonationCalculator.astro` and
`src/scripts/calculator.js` are gone.

Verifying the README's premise before acting on it found it was loose, and that is worth
recording because it slightly weakens the case for deleting. `_parked/README.md` said the
calculator was "dilebur ke `DonationCard.astro`", folded in. It was not folded in whole: the
calculator had a **programme dropdown** and `DonationCard` has none. The card is always inside a
single programme's context — the running programme in the hero, that page's programme on a
programme page — so it never asks which programme. Reviving a cross-programme picker would be a
new design decision rather than a restoration. That distinction is now written into
`_parked/README.md` under "Yang sudah dihapus dari sini" so the next reader is not told a
half-true story about where the design went.

**E6 measured, not assumed: 398 files in `dist/`, checksummed with and without the track, zero
differences.** Built the stashed tree and the working tree and diffed the manifests.

**Track E crossed into Track J's territory, deliberately, for four lines.** Deleting the
calculator made four statements in the docs false — `.claude/rules/frontend-scripts.md` listing
"donation calculator" among the scripts, `.claude/rules/content-model.md` naming
`DonationCalculator` as a consumer of the programmes collection, the same file's line about the
"client-side calculator script", and `.claude/rules/layout-tiers.md` naming its panel. Leaving a
rules file asserting a component that no longer exists is a defect this track introduced, so this
track fixed it rather than deferring to J. Two files outside every track's territory needed the
same treatment: `_parked/README.md` and the comment at `src/pages/index.astro:28`.

`content-model.md` also gained the sentence explaining why `calcTotal`'s second parameter is
required rather than defaulted, since that is the rule a future reader is most likely to undo.

---

## Track H — retire `contribute`

File: `src/consts.ts`. Depends on **G** having merged.

- [ ] H1 Remove `contribute` from the `CategoryContent` interface (`consts.ts:141`) and from all
      six entries (`:166, 199, 217, 235, 253, 285`). The eighteen `{title, desc}` pairs now live
      in `src/content/aksi/*.json`, put there by Track D as a verbatim diff.
- [ ] H2 `grep -rn "contribute" src` must come back empty except for prose in comments, which
      should be corrected rather than left describing a field that no longer exists.
- [ ] H3 `PINTU_CONCEPT[*].examples` in `PintuS1.astro:311-362` — twenty-four strings feeding the
      `#bentuk` section. **Keep them.** They are the empty-pintu fallback, which Track G's
      decision makes reachable for the first time (see G1). Only remove them if Track G came back
      having deleted the `showForms` branch, and if so this checkbox moves into that track.
- [ ] H4 `concept.what` stays. It feeds every pintu's opening paragraph and has nothing to do
      with this change.
- [ ] H5 Prove `dist/` is unchanged against post-G `main`. If a single pintu page moves, either G
      did not fully repoint or Track D's copy is not verbatim. Both are bugs, not surprises.

**Done when**: the gate passes, H2's grep is clean, and H5's diff is empty.

---

## Track I — rename to `Ajakan`

Depends on **F**, **G** and **H** having merged. Its own commit, and nothing else in it.

- [ ] I1 `src/components/DonationCard.astro` → `src/components/Ajakan.astro`.
- [ ] I2 `src/scripts/donation-card.js` → `src/scripts/ajakan.js`.
- [ ] I3 Update every import: `Hero.astro`, `pages/program/[program].astro`, the `<script>` tag
      inside the component, and anything `grep -rn "DonationCard\|donation-card" src` finds,
      including `_parked/README.md:17`.
- [ ] I4 **Class names and data attributes do not change.** `.dcard`, `.dc-*`,
      `data-donation-card`, `data-porsi`, `data-package-option`, `data-package-open-msg` all stay.
      Renaming them would bury Track F's behaviour diff under a mechanical rename and make both
      unreviewable.
- [ ] I5 Use `git mv` so the rename is recorded as a rename and the diff stays readable.
- [ ] I6 Prove `dist/` is unchanged. A pure file rename that alters output is a mistake.

**Done when**: the gate passes, I6's diff is empty, and `grep -rn "DonationCard" src` is empty.

---

## Track J — the rules docs

Files: `.claude/rules/content-model.md`, `.claude/rules/routing-taxonomy.md`,
`.claude/rules/analytics.md`. Depends on **I**, so the names in the prose are final.

This change makes two of these files wrong as written. That is not a footnote: they are the files
the next session loads instead of reading the code.

- [ ] J1 `content-model.md` — add an `aksi` bullet next to `programs` and `organisasi`. It must
      carry: six `*.json` files, one per `PintuId`; **written by Keystatic as six singletons and
      read by Astro as one collection**, the same split `legal` already uses and for the same
      reason (a fixed set whose ids are hardcoded in `consts.ts` must not get add/delete/rename
      affordances); literal singleton keys, with the `satisfies Record<PintuId, string>` guard and
      why `Object.fromEntries` does not work; the three mechanism kinds; the `program`
      relationship being optional and defensively resolved; and the rule that the schema is
      permissive while the reader warns and degrades.
- [ ] J2 `content-model.md` — the `format.ts` bullet at the end says it holds the pure functions
      used by both server markup and the client calculator. `calcTotal` now takes a price. Correct
      the sentence, and record that `readAksi()`/`resolvePintuHref()` joined `format.ts` and
      `aggregateMetrics` as the unit-tested pure surface.
- [ ] J3 `routing-taxonomy.md` — the `CATEGORY_CONTENT` sentence currently lists `contribute` as
      one of its blocks and calls the whole thing "still hardcoded and a candidate to move into
      Keystatic". After Track H that is false for exactly one block. Rewrite it to say
      `contribute` left for the `aksi` collection, that the remaining blocks (`story`, `stats`,
      `howItWorks`, `forWhom`, `env`, `faq`, `ctaTitle`/`ctaText`) are still hardcoded, and why
      only `contribute` moved: it was the one claiming a mechanism it did not have.
- [ ] J4 `routing-taxonomy.md` — add the pintu page's new empty state. `showForms` and
      `joinAsSteps` were unreachable while `contribute` was hardcoded and full; now that the list
      is editor-owned they are reachable, and `#bentuk` fed by `concept.examples` is what a pintu
      with no aksi falls back to.
- [ ] J5 `analytics.md` — **only if Q6 changed an event name.** If both `donate_click` and
      `inquiry_click` survive as recommended, record instead that the two events are now selected
      by `mechanism.kind` rather than by a slug list, since that file treats these values as the
      conversion definitions.
- [ ] J6 Do not restructure these files. Add and correct in place; they are read by every future
      session and their existing shape is load-bearing.

**Done when**: the gate passes and every sentence in the three files that this change falsified
has been corrected or deleted. Read them end to end, not just the paragraphs named above.

---

# GROUP 2 — needs the owner before merging

Two different kinds of approval here, and they are not interchangeable.

**Track D needs a copy decision**, not a look at a screen. It cannot start at all until Q3 is
answered.

**Tracks F and G need the owner's eyes on a dev server.** Finish the branch, start a dev server,
hand over the URL, the exact routes and the widths to check, then wait. Do not merge on your own
judgement.

## Track D — author the content

Files: `src/content/aksi/*.json`, six new files, nothing else. Depends on **B** for the schema and
on **Q3** for permission to draft.

- [ ] D1 **Blocked until Q3 is answered.** Do not draft fifteen WhatsApp messages on the theory
      that a draft is easier to correct than a blank. The copy-voice rule says the owner's words
      are used verbatim, and fifteen plausible-sounding drafts are the most expensive way to
      discover he wanted different ones.
- [ ] D2 Copy all eighteen `{title, desc}` pairs out of `CATEGORY_CONTENT` **side by side against
      `consts.ts`, word for word**. Not a script, not a transform, not a rewrite. The lines are
      the owner's: food's "Donasi paket", "Salurkan surplus", "Jadi mitra dapur"; goods' "Pilah
      isi lemari", "Kabari barang yang ada", "Bantu susun standarnya", and the twelve others.
- [ ] D3 Mechanisms for the eighteen:
      - food / "Donasi paket" → `quantity`, program `jumat-berkah`, price per Q1, presets
        `[6, 12, 20]` (the three currently hardcoded at `DonationCard.astro:66`).
      - food / "Salurkan surplus" and "Jadi mitra dapur" → `conversation`.
      - the fifteen non-food entries → `conversation`, each with a message per Q3. Most of their
        descriptions already say to get in touch on WhatsApp, so the message is implied by text
        the owner already wrote.
      - `showOnPintu: true` on all eighteen. They are exactly what the pintu pages show today.
- [ ] D4 Author the three programme-scoped aksi that have no `contribute` ancestor, all in
      `food.json`, all with **`showOnPintu: false`** unless Q5 says otherwise:
      - **Ramadhan Berbagi** → `quantity`, packages `['Sahur', 'Takjil', 'Buka Puasa']` lifted
        from `RAMADHAN_PACKAGES` at `program/[program].astro:54`, price per Q1 and Q2.
      - **Community Giving** → `conversation`, message
        `Halo, saya ingin mendiskusikan program Community Giving.`, matching `inquiryWaLink` at
        `:60` exactly.
      - **CSR Food Program** → `conversation`, same construction.
      Per Q4, Community Giving becomes `quantity` by editing this file, not by editing code.
- [ ] D5 **Author through `/keystatic`, not by hand in an editor**, at least for the first file.
      It is the only way to confirm the round trip — that what Track B's schema accepts is what
      the admin actually writes, and that reopening an entry shows the same values back.
- [ ] D6 `git diff` every `title` and `desc` against `consts.ts` before handing over. Zero
      character-level differences. A stray trailing space is fine; a reworded clause is not.
- [ ] D7 The site is still unchanged after this track. Nothing reads the collection until F and G.
      Confirm `dist/` is byte-identical.

**Hand over**: the six JSON files and the fifteen messages, as text, for the owner to read. This is
a copy review, not a dev-server review. Do not start a server for it.

---

## Track F — the card and both mounts

Files: `src/components/DonationCard.astro`, `src/components/Hero.astro`,
`src/pages/program/[program].astro`, `src/scripts/donation-card.js`. Depends on **C** and **E**.

This is where the change becomes visible.

### F1. The prop split

- [ ] F1.1 **Content comes from `ajakan`. Presentation stays a prop.** The design collapsed the
      mount to `<DonationCard ajakan trackSource id />` and lost four things the two call sites
      pass for real reasons. The split that keeps all of them:
      | prop | after |
      |---|---|
      | `ajakan` | new, carries `aksi`, `program`, `waNumber`, `agenda`, `schedule` |
      | `photo` | **stays a prop.** Hero passes `getProgramCover(program)`, the programme page passes nothing, and that absence is what selects `is-flat` at `:104` |
      | `eyebrow` | stays a prop |
      | `note` | stays a prop, see F1.3 |
      | `trackSource`, `id` | stay props, analytics and anchors |
      | `slot="foot"` | **stays**, see F1.4 |
      | `programLabel`, `waNumber`, `agenda`, `schedule`, `packages`, `programSummary`, `programHref` | gone, all now inside `ajakan` |
      Nine hand-assembled props become one plus four presentation ones. That is still the win;
      collapsing the four as well would be a regression dressed as tidiness.
- [ ] F1.2 `agenda` and `schedule` arrive already gated by `getAjakan` (C2.2). Delete
      `runningProgram` and `isRunning` from `program/[program].astro:82-83` and **confirm on a
      built page that `/program/ramadhan-berbagi/` shows no Friday agenda panel.** That is the
      exact regression the deleted comment warns about, and it is invisible unless looked for.
- [ ] F1.3 `note` — *"Sudah termasuk pengantaran dan dokumentasi foto serta video penyaluran."*
      — is a factual claim about the service, and it is only true of a `quantity` ask. Today it
      cannot reach a conversation card because the inquiry branch is separate; after F3 it can.
      **Render `note` only in the quantity branch**, or have the programme page pass it only for
      quantity. Either way it must not appear under a conversation CTA.
- [ ] F1.4 Keep the `foot` slot. The hero's *"Lihat laporan {n} penyaluran sebelumnya"*
      (`Hero.astro:66-71`) and the programme page's mitra line (`:192-195`) both live there.
      `jejakCount` is not on `Ajakan` (C2.4) — the hero keeps its own `getGlobalImpact()` call.

### F2. The mechanism branch

- [ ] F2.1 The component branches on `ajakan.aksi.mechanism.kind`, and on nothing else. No slug
      appears anywhere in `program/[program].astro` after this track.
- [ ] F2.2 `quantity` → today's card: chips from `mechanism.presets`, price from
      `mechanism.pricePerUnit` (replacing E4's temporary constant at both `:65` and `:234`),
      package buttons from `mechanism.packages`.
- [ ] F2.3 `conversation` → the "PAKET CUSTOM" panel's markup, moved in from
      `program/[program].astro:170-182`. Its WhatsApp href is `mechanism.message` through
      `buildWaLink`, built at build time. The mitra line that currently sits *inside* that panel
      at `:180` moves out to the `foot` slot, which is where the self-serve branch already keeps
      it — that is the whole reason F1.4 keeps the slot.
- [ ] F2.4 `none` → the card renders its identity and agenda and no CTA. Not reachable from either
      mount today, since `getAjakan` synthesises a conversation for a programme with no aksi
      (C2.5), but it is a typed case and the component must handle it rather than fall through.
- [ ] F2.5 `packages` is a field on `quantity`, not a fourth kind. The markup at `:193-210` and
      its `data-package-option` / `data-package-open-msg` contract are unchanged; only the source
      of the array changes.

### F3. Deletions in `program/[program].astro`

- [ ] F3.1 Delete `INQUIRY_PROGRAMS` (`:53`), `RAMADHAN_PACKAGES` (`:54`), `isInquiry` (`:57`),
      `packages` (`:58`), `inquiryWaLink` (`:60`), `runningProgram` and `isRunning` (`:82-83`),
      and the whole `isInquiry ? … : …` branch at `:170-197`.
- [ ] F3.2 `mitraWa` (`:64`) **stays**. It renders identically on every programme, is not
      slug-gated, and is not a special case waiting to be absorbed. Folding it into content trades
      a working uniform link for a per-programme authoring obligation, and the first programme the
      owner forgets loses its partner CTA.
- [ ] F3.3 `grep -n "program.slug ===\|\.has(program.slug)" src/pages/program/\[program\].astro`
      must come back empty.

### F4. The browser script

- [ ] F4.1 `donation-card.js:55` — delete the `|| '25000'` fallback. It is a second source of
      truth and it is unreachable, since the server always writes `data-price`. If the attribute
      is missing, bail out and leave the server-rendered href alone rather than guessing a price.
- [ ] F4.2 `donation-card.js:56`'s `|| 'Jumat Berkah'` is the same class of stale default.
      **Out of scope here** — note it and move on.
- [ ] F4.3 Everything else in the script is untouched. It already reads `card.dataset.price`,
      builds chips from `[data-porsi]`, and reads packages from `[data-package-option]`. Presets
      and packages are rendered server-side from the mechanism, so the DOM contract holds as-is.
      **If this track finds itself rewriting the script, the mechanism is being modelled wrong.**
- [ ] F4.4 Verify the no-JS path on the built output: disable JavaScript, load
      `/program/jumat-berkah/` and `/program/community-giving/`, and confirm both CTAs still open
      a correctly addressed WhatsApp conversation.

### F5. Analytics — needs Q6

- [ ] F5.1 The self-serve card fires `data-track="donate_click"`; the inquiry panel fires
      `data-track="inquiry_click"` (`:175`). Folding the panel into the component means the
      component picks the event.
      **Recommendation: keep both**, selected by `mechanism.kind`, so the historical series stays
      comparable across the change. `.claude/rules/analytics.md` treats these values as the
      conversion definitions, so whatever is decided gets a sentence there in Track J.
- [ ] F5.2 `data-track-program` and `data-track-source` keep their current values
      (`hero_card`, `program_page`) on both branches.

### F6. Order of work

- [ ] F6.1 Swap `Hero.astro` first. Build. Look at `/`. It is the smaller change and it is the
      quantity path, so a mistake shows immediately.
- [ ] F6.2 Then `program/[program].astro`, then the deletions in F3.
- [ ] F6.3 Walk all four programme pages that have one: `jumat-berkah`, `ramadhan-berbagi`,
      `community-giving`, `csr-food-program`. Two of them used to render a different component
      than the one they render now.

**Hand over**: a dev server, plus `/`, `/program/jumat-berkah/`, `/program/ramadhan-berbagi/`,
`/program/community-giving/` and `/program/csr-food-program/` at 390 and 1280. One line saying
what moved: the two inquiry programmes now render the same card as the others, in its
conversation form, instead of a separate panel.

---

## Track G — the pintu page CTA

Files: `src/components/_variants/PintuS1.astro`, `src/pages/berbagi-[pintu].astro`. Depends on
**C** and **D**.

This is the point of the whole change: the numbered list stops being inert prose.

### G1. The finding that makes this cheap, and which must be re-verified first

- [ ] G1.1 **Confirm before doing anything else that both `contribute.length === 0` branches are
      unreachable today.** All six `PINTU_IDS` have a three-item `contribute`
      (`consts.ts:166, 199, 217, 235, 253, 285`), and `berbagi-[pintu].astro:20` passes the object
      straight through, so `showForms` (`:450`) and `joinAsSteps` (`:474`) are constant `false` at
      build. Verify by building and grepping `dist/berbagi-*/index.html` for `id="bentuk"` — it
      must appear zero times. **If it appears anywhere, stop and re-plan this track**, because
      then repointing the source is a visual change on a live page.
- [ ] G1.2 **Keep both flags. Repoint their source.** Keeping a guard that has never fired looks
      like cargo and here it is the opposite: while `contribute` was hardcoded and full the empty
      state *could not* happen, and after this change the list is editor-owned, so it becomes
      reachable for the first time. Deleting a guard exactly as it starts being able to fire is
      backwards. `#bentuk` fed by `concept.examples` stays as the empty-pintu fallback.
      ```diff
      - const contribute = content?.contribute ?? [];
      + const aksiList = aksi.filter((a) => a.showOnPintu);
      ```
- [ ] G1.3 `showForms`, `joinAsSteps`, `joinId` (`alur` / `cara-ikut`), `joinEyebrow`, `joinTitle`,
      `joinLead`, `flowNote`, the `.s1-strip` guard and the whole `jumpLinks` block keep their
      exact logic. Only the array they test changes.

### G2. The type problem the design did not name

- [ ] G2.1 `stepItems = joinAsSteps ? flowSteps : aksiList` (`:475`) is a union of two unrelated
      shapes, and the `alur` branch's items have no `mechanism`. Reading `item.mechanism` inside
      `<li class="s1-step">` at `:738-742` is a **type error under TS strict**, not a no-op that
      renders nothing.
- [ ] G2.2 **Normalise in the frontmatter, not in the template.** Build one
      `{ title: string; desc: string; cta: { href: string; label: string } | null }[]` from either
      branch, so the `<ol>` at `:736` maps over one shape and never branches on the item's type.
      The alternative — wrapping the CTA in `{!joinAsSteps && …}` inside the loop — leaves the
      union in the template and will fail `astro check` the same way.

### G3. The one markup change

- [ ] G3.1 Each `<li class="s1-step">` gains an optional CTA below `.s1-step-desc`. The href is
      resolved by `resolvePintuHref()` in `berbagi-[pintu].astro`, not in the component, so
      `PintuS1` stays link-building-free the way `contactWa` and `notifyWa` already arrive
      pre-built.
- [ ] G3.2 Behaviour per mechanism:
      | mechanism | CTA on the pintu page |
      |---|---|
      | `none` | nothing rendered — the `<li>` is byte-identical to today |
      | `conversation` | `buildWaLink(waNumber, message)`, fully formed server-side, works with JS off |
      | `quantity` with a page-having programme | `` `${program.href}#donasi` `` |
      | `quantity` with no usable destination | no CTA, plus the build-time warn from C1.6 |
- [ ] G3.3 `#donasi` is a real target: `DonationCard` is mounted with `id="donasi"` and
      `scroll-mt-24` in both `Hero.astro:56` and `program/[program].astro:175`. Click through one
      and confirm the card is not hidden behind the sticky header.
- [ ] G3.4 Add the scoped `.s1-step-cta` style. `.s1-step` is a grid at `:1651` with a different
      shape below 768 at `:1688`; check the CTA sits correctly in both.
- [ ] G3.5 `berbagi-[pintu].astro` gains one `getAksiByPintu()` call and one prop; `PintuS1`'s
      `Props` gains `aksi: Aksi[]`.
- [ ] G3.6 `contactWa` and `notifyWa` at the hero and the foot of the pintu page are untouched.
      They are "tell me when this opens", not ways to take part.

### G4. Verification

- [ ] G4.1 Walk all six pintu pages. Track D's `showOnPintu: false` on the three
      programme-scoped aksi keeps every list at its current length, so any change in the number
      of `<li>` elements is a defect.
- [ ] G4.2 Diff `dist/berbagi-*/index.html` against `main`. The only differences should be the
      new CTA anchors. Any change to a heading, an eyebrow, a jump link or a step's text means
      either Track D's copy is not verbatim or a flag was repointed wrongly.
- [ ] G4.3 Temporarily empty one `src/content/aksi/*.json`, build, and confirm the page falls back
      cleanly: `#bentuk` appears, the join block becomes `id="alur"` with the "Alurnya" label, the
      `.s1-strip` disappears, and the jump links follow. **Then restore the file.** This is the
      branch G1.2 exists to protect and it has never once executed on a real page.

**Hand over**: a dev server, plus `/berbagi-makanan/`, `/berbagi-barang/`, `/berbagi-waktu/`,
`/berbagi-ruang/`, `/berbagi-dana/` and `/berbagi-pohon/` at 390 and 1280. One line saying what
moved: every numbered "cara ikut" item now has a button under it, and five of the six pintu are
offering a real way to take part for the first time.
```

**Path**: the file above is the deliverable content for `/Users/ekodedypurnomo/Developer/Project/bagiberbagi-website/openspec/changes/add-aksi-mechanism/tasks.md`. Nothing was written to disk — this workflow is read-only.

**Gap coverage**: 1 → C2.2/C2.3/C2.4 + F1.1/F1.2/F1.3; 2 → F1.4 + F2.3 + C2.4; 3 → B2 + C1.5; 4 → E3/E4; 5 → C1.6/C1.7; 6 → F5 + Q6 + J5; 7 → G2.1/G2.2; 8 → Track A.