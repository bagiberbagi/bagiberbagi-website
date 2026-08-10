# Aksi and Ajakan

*Proposed path: `openspec/changes/add-aksi-mechanism/design.md`. Supersedes the model sketched in `openspec/changes/add-calculator-settings/design.md`, which named the two entities but stopped short of a schema.*

**Recommendation: make `aksi` a drag-ordered array field owned by the pintu, each item carrying an optional `fields.relationship` into `programs` and a three-kind `mechanism` union (`none` / `conversation` / `quantity`), and make `ajakan` one reader — `getAjakan(programSlug)` — that answers "what is the ask for this programme" the way `getProgramCover()` already answers "what does this programme look like".**

---

## The shape

```
pintu (6, fixed, from PINTU_IDS)
  └── aksi[]            ← array field, drag-ordered, editor-owned
        ├── title, desc          the owner's existing words, verbatim
        ├── program?             fields.relationship → programs (optional)
        ├── showOnPintu          curates the numbered list on /berbagi-<pintu>/
        └── mechanism            none | conversation | quantity
                                    ↑
                       one union, two renderers:
                       the pintu list item, and the ajakan card
```

`ajakan` is a component plus a reader, not a second store. Nobody authors one by hand — it is assembled at build time from `aksi` + `programs` + `settings` + `impact.ts`.

---

## Where an aksi lives, and why not a collection

Six per-pintu files. Keystatic writes them as **six singletons**; Astro reads them as **one collection**, `getEntry('aksi', 'food')`. That split is not new here — `legal` already does exactly this (`defineCollection` in `content.config.ts:23`, three `singleton()` calls in `keystatic.config.ts` via the `legalPage()` factory), and `.claude/rules/content-model.md` records the reason: a collection's add/delete/rename-slug UI is wrong for a fixed set whose ids are hardcoded elsewhere. A seventh pintu is a `consts.ts` edit, never an admin action.

Three things ruled out a per-entry `aksi` collection, which is where the first draft of this model went:

- **No aksi needs a route.** `programs`, `jejak`, and `organisasi` are collections because each entry gets `/<slug>/`. Nothing in this change asks for `/aksi/donasi-paket/`.
- **Ordering matters and the count stays small.** That is the exact condition under which `faq` and `footer` were converted *out* of collections, because Keystatic derives filenames from `slugField` and an admin-added entry sorted into an arbitrary position. The pintu page renders these as a numbered list `01 / 02 / 03`; array order is the ordering.
- **A relationship does not require a collection.** `keystatic.config.ts:472` is already `fields.array(fields.relationship({ collection: 'programs' }))` living inside the `home` JSON **singleton**, read back defensively by `getProgramSection()` in `src/lib/home.ts`. The pattern this design needs is proven and in production.

One correction that all four candidate models got wrong: **the singleton keys must be literal**, not generated with `Object.fromEntries(PINTU_IDS.map(...))`. `keystatic.config.ts:74-78` says why in a comment — `ui.navigation` needs literal keys to reference them. Use a factory returning a singleton, exactly like `legalPage()`, and guard drift with a type assertion rather than a computed key:

```ts
const AKSI_KEYS = {
  food: 'aksiFood', goods: 'aksiGoods', time: 'aksiTime',
  space: 'aksiSpace', money: 'aksiMoney', tree: 'aksiTree',
} satisfies Record<PintuId, string>;
```

Adding a pintu to `PINTU_IDS` then fails to compile until its singleton exists.

---

## The aksi model

### `src/content.config.ts`

```ts
// Wire shape written by fields.conditional. VERIFY BEFORE TRUSTING — see
// "Still unknown" below; this is the first use of fields.conditional in the repo.
const aksiMechanism = z.discriminatedUnion('discriminant', [
  z.object({
    discriminant: z.literal('none'),
    value: z.unknown().nullish(),
  }),
  z.object({
    discriminant: z.literal('conversation'),
    value: z.object({ message: z.string().default('') }),
  }),
  z.object({
    discriminant: z.literal('quantity'),
    value: z.object({
      // Dibawa sejak hari pertama, belum dibaca siapa pun: lihat catatan unit.
      unit: z.string().default('porsi'),
      pricePerUnit: z.number().positive(),
      presets: z.array(z.number().positive()).min(1),
      packages: z.array(z.string()).default([]),
    }),
  }),
]);

const aksiItem = z.object({
  title: z.string(),
  desc: z.string().default(''),
  // fields.relationship menulis null saat dikosongkan → nullish, dan slug-nya
  // bisa basi persis seperti home.programSection.items, jadi pembacanya wajib
  // membuang rujukan yang tak menunjuk apa-apa.
  program: z.string().nullish(),
  showOnPintu: z.boolean().default(true),
  mechanism: aksiMechanism,
});

const aksi = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/aksi' }),
  schema: z.object({ items: z.array(aksiItem).default([]) }),
});
```

