# Completeness review

An adversarial pass over `design.md`, run before anything was written to the codebase. Its job
was to find what is missing or wrong, not what is arguable. Every gap below is unresolved
unless `tasks.md` says otherwise.

Verified against the repo. The design is mostly sound — both configs are edited, extensions agree (`json`/`json`), the 18 entries are copied verbatim in step 4, the no-JS href survives, and I confirmed its two riskiest claims are true: all six pintu do have a 3-item `contribute` (`consts.ts:166,199,217,235,253,285`), so `showForms`/`joinAsSteps` are genuinely dead branches today, and `keystatic.config.ts:77` really does forbid computed singleton keys. Gaps below, ranked by consequence.

**1. `Ajakan` swallows four per-mount guards that exist for a reason. Breaks the program pages visually and factually.**
The collapsed mount `<DonationCard ajakan trackSource id />` has no room for what the two call sites pass today:
- `agenda={isRunning ? site.data.nextAgenda : null}` (`program/[program].astro:186`). The `isRunning` test — `runningProgram?.slug === program.slug` at `:83` — is the guard whose own comment says that without it *"jadwal Jumat ikut nongol di halaman Ramadhan Berbagi"*. `Ajakan.agenda` is `Agenda | null` with no statement that `getAjakan` reproduces the test. Ramadhan Berbagi would advertise Jumat Berkah's next agenda.
- `photo`. Hero passes `programCover`, the program page deliberately passes **none** so the card renders `is-flat` (`DonationCard.astro:104`, `class:list={['dcard', !photo && 'is-flat', …]}`). `Ajakan.cover` is unconditional `ImageMetadata`, so the flat panel grows a photo header.
- `eyebrow="Hitung donasi"` and `note="Sudah termasuk pengantaran dan dokumentasi foto serta video penyaluran."` (`:189-190`). Dropped with no replacement home, and `note` is a factual claim about the service, not decoration.

**2. Both mounts pass a `slot="foot"`, and the design deletes it while claiming `mitraWa` is unaffected.**
Hero's slot holds "Lihat laporan {n} penyaluran sebelumnya" (`Hero.astro:66-71`); the program page's slot holds the mitra line (`:192-195`). "**`mitraWa` … stays as one line in `program/[program].astro`**" is only true for the self-serve branch. In the inquiry branch the mitra link lives *inside* the panel being moved into the component (`:180`), so after step 7 the page has no place to put it unless the slot is kept. Also `Ajakan.jejakCount` is modelled but the card never renders it — that number is slot content the hero owns, so it is in the wrong layer.

**3. An editor with no developer present can fail the build from the admin UI.**
`pricePerUnit: z.number().positive()` and `presets: z.array(…).min(1)`. `fields.integer` in this repo is written with `defaultValue` and no `validation: { isRequired: true }` (`keystatic.config.ts:363,368,582`), so clearing the box writes `null`; `fields.array` accepts zero items. Either one makes `astro:content` throw at build. Every other editor-facing failure mode in this repo degrades with a `console.warn` (`createImageResolver`, `analytics.ts` `misconfigured`, `getProgramSection`), by an explicit rule in `.claude/rules/image-pipeline.md`. The design applies that discipline to a dangling `program` reference and abandons it for the numbers.

**4. `calcTotal`'s caller list is wrong, so step 6 under-scopes.**
"Its only other caller is `DonationCard.astro`" — `src/scripts/calculator.js:13` also calls `calcTotal(pax)` (imported by `_parked/DonationCalculator.astro:82`). `tsconfig.json` includes `**/*` with only `dist` excluded, so it is in scope; being parked means it fails silently as `NaN` rather than loudly. Within `DonationCard.astro` there are **two** call sites, not one: `:65` (`price`) and `:234` (`formatRupiah(calcTotal(n))` on every chip label), and the chip labels are the ones a visitor reads.

**5. A `quantity` aksi can point at a program that has no page.**
The fallback table covers "no resolvable `program`" but not "resolves, `href` is `undefined`". `programs.ts:73` sets `href` only when `hasPage`, so `program.href + '#donasi'` renders `undefined#donasi` on the pintu page. Reachable through the admin by attaching a quantity aksi to any inactive program.

**6. `inquiry_click` is deleted without a decision.**
`program/[program].astro:175` fires `data-track="inquiry_click"`; the card fires `data-track="donate_click"` (`DonationCard.astro:~250`). Folding the inquiry panel into the component either renames the conversion event or drops it. `.claude/rules/analytics.md` treats these values as the conversion definitions, so this needs a sentence.

**7. The per-item CTA in `PintuS1` needs a branch guard the design does not name.**
`stepItems` is `joinAsSteps ? flowSteps : aksiList` (`:475`). In the `alur` branch the items are `INTAKE_FLOW`/`howItWorks` steps with no `mechanism`, so reading `item.mechanism` inside `<li class="s1-step">` is a type error under TS strict, not just a no-op. The CTA belongs under `{!joinAsSteps && …}`.

**8. OpenSpec artifacts.** `openspec/changes/add-calculator-settings/` holds `proposal.md` as well as `design.md`; the design supersedes only the latter and never says whether the old change is cancelled or archived, nor that `add-aksi-mechanism/` needs its own `proposal.md` and `tasks.md` (the 11 migration steps are tasks.md content sitting inside design.md).

Not gaps, checked and clear: no slug-matched `if` survives in `program/[program].astro` (both `INQUIRY_PROGRAMS` and the `ramadhan-berbagi` test are removed); `fields.conditional` is genuinely unused in `keystatic.config.ts` today, so flagging it as the fragile spot is right; the `legal` precedent for collection-read/singleton-write is real (`content.config.ts:23` + `legalPage()` at `keystatic.config.ts:79`); `fields.relationship` inside `fields.array` inside a singleton is real (`keystatic.config.ts:472`).