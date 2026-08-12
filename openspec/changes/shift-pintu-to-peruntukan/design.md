# Design

## The model in one table

| axis | question it answers | where it lives |
|---|---|---|
| **peruntukan** | what changes for the recipient | `pintu` — this change |
| **bentuk** | what leaves the giver's hand | `aksi` items + `mechanism.discriminant` |
| **kondisi** | is this an emergency right now | new field `mode` |
| **musim** | is this bound to a season | new field `season` |
| **kanal** | who is funding it | `organisasi` + new field `channel` |

Only `pintu` owns URLs and navigation. The rest are attributes.

## The six pintu

| id | slug | label | scope |
|---|---|---|---|
| `food` | `pangan` | Pangan | food security and nutrition as *what is on the plate* |
| `education` | `pendidikan` | Pendidikan | access to learning and the chance to keep learning |
| `health` | `kesehatan` | Kesehatan | access to care, examination, medicines, health equipment |
| `empowerment` | `pemberdayaan` | Pemberdayaan | earning capacity — micro-business, tools, capital, skills |
| `humanitarian` | `kemanusiaan` | Kemanusiaan | emergency response, relief, and recovery |
| `environment` | `lingkungan` | Lingkungan | a healthier, more durable environment |

`PINTU_LABEL` stays `'Pintu Berbagi'`. Individual labels are bare nouns, so a breadcrumb reads
**Pintu Berbagi › Pangan › Jumat Berkah** — the umbrella carries the verb, the doors do not.

### Which language goes where

The repo already states the rule, at `src/consts.ts:92`: *"Slug URL berbahasa Indonesia untuk rute
/berbagi/[slug] (id internal tetap Inggris karena dipakai taksonomi program). Jaga URL konsisten
satu bahasa."* Every field name in `content.config.ts` follows it — `label`, `order`, `active`,
`metrics`, `published`, `discriminant` — and the only Indonesian ones, `pintu` and `organisasi`,
name entities rather than attributes.

So: **ids and field names in English, slugs and labels in Indonesian.** An earlier draft of this
design broke that on both counts, with Indonesian ids and the attribute names `kondisi`, `musim`,
`kanal`. They are now `mode`, `season`, and `channel`, and the ids are English. Nothing
user-facing changes either way — the visitor sees "Pangan" and `/peduli/pangan/` regardless.

**Keeping `food` as the id for Pangan is worth more than it looks.** It is not a compromise:
*food* in English covers food security as readily as it covers a meal, and `english` becomes
`'Food Security'`. What it buys is that the busiest pintu migrates almost without touching
content — `src/content/aksi/food.json` keeps its filename, `AKSI_KEYS.food` keeps its key, the six
programme YAMLs keep `pintu: food` as their value, and the flagship lookup
`getProgramsByPintu('food')` in `Header.astro:41` keeps working. One of six ids survives, and it
happens to be the one holding every published programme.

### One boundary that must be written down now

**Nutrition sits on the Pangan/Kesehatan line** and the source document is inconsistent about it,
filing *Makan Bergizi* under Pangan and *Gizi untuk Tumbuh* under Kesehatan. The rule:

> Nutrition as **what is on the plate** is Pangan. Nutrition as **examination, measurement, or
> medical intervention** is Kesehatan.

### Kemanusiaan and `mode` are not the same thing, and must not collapse

Six pintu were chosen over five, which means the site carries both a Kemanusiaan pintu *and* a
`mode` field. They are only redundant if their roles are left vague:

- **`pintu: kemanusiaan`** is a classification. Permanent, open year-round, covering preparedness
  and post-disaster recovery as much as active response.
- **`mode: routine | emergency`** is a temporal state. It switches the siaga banner on, raises the
  item on the homepage, and lapses when the response period ends.

A flood response is `pintu: [humanitarian, food]`, `pintuUtama: humanitarian`, `mode: emergency`
while it runs and `mode: routine` afterwards, without reclassification.

## Cardinality, and the trap inside it

```
pintu:       PintuId[]   // every pintu this programme serves
pintuUtama:  PintuId     // owns the card, the breadcrumb, and the numbers
```

