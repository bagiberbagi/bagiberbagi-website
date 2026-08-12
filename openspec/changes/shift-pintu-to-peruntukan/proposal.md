# Pintu stops describing what you hand over and starts describing what it changes

## Status

**Design only. No source file outside `openspec/` is touched by this change yet.** The owner has
decided the taxonomy and the URL shape (recorded under "Decisions already taken"); what remains
blocked is copy, iconography, and two scope questions listed in `tasks.md`.

Commissioned from a stakeholder document, `BGBG - Taksonomi Program` (Google Docs, 6 pages),
which argues for reclassifying programmes by *peruntukan* — what the giving is for — instead of
by *bentuk* — what the giver hands over. The owner's framing when scoping it: *"nama entitasnya
tetap aja pintu, gausah bidang. secara fungsi aja yg kita geser gpp. dan jadi many-to-many."*

So this is one taxonomy, keeping its name, changing its meaning and its cardinality.

## Why

### The current taxonomy has three doors nobody walks through

`PINTU_IDS` (`src/consts.ts:87`) is six values on the *bentuk* axis: `food`, `goods`, `time`,
`space`, `money`, `tree`. Counted against the nine programmes in `src/content/programs/`:

| pintu | programmes | of which `active: true` |
|---|---|---|
| `food` | 6 | **4** |
| `goods` | 2 | 0 |
| `money` | 1 | 0 |
| `time` | **0** | 0 |
| `space` | **0** | 0 |
| `tree` | **0** | 0 |

Half the taxonomy is empty, and every programme that is actually published sits in one pintu.
`/berbagi-pohon/` ships a colour identity, a hand-tuned `seoDescription`, and a live route with
nothing behind it. That is not a category; it is a shopfront.

### Four axes are wearing one field

The nine programmes do not differ along one dimension. They differ along four, and `pintu` is the
only field available to record any of them:

| Programme | peruntukan | bentuk | kondisi | kanal |
|---|---|---|---|---|
| Jumat Berkah | food | makanan | routine, weekly | individual |
| Berbagi Makanan Harian | food | makanan | routine, daily | individual |
| Berbagi Sembako | food | makanan | routine | individual |
| Ramadhan Berbagi | food | makanan | **seasonal** | individual |
| CSR Food Program | food | makanan | routine | **company** |
| Community Giving | food | makanan | routine | **community** |
| Berbagi Buku | education | barang | routine | individual |
| Berbagi Beasiswa | education | dana | routine | individual |
| Berbagi Bantuan Bencana | cross-cutting | barang | **emergency** | individual |

Rows one through six share a peruntukan *and* a bentuk. Ramadhan Berbagi, CSR Food Program, and
Community Giving differ from Jumat Berkah only in the last two columns. They became programmes
because programme was the only container on offer.

That is why `food` holds six entries while three pintu hold none: what is piled up there is not
six programmes but **one programme seen from six angles**.

### Three of the four axes already have homes

The remedy is mostly recognition, not construction:

| axis | where it belongs | status |
|---|---|---|
| peruntukan | `pintu` | rename the values |
| bentuk | the `aksi` collection — a list of ways to take part | **already exists** |
| kanal | the `organisasi` entity — institutional donors | **already exists** |
| kondisi | — | the only genuinely new field |

## What changes

**One.** `PINTU_IDS` becomes six peruntukan values: `food`, `education`, `health`,
`empowerment`, `humanitarian`, `environment`. `PINTU_LABEL` (`src/consts.ts:125`) stays
`'Pintu Berbagi'`; the umbrella is unchanged.

**Two.** A programme declares *several* pintu. `programs.pintu` becomes an array and gains
`programs.pintuUtama`, which owns the card, the breadcrumb, and — critically — the numbers.

**Three.** Routes move from flat `/berbagi-<slug>/` to nested `/peduli/<slug>/`, with a real hub
at `/peduli/`.

## Why many-to-many is the load-bearing part

Not the value swap. Every design that assumed one programme = one pintu produced empty doors, on
*either* axis. Letting a programme declare several dissolves that without moving a single
programme.

It also converts the sharpest objection to the source document into a non-issue. `Kemanusiaan &
Kebencanaan` is not a peruntukan — it answers "under what condition", and the document
contradicts itself on it, filing *Food Relief — respons kebutuhan pangan darurat* under Pangan
while filing *Bagiberbagi Bencana* under Kemanusiaan. Under one-to-one an editor must pick and
the numbers split. Under many-to-many the overlap is simply expressible:
`pintu: [food, humanitarian]`, `pintuUtama: humanitarian`. Nobody chooses.

That is why the pintu count is six and not five.

## Why `/peduli/` and not `/berbagi-`

The hyphen was the defect. `/berbagi-makanan/` reads correctly because "berbagi makanan" is a
real phrase — you do hand over food. `/berbagi-pangan/` forces two words that do not pair into
one, and `/berbagi-kesehatan/` is worse. A slash reads as hierarchy rather than as a phrase, so
the problem disappears at the same time as the axis changes.

