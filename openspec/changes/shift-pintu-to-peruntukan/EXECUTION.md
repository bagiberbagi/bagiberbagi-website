# Execution plan, first milestone to last

Ordered, gated, and written to be run without stopping for approval. `proposal.md` says why,
`design.md` says what the model is, `tasks.md` groups the work by area. **This file is the order
it happens in and the test that decides whether each step is done.**

## Ground rules

**Every milestone is a branch, stacked on the previous one.** They merge in order, so the safe
parts can land while the risky part is still being reviewed.

```
main
 └── feat/pintu-m1-schema
      └── feat/pintu-m2-many-to-many
           └── feat/pintu-m3-peruntukan
                └── feat/pintu-m4-cleanup
```

**Three gates, identical to CI** (`.github/workflows/deploy.yml`), run at the end of every
milestone. Nothing is committed until all three pass:

| gate | command | baseline |
|---|---|---|
| unit | `bun test` | 70 pass, 0 fail |
| types | `bun x --bun astro check` | 0 errors, 0 warnings |
| build | `bun --bun run build` | 62 pages, 410 files |

`--bun` is a local necessity, not a repo change: this machine has Node 18 and Astro 7 requires
≥ 22.12. CI runs on a newer Node and needs no flag. **`package.json` must not be edited for this.**

**What cannot be done here, and why it is not a pending decision.** Production cutover needs VPS
access this environment does not have, and the nginx redirects never travel through CI anyway —
`deploy/**` sits in the workflow's `paths-ignore`. So the work stops at a merge-ready branch with
all gates green. The nginx file is written and staged in the repo; applying it is a shell command
on the server.

---

## M1 — additive schema

**Goal: the build output does not change at all.** That is the whole test.

`src/content.config.ts`
- `pintu` accepts a single value *or* a list, so entries written under either shape validate
- add `pintuUtama` (optional), `mode: routine | emergency`, `season`, `channel`
- the permissive-schema/strict-reader rule already documented above the `aksi` block applies here
  too: anything Keystatic can leave empty is nullish here and resolved in the reader

`src/lib/programs.ts`
- `Program.pintu` becomes `PintuId[]`; `Program.pintuUtama` is added
- normalisation happens once, in `getPrograms`: a scalar becomes a one-element list, and
  `pintuUtama` falls back to the first entry when unset
- `getProgramsByPintu` moves from `===` to membership — identical behaviour while every list has
  one element

**Seven readers move from `pintu` to `pintuUtama`**, because each wants *the* pintu, not a set:

| file | line |
|---|---|
| `src/lib/impact.ts` | 50 |
| `src/lib/jejak.ts` | 307 |
| `src/pages/jejak/index.astro` | 43 |
| `src/pages/jejak/[slug].astro` | 41 |
| `src/pages/organisasi/[slug].astro` | 64 |
| `src/pages/program/[program].astro` | 47, 64, 74 |
| `src/components/_parked/JejakTerbaru.astro` | 17 |

The parked component is included because `astro check` type-checks it regardless of whether it
renders.

**Gate:** three green, **plus `dist/` byte-identical to the baseline** — 410 files hashing to
`c5947784ad785d10d8f7b9a318c66f84`. A single changed byte means M1 leaked something visible.

---

## M2 — many-to-many goes live

First milestone a visitor can see, and the first that is worth shipping on its own.

`keystatic.config.ts`
- the programme `pintu` field becomes a multiselect; a second select sets `pintuUtama`
- `pintuUtama` options are constrained to what `pintu` holds where the CMS allows it; where it
  does not, the reader warns rather than the build failing — same discipline as `readAksi`

`src/lib/impact.ts`
- `getPintuImpact` counts through `pintuUtama` only. With several pintu per programme, membership
  would count one jejak's metrics once per pintu, and the inflated total would land straight in the
  claim the taxonomy exists to make

Content — the visible part:
- `jumat-berkah` declares `[food, time]`, `pintuUtama: food`

**This was drafted as `[food, money, time, space]` and cut down after checking the site's own
copy, which contradicts two of them:**

| pintu | the site's existing words | verdict |
|---|---|---|
| `time` | *"Penyaluran makanan **sudah berjalan** dan kamu boleh ikut membantu di situ"* | names this programme — claim it |
| `money` | *"Selama pintu ini **masih kami siapkan**"* | the door says it is not open; an active programme there would contradict the page |
| `space` | *"kami simpan sebagai **calon** titik kegiatan"* | prospective, not in use |

So one door fills, not three. The rule this follows is the one written into `COPY.md` for the
empty pintu: a page may not claim a capability the operation does not have. Declaring `money`
would have looked better on the milestone and made the money page argue with itself.

Adding `money` later is a content edit once zakat routing actually opens — no code changes.

**Gate:** three green. `dist/` now differs on purpose — the diff must touch only the pintu pages
that gained programmes, the mega-menu, and the homepage map.