**`pintuUtama` exists because of double counting.** If Jumat Berkah declares
`[food, empowerment]` and one jejak records 500 porsi, and both pintu claim those 500, then
"dampak di 6 area" sums to more than reality — and that claim is the whole reason the taxonomy is
moving. Credibility lost there is not recoverable.

So: **`getPintuImpact` filters on `pintuUtama`, never on array membership.** Every number has
exactly one home; every programme may appear in several windows.

The Pemberdayaan page still shows Jumat Berkah — carrying its own metrics (partner kitchens,
order value reaching those kitchens) rather than the portions, which belong to Pangan.

## Programme mapping

| Programme | `pintu[]` | `pintuUtama` | active |
|---|---|---|---|
| jumat-berkah | `[food, empowerment]` | food | ✅ |
| ramadhan-berbagi | `[food]` | food | ✅ |
| community-giving | `[food]` | food | ✅ |
| csr-food-program | `[food]` | food | ✅ |
| berbagi-makanan-harian | `[food]` | food | — |
| berbagi-sembako | `[food]` | food | — |
| berbagi-buku-alat-sekolah | `[education]` | education | — |
| berbagi-beasiswa | `[education]` | education | — |
| berbagi-bantuan-bencana | `[humanitarian, food]` | humanitarian | — |

Jumat Berkah reaches Pemberdayaan on evidence already in the repo, not on ambition: `IMPACTS`
(`src/consts.ts`) documents UMKM kitchens receiving standing weekly orders paid on time, and
neighbourhood field agents earning regular income. That has run for 52 weeks; it has simply never
had a name.

**Empty on launch day: `education`, `health`, `humanitarian`, `environment`** — four of six.
Many-to-many narrows this from five; it does not close it. See the promotion rule.

## Rehousing the 21 aksi

Seven move cleanly, because they were already about a purpose:

| item | destination |
|---|---|
| Donasi paket · Salurkan surplus · Ramadhan Berbagi | `food` |
| Jadi mitra dapur | `empowerment` |
| Tunjuk titik yang panas · Tawarkan lahan atau bibit · Rawat pohon yang sudah ada | `environment` |

Fourteen leave the pintu layer. They are not orphans — on a peruntukan axis they never belonged
to a single purpose, and they looked pintu-specific only because the axis used to be bentuk:

| items | destination |
|---|---|
| Community Giving · CSR Food Program · Bawa anggaran CSR kantormu | `organisasi` / kemitraan |
| Kirim daftar keahlianmu · Ikut satu penyaluran dulu · Ajak satu orang bergantian | site-level **Relawan** |
| Daftarkan ruang atau kendaraanmu · Pinjamkan langsung ke sekitarmu · Kenalkan kami ke pengelolanya | site-level **Logistik** |
| Daftar minat zakat atau sedekahmu | site-level **Donasi** |
| Periksa dulu catatan penyalurannya | `/transparansi` — a trust step, not a way to give |
| Pilah isi lemari · Kabari barang yang ada · Bantu susun standarnya | rewritten per pintu; too generic to move verbatim |

**`education`, `health`, and `humanitarian` therefore launch with zero aksi.** A pintu page
with no "cara ikut" is a door with no handle, so three new lists must be written before release,
not after.

This forces one structural change: `AKSI_KEYS` is `satisfies Record<PintuId, string>`
(`keystatic.config.ts:202`), so every aksi file must belong to a pintu today. A site-level bucket
has to be expressible alongside the per-pintu ones.

## Routing

```
/peduli/                    hub — six doors and their status
/peduli/pangan/
/peduli/pendidikan/
/peduli/kesehatan/
/peduli/pemberdayaan/
/peduli/kemanusiaan/
/peduli/lingkungan/
```

`src/pages/berbagi-[pintu].astro` → `src/pages/peduli/[pintu].astro`, plus a new
`src/pages/peduli/index.astro`. `getStaticPaths` keeps its shape — still `PINTU.map(...)`.