### `keystatic.config.ts`

```ts
function aksiPintu(id: PintuId) {
  const pintu = PINTU.find((p) => p.id === id)!;
  return singleton({
    label: `Aksi — ${pintu.label}`,
    path: `src/content/aksi/${id}`,
    format: 'json',
    schema: {
      items: fields.array(
        fields.object({
          title: fields.text({ label: 'Judul aksi' }),
          desc: fields.text({ label: 'Deskripsi', multiline: true }),
          program: fields.relationship({
            label: 'Program yang menjalankannya',
            description:
              'Kosongkan kalau belum ada program yang menjalankan aksi ini. Wajib diisi kalau mekanismenya "pilih jumlah".',
            collection: 'programs',
          }),
          showOnPintu: fields.checkbox({
            label: 'Tampilkan di halaman pintu',
            description:
              'Matikan untuk aksi yang cuma jadi tombol di kartu programnya, tanpa menambah panjang daftar "Cara ikut" di halaman pintu.',
            defaultValue: true,
          }),
          mechanism: fields.conditional(
            fields.select({
              label: 'Mekanisme',
              options: [
                { label: 'Belum ada tombol', value: 'none' },
                { label: 'Percakapan WhatsApp', value: 'conversation' },
                { label: 'Pilih jumlah lalu WhatsApp', value: 'quantity' },
              ],
              defaultValue: 'conversation',
            }),
            {
              none: fields.empty(),
              conversation: fields.object({
                message: fields.text({ label: 'Isi pesan WhatsApp', multiline: true }),
              }),
              quantity: fields.object({
                unit: fields.text({ label: 'Satuan', defaultValue: 'porsi' }),
                pricePerUnit: fields.integer({ label: 'Harga per satuan (Rp)', defaultValue: 25000 }),
                presets: fields.array(fields.integer({ label: 'Jumlah' }), {
                  label: 'Pilihan cepat',
                  itemLabel: (p) => String(p.value ?? ''),
                }),
                packages: fields.array(fields.text({ label: 'Nama paket' }), {
                  label: 'Paket (opsional)',
                  description: 'Kosongkan untuk program berpaket tunggal.',
                  itemLabel: (p) => p.value || 'Paket',
                }),
              }),
            }
          ),
        }),
        { label: 'Aksi', itemLabel: (p) => p.fields.title.value || 'Aksi' }
      ),
    },
  });
}

// singletons: aksiFood: aksiPintu('food'), … (literal keys, see above)
// ui.navigation: Aksi: ['aksiFood', 'aksiGoods', 'aksiTime', 'aksiSpace', 'aksiMoney', 'aksiTree']
```

Both sides are `*.json` — the extension agreement that `.claude/rules/content-model.md` records as already having failed once.

**On `unit`.** It sits on the `quantity` mechanism with the value `'porsi'`, the reader returns it, and **nothing reads it**. The roughly fifteen `"porsi"` literals in `DonationCard.astro`, `donation-card.js`, and `buildDonationMessage` stay exactly as they are. It lives on the mechanism rather than at the top of `Ajakan` because a conversation has no unit, and every one of those fifteen literals is inside the picker or the donation message. Reserve the seam, do not build the machine.

---

## The mechanism kinds

Three kinds. Every one is a thing the site does today, not a thing it might do.