---

## M3 — peruntukan values and `/peduli/` routes

The only milestone that changes what things are called.

**Ids in English, slugs and labels in Indonesian** — the rule at `src/consts.ts:92`. `food`
survives as an id, which is why the busiest pintu barely moves.

| id | slug | label |
|---|---|---|
| `food` | `pangan` | Pangan |
| `education` | `pendidikan` | Pendidikan |
| `health` | `kesehatan` | Kesehatan |
| `empowerment` | `pemberdayaan` | Pemberdayaan |
| `humanitarian` | `kemanusiaan` | Kemanusiaan |
| `environment` | `lingkungan` | Lingkungan |

Order of work, because later steps fail loudly until earlier ones land:

1. `src/consts.ts` — `PINTU_IDS`, the `PINTU` array (labels, slugs, colours, icons, taglines,
   blurbs, `seoDescription` from `COPY.md`), and `CATEGORY_CONTENT` re-keyed by hand. That last one
   is `Partial<Record<…>>`, so it is the single place a missed key fails silently.
2. `src/components/Icon.astro` — two new icons, `book` and `shield`. Four are reused.
3. `src/components/VisionSection.astro` — `META` and `ORDER`.
4. `src/components/Header.astro:41` — the flagship lookup, unchanged in value since `food` survives.
5. Routes — `src/pages/berbagi-[pintu].astro` → `src/pages/peduli/[pintu].astro`, plus a new
   `src/pages/peduli/index.astro` hub carrying each pintu's status.
6. `astro.config.mjs` — six redirects. These ship with CI and are the only part of the URL move
   `bun run preview` can exercise.
7. `deploy/nginx/bagiberbagi.id.conf` — the same six as real 301s, staged for a human to apply.
8. `src/pages/jejak/index.astro` — `?berbagi=` becomes `?peduli=`; the existing "only if a chip
   matches" guard already keeps old links alive.
9. `src/pages/open-graph/[...route].ts` — six manual entries re-slugged, or share images vanish
   without failing the build.
10. Content, scripted rather than hand-edited (`scripts/migrate-pintu.mjs`), so it can be re-run
    against a newer `main` if an editor commits in the meantime. **It must fail loudly on any
    programme whose pintu value is not in its table** — a new programme halts the script instead of
    being silently misfiled.
11. `berbagi-makanan-harian` merges into `berbagi-sembako`; anything the former says that the
    latter does not is carried over before it is archived.
12. Aksi — `food.json` keeps its name and key; five are renamed; seven items transfer; fourteen
    are relocated per `design.md`; three new lists come from `COPY.md`.
13. `src/lib/aksi.test.ts` — hard-codes `'food'` and `'goods'` throughout.

**Gate:** three green, plus by hand over `bun run preview`: each of the six new pages renders, the
hub lists six with honest statuses, all six old URLs land somewhere real, and `?peduli=` filters
while a stale `?berbagi=` still shows the full feed.

---

## M4 — cleanup and the two site-level surfaces

Everything that was deliberately deferred so the earlier milestones stayed reviewable.

- drop the scalar half of the `pintu` union — every entry is a list by now, and leaving the shim
  invites new content written in the retired shape
- remove `Ramadhan Berbagi`, `Community Giving`, and `CSR Food Program` from `aksi/food.json`:
  programme names with empty descriptions, links wearing an aksi's clothes
- **Relawan** and **Logistik** pages, holding the six items the retired `time` and `space` files
  carried, linked from each pintu's "cara ikut" and from the hub — **not** from `NAV_LINKS`, whose
  four-item trust path is a documented decision
- `.claude/rules/routing-taxonomy.md` — the axis change, the hub and why the earlier no-hub
  decision expired, and why the URL word is absent from the interface. Without that last note the
  mismatch reads as a bug someone will helpfully repair
- `.claude/rules/content-model.md` — `pintu[]` / `pintuUtama`, and that metrics follow `pintuUtama`
  alone

**Gate:** three green, and no reference to a retired pintu id anywhere in `src/`.

---

## Decisions taken during execution rather than asked about

Recorded because the owner asked to be handed finished work rather than questions. Each is
reversible and each is written down where it takes effect.

| decision | choice | recorded in |
|---|---|---|
| Colours | all six existing trios reused, none invented | `COPY.md` |
| Icons | two new, four reused — the earlier estimate of four new was wrong | `COPY.md` |
| Copy | drafted; the four pintu with no programme describe intent and claim no history | `COPY.md` |
| Aksi for the three empty pintu | interest-registration only, in the register the repo already uses for doors being prepared | `COPY.md` |
| Programme merge | `berbagi-sembako` survives and absorbs | `tasks.md` |
| `jumat-berkah` reach | `[food, money, time, space]` in M2, `[food, empowerment]` after M3 | this file |
| Relawan / Logistik | pages, linked contextually, absent from the navigation | `tasks.md` |