`/peduli/` over `/berbagi/` is the owner's call, taken on tone and on search phrasing. It is
worth recording what it costs: **the URL word appears nowhere in the interface.** A visitor sees
"Pintu Berbagi" in the navigation and lands on `/peduli/pangan/`. This is deliberate, not a
mistake to be tidied away later, and `routing-taxonomy.md` must say so — otherwise the next
reader "fixes" it.

Verified against seven Indonesian platforms: none use a verb namespace at all. Rumah Zakat and
BAZNAS use `/program/<slug>/`, BenihBaik and Dompet Dhuafa use `/category/<slug>/`, Kitabisa uses
`/campaign/<slug>/` for campaigns rather than categories. `/program/` is unavailable here — it
already belongs to programme detail (`src/pages/program/[program].astro`). Worth knowing when
writing for funders: what Rumah Zakat calls a *program* is what this site calls a *pintu*, and
what this site calls a *program* they nest one level deeper. The vocabulary is internally
consistent but inverted relative to the sector.

Search phrasing does not favour any single namespace either — *bantuan pangan* wins for food,
*peduli lingkungan* for environment, *donasi pendidikan* and *donasi kesehatan* for the other
two. No prefix wins across all six, which is the argument for a neutral path and per-pintu
phrasing carried in `title`/`h1` instead.

## What this is not

- **Not a second taxonomy.** An earlier draft proposed `pintu` (bentuk) alongside `bidang`
  (peruntukan). The owner rejected it: one entity, one axis, shifted meaning.
- **Not the demotion of Ramadhan Berbagi, CSR Food Program, and Community Giving.** They are
  seasons and channels rather than programmes, and they should stop being programmes — but doing
  it here would make this change unreviewable. They stay as programmes under `food`; the
  demotion is a follow-up that the `mode`/`season`/`channel` fields introduced here make possible.
- **Not a reporting surface.** No `/bidang/`-style pages, no annual-report view. Those are what
  the taxonomy is *for*, and they come after it exists.
- **Not a copy rewrite of the whole site.** Six taglines, six blurbs, six `seoDescription`s, and
  three new `aksi` lists are in scope. Nothing else.

## Decisions already taken

Recorded so they are not relitigated:

| Decision | Choice |
|---|---|
| Entity name | `pintu` — no `bidang`, no second taxonomy |
| Umbrella label | `'Pintu Berbagi'`, unchanged |
| Axis | peruntukan |
| Cardinality | many-to-many, with `pintuUtama` |
| Pintu count | **six** — Kemanusiaan included, per the source document |
| Economic pintu name | **Pemberdayaan** — not "UMKM", which is a beneficiary segment rather than a purpose |
| URL namespace | `/peduli/<slug>/` |
| Language split | English ids and field names, Indonesian slugs and labels — the rule already written at `src/consts.ts:92` |

## What this costs

**Three pintu publish empty.** After mapping, `food` holds four active programmes and
`empowerment` one (Jumat Berkah, on the strength of the UMKM kitchens and field agents already
documented in `IMPACTS`, `src/consts.ts`). `education`, `health`, `humanitarian`, and
`environment` publish with no active programme. Many-to-many narrows this from five doors to
four; it does not close it.

The honest instrument for that is the **promotion rule** in `design.md`: a pintu marked *sedang
disiapkan* becomes full only on three real jejak, one standing PIC, and one clickable way to take
part. The label is then accurate rather than embarrassing.

**Twelve of twenty-one `aksi` items lose their pintu**, because on a peruntukan axis they never
belonged to one. They are ways of giving, not purposes. `design.md` rehouses every one; none is
deleted.

**Six live URLs change and none survives.** All six get real 301s through
`deploy/nginx/bagiberbagi.id.conf` rather than the noindex meta-refresh stub a static Astro build
emits for `redirects` — a distinction that matters when the whole taxonomy moves at once.

## What protects the change

The codebase was built for this. `routing-taxonomy.md` states it plainly: *"`PINTU_IDS` is the
single source of the pintu taxonomy"*, and `PintuId`, the zod enum, and the Keystatic select
options all derive from it. Two consumers are **total** records over `PintuId` — `AKSI_KEYS`
(`keystatic.config.ts:202`, `satisfies Record<PintuId, string>`) and `META`
(`VisionSection.astro:29`) — so the build fails until every key is updated rather than silently
rendering an empty page.

One consumer escapes that net and must be checked by hand: **`CATEGORY_CONTENT` is
`Partial<Record<PintuId, CategoryContent>>`** (`src/consts.ts`), so a stale or missing key raises
nothing at all. It simply renders nothing.

Deep links already degrade gracefully: `jejak/index.astro:537` applies `?berbagi=<slug>` only
*"bila chip-nya ada"*, so shared links carrying retired slugs show the full feed instead of an
empty one.