| kind | what exists today | evidence |
|---|---|---|
| `quantity` | the chips + stepper + optional package buttons that build a WhatsApp link | `DonationCard.astro:193-279`, `donation-card.js:54-148`, `calcTotal` in `format.ts:42` |
| `conversation` | a fixed, pre-built WhatsApp message with no picker | `INQUIRY_PROGRAMS` at `program/[program].astro:53`, `inquiryWaLink:60`, `mitraWa:64` |
| `none` | title and description with nothing to click | all eighteen `CATEGORY_CONTENT[*].contribute` entries; grep for `href`/`wa.me` inside them returns zero |

`packages` is a field on `quantity`, not a fourth kind, because that is what it already is: the package buttons render *inside* the same card above the same chips, and the chosen package is folded into the same message (`donation-card.js:97-116`). Making it a kind would split one UI into two.

There is **no `link` or `anchor` kind**. Nothing today needs an editor-authored URL, and the one place a quantity aksi needs a destination outside its own card — the pintu page — is derived from the `program` relationship (`program.href + '#donasi'`), not authored. `#donasi` is a real target: `DonationCard` is mounted with `id="donasi"` and `scroll-mt-24` in both `Hero.astro:56` and `program/[program].astro:175`.

---

## The ajakan reader

Two files, mirroring how `programs.ts` reads a collection and `home.ts` joins across two.

```ts
// src/lib/aksi.ts — single-source reader for the aksi collection
export type AksiMechanism =
  | { kind: 'none' }
  | { kind: 'conversation'; message: string }
  | { kind: 'quantity'; unit: string; pricePerUnit: number; presets: number[]; packages: string[] };

export interface Aksi {
  pintu: PintuId;
  title: string;
  desc: string;
  /** Sudah di-resolve ke entri program, bukan slug. null = tak ada / rujukan basi. */
  program: Program | null;
  showOnPintu: boolean;
  mechanism: AksiMechanism;
}

/** Meratakan bentuk kawat fields.conditional ({discriminant,value}) jadi {kind,...}.
 *  Satu-satunya tempat bentuk itu terlihat; pure, ikut `bun test`. */
export function readAksi(raw: unknown): Aksi[];

export async function getAksiByPintu(pintuId: PintuId): Promise<Aksi[]>;
export async function getAksiForProgram(slug: string): Promise<Aksi | null>;

/** Tujuan tombol satu aksi di HALAMAN PINTU (bukan di kartu). */
export function resolvePintuHref(aksi: Aksi, waNumber: string): string | null;
```

```ts
// src/lib/ajakan.ts — the join the two mount sites do by hand today
export interface Ajakan {
  aksi: Aksi;
  program: Program;
  cover: ImageMetadata;      // getProgramCover(program)
  waNumber: string;          // settings
  agenda: Agenda | null;     // settings.nextAgenda
  schedule: { weekday: string; time: string } | null;  // settings.schedule
  jejakCount: number;        // impact.ts
}

export async function getAjakan(programSlug: string): Promise<Ajakan | null>;
```

`null` only when the slug does not resolve to a programme. A programme that resolves but has **no aksi attached never returns null** — the reader synthesises a `conversation` mechanism from `settings.waNumber` with the message the page hardcodes today (`Halo, saya ingin mendiskusikan program ${label}.`) and emits a build-time `console.warn`, the same pattern as `analytics.ts`'s `misconfigured` flag and `createImageResolver`'s missing-file warning. A half-finished backfill therefore degrades to exactly what already ships, instead of silently deleting the site's main CTA. That was the sharpest operational objection raised against the winning model and it is answered in the reader, not in the migration checklist.

Mounting collapses from nine hand-assembled props to:

```astro
const ajakan = await getAjakan(program.slug);
…
<DonationCard ajakan={ajakan} trackSource="program_page" id="donasi" />
```

`trackSource` and `id` stay props: they are presentation and analytics, not content.

`getAjakan` picks **one** aksi (the first whose `program` resolves to that slug, in array order). Today both mounts render exactly one card with exactly one mechanism; many-aksi-per-card is not modelled, and adding it later changes `ajakan.ts` without touching either caller.

---

## What the pintu page renders

### The finding that makes this cheap

**Both `contribute.length === 0` branches are already unreachable.** All six `PINTU_IDS` have a `contribute` array of three items in `CATEGORY_CONTENT` (`consts.ts:151-293`), and `berbagi-[pintu].astro:20` passes that object straight through. So `showForms` and `joinAsSteps` are constant `false` at build today, `#bentuk` never renders on any live page, and `PINTU_CONCEPT[*].examples` — twenty-four strings — is dead markup. Verify with a build before acting on this.