**The hub is new and earns its place twice.** `routing-taxonomy.md` records that pintu is *"a
category/filter, not a page-owning entity"* and that no `/berbagi/` hub exists. That was correct
while pintu was a filter beside programme; pintu now carries the primary navigation, so the
premise has expired. It also removes a documented workaround: programme pages must currently
declare `breadcrumbTrail` by hand because a derived crumb would name `/program/`, a page that
does not really exist. `/peduli/` does exist, so `/peduli/pangan/` can derive its own crumb.

### Redirects

| from | to |
|---|---|
| `/berbagi-makanan/` | `/peduli/pangan/` |
| `/berbagi-pohon/` | `/peduli/lingkungan/` |
| `/berbagi-barang/` | `/peduli/` |
| `/berbagi-dana/` | `/peduli/` |
| `/berbagi-waktu/` | `/peduli/` |
| `/berbagi-ruang/` | `/peduli/` |

Four have no single successor and go to the hub. Sending `/berbagi-dana/` to Pendidikan merely
because the scholarship moved there would mislead someone arriving to route zakat.

These SHALL be real 301s in `deploy/nginx/bagiberbagi.id.conf`. Astro's `redirects` ships as a
noindex meta-refresh stub on a static build — adequate for one renamed jejak, not for an entire
taxonomy moving at once.

### The URL word is not in the interface, on purpose

Navigation says "Pintu Berbagi"; the path says `peduli`. This is a deliberate trade, taken
because no single Indonesian prefix reads naturally across all six purposes, so the natural
phrase moves into each page's `title`/`h1` instead:

| pintu | title / h1 |
|---|---|
| Pangan | Bantuan Pangan |
| Pendidikan | Donasi Pendidikan |
| Kesehatan | Donasi Kesehatan |
| Pemberdayaan | Pemberdayaan Ekonomi & UMKM |
| Kemanusiaan | Bantuan Kemanusiaan & Bencana |
| Lingkungan | Peduli Lingkungan |

`routing-taxonomy.md` must state this, or it reads as an inconsistency someone will helpfully
repair.

### Query parameter

`?berbagi=<slug>` on `/jejak/` becomes `?peduli=<slug>`. Old links do not break:
`jejak/index.astro:537` applies the filter only when a matching chip exists, so a retired slug
yields the full feed rather than an empty one.

## Rules the editors need

**Tie-break, one sentence:**

> A pintu is decided by what the programme *changes for the recipient*, not by what the giver
> hands over, not by who funds it, not by when it happens. If it genuinely changes two things,
> declare both and pick the larger as `pintuUtama`.

**Promotion rule** — the only falsifiable gate in the design, and what makes *sedang disiapkan*
an honest label instead of an apology:

> A pintu marked *sedang disiapkan* becomes full only when it has **three real jejak entries, one
> standing PIC, and one clickable way to take part.** The rule runs backwards too, as the
> instrument for retiring a pintu.

## What the compiler catches, and the one gap

Two consumers are total records over `PintuId` and will fail the build until every key is
updated:

- `AKSI_KEYS` — `keystatic.config.ts:202`, `satisfies Record<PintuId, string>`
- `META` — `VisionSection.astro:29`, `Record<PintuId, {name, desc}>`

Manual, because the compiler will not help:

- **`CATEGORY_CONTENT`** — `Partial<Record<PintuId, CategoryContent>>` in `src/consts.ts`. A
  missing key raises nothing and renders nothing. This is the one silent failure mode.
- `ORDER` — `VisionSection.astro:40`, a hand-written display order
- `getProgramsByPintu('food')` — `Header.astro:41`, the hard-coded flagship lookup
- `Icon.astro` — four new icons needed (kesehatan, pendidikan, pemberdayaan, kemanusiaan)
- Manual open-graph entries for the six pintu pages in `open-graph/[...route].ts`; a stale slug
  loses the share image without failing the build

## Known drift to fix in passing

`design-system/spec.md:9` describes *"the 5-door pintu identity colors"* and a route at
`src/pages/berbagi/[category].astro`. The code has six pintu at `src/pages/berbagi-[pintu].astro`.
The spec drifted before this change; the delta corrects both.