That means retiring or repointing those branches is not a visual change on any of the six pages.

### The decision: keep both flags, repoint their source

```diff
- const contribute = content?.contribute ?? [];
+ // aksi datang sebagai prop dari halaman, seperti impact dan daftar program.
+ const aksiList = aksi.filter((a) => a.showOnPintu);
```

Everything downstream keeps its exact logic: `showForms`, `joinAsSteps`, `stepItems`, `joinId` (`alur` / `cara-ikut`), `joinEyebrow`, `joinTitle`, `joinLead`, `flowNote`, the `.s1-strip` guard, and the whole `jumpLinks` block are untouched.

Keeping guards that have never fired looks like cargo, and here it is the opposite. Today the list is hardcoded and full, so the empty state *cannot* happen. After this change the list is editor-owned, so the empty state becomes reachable for the first time. Deleting a guard exactly at the moment it starts being able to fire is backwards. `#bentuk` fed by `concept.examples` stays as the empty-pintu fallback for the same reason.

| state | `#bentuk` | join section | `.s1-strip` | jump links |
|---|---|---|---|---|
| aksi present (all six, after migration) | not rendered | `id="cara-ikut"`, eyebrow "Cara Ikut", items = aksi | rendered | unchanged |
| aksi emptied by an editor | rendered from `concept.examples` | `id="alur"`, items = `howItWorks`/`INTAKE_FLOW` | not rendered | `#bentuk` added, join label becomes "Alurnya" |

### The one markup change

Each `<li class="s1-step">` gains an optional CTA below `.s1-step-desc`, which is the entire point of the change — the numbered list stops being inert prose. The href is resolved by `resolvePintuHref()` in the page, so `PintuS1` stays link-building-free the way `contactWa`/`notifyWa` already arrive pre-built:

| mechanism | pintu-page CTA |
|---|---|
| `none` | nothing rendered — byte-identical to today |
| `conversation` | `buildWaLink(waNumber, message)`, fully formed server-side, works with JS off |
| `quantity` | `program.href + '#donasi'` — the picker lives on the card, the pintu page links to it |
| `quantity` with no resolvable `program` | no CTA + build-time warn; a quantity ask with nowhere to go is a content error, not a page crash |

`berbagi-[pintu].astro` gains one call and one prop; `PintuS1`'s `Props` gains `aksi: PintuAksi[]`. `contactWa` and `notifyWa` at the hero and the footer of that page are untouched — those are "tell me when this opens", not ways to take part.

---

## How the hardcoded things stop being hardcoded

**`INQUIRY_PROGRAMS`** (`program/[program].astro:53`) and the whole `isInquiry ? … : …` branch at `:170-197` are deleted. Community Giving and CSR Food Program are not special programmes; they are programmes whose aksi has `mechanism.kind === 'conversation'`. The "PAKET CUSTOM" panel moves from a branch in the page into a branch in the component, keyed on the mechanism. No page branches on a slug again.

**`RAMADHAN_PACKAGES`** and `program.slug === 'ramadhan-berbagi'` (`:54,58`) become `mechanism.packages` on Ramadhan's own aksi. The markup that consumes it (`DonationCard.astro:193-210`, `data-package-option` / `data-package-open-msg`) is unchanged; only where the array comes from changes.

**`25000`** leaves `format.ts` entirely. `calcTotal(pax: number, pricePerUnit: number)` — a required second parameter, not a default, so the literal does not survive as a fallback. The unit test gains an argument. `DonationCard.astro:66` becomes `calcTotal(1, mechanism.pricePerUnit)`.

**The browser script barely changes**, which is the quiet win. `donation-card.js` already reads `card.dataset.price` (`:55`), builds chips from `[data-porsi]` (`:59`), and reads packages from `[data-package-option]` (`:65`). Presets and packages are rendered server-side from the mechanism, so the DOM contract holds as-is. Two edits only: drop the `|| '25000'` fallback at `:55` (a second source of truth for the price, and unreachable since the server always writes the attribute — bail out and leave the server-rendered href if it is missing), and note that `|| 'Jumat Berkah'` at `:56` is the same class of stale default, out of scope here.

The no-JS path is preserved throughout: `initialWaLink` (`DonationCard.astro:85`) and every `conversation` href are built with `buildWaLink` at build time.

---

## Migration order

Steps 1-5 add only. Nothing on the live site reads the new collection until step 6, and nothing is deleted until step 9.

1. **Add the schema on both sides in one commit.** `aksi` in `content.config.ts`, the `aksiPintu()` factory plus six literal singleton keys and the nav group in `keystatic.config.ts`. Empty content directory. `bunx astro check` + `bun run build`; the site is unchanged.
2. **Spike the wire shape, before writing any reader.** Open `/keystatic`, save one throwaway aksi with each of the three mechanism kinds, read the JSON on disk, and correct the zod above to match what Keystatic actually wrote. Nothing reads the collection yet, so a mismatch here costs one edit. If `fields.conditional` turns out not to nest inside `fields.array` in `@keystatic/core@0.5.51`, fall back to a flat `kind` select plus all mechanism fields side by side in the same object — the admin form is uglier, zod still discriminates on `kind`, and `readAksi()` absorbs the difference so nothing downstream notices.
3. **Write `src/lib/aksi.ts` and `src/lib/ajakan.ts`.** `readAksi()` and `resolvePintuHref()` are pure and join `format.ts`/`impact.ts` in `bun test`. Dangling-`program` handling copies `getProgramSection()` in `home.ts` line for line: drop empty, drop unresolved, drop duplicates. Still unwired.
4. **Author the content by hand, side by side against `consts.ts`.** Eighteen items across six files, `title` and `desc` copied word for word — the copy-voice rule means this is a diff, never a scripted transform. Mechanisms: food's "Donasi paket" → `quantity` (program `jumat-berkah`, 25000, presets `[6,12,20]`); "Salurkan surplus" and "Jadi mitra dapur" → `conversation`; the other fifteen → `conversation`, each with a message drawn from its own description (most already say "kabari lewat WhatsApp", so the message is implied by the text the owner wrote).
5. **Author the three programme-scoped aksi that have no `contribute` ancestor**: Ramadhan Berbagi (`quantity` + the three package names), Community Giving and CSR Food Program (`conversation` with today's inquiry text). All three get `showOnPintu: false`, so `/berbagi-makanan/`'s numbered list stays at three items instead of jumping to six.
6. **Change `calcTotal`'s signature** and its unit test. Its only other caller is `DonationCard.astro`.
7. **Teach `DonationCard.astro` the `ajakan` prop** and branch on `mechanism.kind`; move the inquiry panel's markup in from the page. Swap `Hero.astro` first, build, look at it. Then swap `program/[program].astro` and delete `INQUIRY_PROGRAMS`, `RAMADHAN_PACKAGES`, `isInquiry`, `packages`, and `inquiryWaLink`. Build, then walk all four programme pages that have one: `jumat-berkah`, `ramadhan-berbagi`, `community-giving`, `csr-food-program`. This is a visual gate — hand over a dev server URL, do not report it as done.
8. **Repoint `PintuS1.astro`** onto the `aksi` prop and add the per-item CTA plus its scoped `.s1-step-cta` style. Build and walk all six pintu pages. Highest-regression step, and cheap to check because step 5 keeps every list at its current length.
9. **Delete.** `contribute` from the `CategoryContent` interface and from all six entries in `consts.ts`. Then `grep -rn "contribute\|PINTU_CONCEPT" src` and remove `examples` only if genuinely orphaned — `concept.what` stays, it feeds every pintu's opening paragraph.
10. **Rename, in its own commit**: `DonationCard.astro` → `Ajakan.astro`, `donation-card.js` → `ajakan.js`. Class names (`.dcard`) and data attributes (`data-donation-card`) stay, so the rename is purely file-level and the behaviour diff in step 7 stays readable.
11. **Docs**: an `aksi` bullet in `.claude/rules/content-model.md` next to `programs`/`organisasi`, and an amendment to the `CATEGORY_CONTENT` note in `.claude/rules/routing-taxonomy.md` since `contribute` no longer lives there.

---

## What was grafted, and from where

- **The pintu owns aksi** — from the `aksi-on-pintu` model. The winning model derived the pintu list from active programmes, which would have deleted the fifteen non-food entries the owner wrote for goods, time, space, money, and tree, since none of those pintu has a programme. Those entries are the ones a reader can act on this week, which `consts.ts:186-189` says was the point of writing them.
- **`kind: 'none'` as an honest name** — also from `aksi-on-pintu`. It makes the day-one migration a same-shape stamp rather than a reshape, and makes "no button" a typed case instead of a missing field.
- **The optional `program` relationship** — from `aksi-programme-relationship`. It is what lets one union serve both surfaces, and it is what makes `getAjakan` a lookup rather than a slug match.
- **The `readAksi()` adapter** — from the winning model. `fields.conditional`'s on-disk shape is the single most fragile thing in this design, and it stays inside one function.
- **Strictly-additive staging with mounts swapped one at a time** — from `aksi-as-keystatic-collection`, whose container was wrong but whose migration order was the most careful of the four.
- **Array-in-singleton over a new collection** — from the reviewer who checked `keystatic.config.ts:472` and found `fields.relationship` already living inside an array inside the `home` singleton, which falsified the collection model's central conventions claim.
- Two corrections are mine, from reading the repo: **literal singleton keys** (every candidate proposed `Object.fromEntries`, which `keystatic.config.ts:74-78` explicitly rules out), and **both `contribute.length === 0` branches already being unreachable**, which is what makes step 8 far safer than any of the four designs assumed.

## Deliberately left out

- **The fifteen `"porsi"` literals.** Instructed, and correct: there is no second unit to prove a threading against.
- **`mitraWa`.** It renders identically on every programme and is not slug-gated, so it is not a special case waiting to be absorbed. Folding it into content trades a working uniform link for a per-programme authoring obligation, and the first programme the owner forgets loses its partner CTA. It stays as one line in `program/[program].astro`.
- **The rest of `CATEGORY_CONTENT`** — `story`, `stats`, `howItWorks`, `forWhom`, `env`, `faq`, `ctaTitle`/`ctaText`. Only `contribute` claimed a mechanism it did not have. Migrating the other eight blocks is a real change worth doing later, and doing it inside this one would put the owner's long-form `story` prose at risk for no gain here.
- **`link` and `anchor` mechanism kinds.** Nothing today authors a URL, and the one derived destination comes from the relationship.
- **Many aksi per ajakan card.** Both mounts render one card with one mechanism; that is today's cardinality.
- **Share, map, PDF, mega-menu, social, and `program_click` links.** They are links, not ways to take part. Sweeping them into the aksi model would be the generality the owner ruled out.

## Still unknown, needs the owner

1. **Is Rp 25.000 a property of the ask, or of the site?** This design puts `pricePerUnit` on the mechanism, which lets Jumat Berkah and Ramadhan price differently. If the price is one number forever, it is one field in `settings` and the mechanism drops it — smaller, but then the mechanism no longer fully describes its own arithmetic. Recommendation: keep it on the mechanism.
2. **Do Ramadhan's three packages share one price?** `packages: string[]` assumes yes, and today they do, because `calcTotal` knows nothing about the selected package. If Sahur and Buka Puasa should cost differently, the field has to become `{ name, pricePerUnit }[]` — cheap to decide now, a schema migration later.
3. **Who writes the fifteen WhatsApp messages?** Each non-food aksi needs one. The migration can draft each from its own description, but the owner's words are used verbatim as a rule, so a derived first draft may not be acceptable even as a starting point.
4. **Should Community Giving gain a picker?** Unchanged from the earlier draft, and still the only genuinely product-shaped question here. Under this model the answer is one field change rather than a code change, which is the point.
5. **Should the CSR and community ways-in appear on `/berbagi-makanan/`?** Step 5 sets `showOnPintu: false` to hold the list at its current three items. Flipping them on lengthens it to six and surfaces two real ways to take part that the pintu page hides today.

Two technical unknowns, both gated by step 2 and neither able to break the live site if they turn out badly: the exact JSON `fields.conditional` writes, and whether it nests inside `fields.array` at all in `@keystatic/core@0.5.51`. The fallback for the second is named in step 2.