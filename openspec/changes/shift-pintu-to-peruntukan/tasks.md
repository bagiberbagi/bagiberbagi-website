# Tasks

**Nothing here is started.** All five blocking questions were answered by the owner on
12 August 2026, so no track is blocked on a decision any more — only on execution.

## Owner decisions

- [x] **Q1. `berbagi-makanan-harian` merges into `berbagi-sembako`.** Nine programmes become
  eight. Track C migrates eight entries and archives one; anything the merged entry says that
  `berbagi-sembako` does not already say has to be carried across before it is removed.
- [x] **Q2. There is nothing real yet for Pendidikan, Kesehatan, and Kemanusiaan.** The owner's
  words: *"program untuk masing2 pintu berbagi itu masih kosong."* So the aksi for those three
  cannot reference a programme and cannot promise delivery. The only honest kind is
  interest-registration — which the repo already has a precedent for, in the `goods`, `money`, and
  `space` copy that says things like *"selama pintu ini masih kami siapkan"*. Drafts in `COPY.md`.
- [x] **Q3. Relawan and Logistik get pages, no navigation entry.** This preserves the documented
  four-item `NAV_LINKS` trust path. It carries one risk that Track B must close: four retired URLs
  redirect to `/peduli/` while their content sits on two pages nothing links to. They are to be
  linked from where the intent arises — each pintu's "cara ikut" section and the hub — not from
  global navigation.
- [x] **Q4. Colours adapt from the existing six trios; nothing new is introduced.** Full mapping
  in `COPY.md`. The tuned two-greens pairing that ships today is reproduced exactly.
- [x] **Q5. Claude drafts the copy.** Six taglines, blurbs, `title`/`h1`, and `seoDescription`s in
  `COPY.md`, all within the 70–160 character discipline, to be edited rather than approved as-is.
  `CATEGORY_CONTENT.food` is deliberately not rewritten — it is real prose needing an editing pass
  from the owner, not a drafting job.

**A diction fix falls out of Q2 and belongs in this change.** The owner asked why both *Program*
and *Aksi* exist. They are distinct — a programme is what Bagiberbagi runs, an aksi is what a
visitor does, and aksi is what lets a pintu be usable before a programme exists behind it. But
three entries in `src/content/aksi/food.json` break that rule today: `Ramadhan Berbagi`,
`Community Giving`, and `CSR Food Program` carry a programme's name with an **empty description**,
so they are links wearing an aksi's clothes. The rule to apply: *if an aksi's title is a noun
naming a programme, it is not an aksi.* The three offenders are exactly the three entries already
identified as a season and two channels.

## Milestones

The site is live, so the shape of the work matters as much as its content. The principle:
**absorb the structural risk into `main` additively, and leave only the rename for a branch.**

Two facts make this cheap, both verified:

- **`jejak` carries no `pintu` field.** Its schema holds `program: z.string()`, and `impact.ts`
  derives the pintu through `pintuBySlug` off the programme collection. The highest-volume content
  on the site — weekly documentation — is therefore untouched by this change from beginning to
  end, and never has to pause.
- **Deploy fires only on `push` to `main`.** Branch work cannot reach production by accident.

| | Contents | Visible | Lives on |
|---|---|---|---|
| **M1** | `pintuUtama` optional; `pintu` accepts scalar *or* array, normalised in `lib/programs.ts`; `mode`/`season`/`channel` added unused | no | `main` |
| **M2** | Many-to-many goes live: readers use array membership, `getPintuImpact` filters `pintuUtama`, Keystatic multiselect | **yes** | `main` |
| **M3** | New values, `/peduli/` routes, copy, icons, colours, aksi re-key | yes | short branch |
| **M4** | Drop the compatibility shim, retire the three name-only aksi, Relawan & Logistik pages | yes | `main` |

**M2 stands on its own.** Once Jumat Berkah can declare several pintu, the doors that are empty
today fill immediately — with no URL change and no copy rewritten. If M3 is deferred indefinitely,
the site is still better than it is now. That is the point of ordering it this way.

**Only M3 needs a branch**, and by then M1 has already absorbed the schema risk, so what remains
is values, routes, and text: fewer moving parts, and deterministic enough to script.

### What may still land while M3 is in flight

| | M1 | M2 | M3 (branch) | M4 |
|---|---|---|---|---|
| New jejak, edits to jejak | free | free | **free** | free |
| New organisasi | free | free | free | free |
| New programme | free | free | allowed, must be registered in the script's map | free |
| Aksi edits | free | free | hold | free |

Only two directories are constrained, and only during M3. The migration script SHALL **fail loudly**
on any programme whose pintu value is absent from its mapping table, so a programme added to `main`
mid-flight halts the script rather than being silently misfiled.

### Redirects go in two places, and the cheap one goes first

`astro.config.mjs` already carries redirects for renamed jejak slugs. The six pintu redirects go
there **as well as** into nginx:

- shipped by CI, so there is no window where the old URLs 404 — which the nginx-only plan had,
  since `deploy/**` is in the workflow's `paths-ignore` and never deploys
- testable under `bun run build && bun run preview`, which is the whole verification budget
- nginx upgrades them to real 301s afterwards at any time, with no deadline; nginx matches before
  the static file is reached, so the upgrade is seamless

On a static build Astro emits these as noindex meta-refresh stubs rather than HTTP 30x. Weaker for
search than a 301 — which is exactly why nginx still gets them — but correct for readers from the
moment the deploy lands.

### Cutover and rollback

1. Copy the webroot before merging: `cp -a /var/www/html/bagiberbagi /var/www/html/bagiberbagi.bak-<date>`. The deploy runs `rsync --delete`.
2. Stage the nginx config on the VPS without reloading.
3. Merge M3 → deploy runs → the Astro stubs already keep old URLs alive.
4. `nginx -t && nginx -s reload` to upgrade them to 301s.

Rollback is restoring the webroot copy and reverting the nginx file — neither waits on CI.

## Track A — taxonomy core

- [ ] Replace `PINTU_IDS` (`src/consts.ts:87`) with the six peruntukan ids; rewrite the `PINTU`
  array entries. `PINTU_LABEL` (`:125`) unchanged.
- [ ] `programs.pintu` → array; add `programs.pintuUtama` (`src/content.config.ts:174`). Update the
  comment above it — it currently states "Impact bukan pintu (lapisan hasil)", which this change
  partly retires.
- [ ] Add `mode: routine | emergency`, `season`, `channel` to the programme schema.
- [ ] `getProgramsByPintu` moves from equality to array membership.
- [ ] `src/lib/impact.ts:50` — `pintuBySlug` currently maps a programme slug to its single `pintu`.
  It SHALL map to **`pintuUtama`**, or every metric belonging to a programme serving several pintu
  is counted once per pintu. This one line is what keeps "dampak di 6 area" from inflating; see the
  double-counting note in `design.md`.
- [ ] Keystatic: `fields.select` → multiselect plus a select for `pintuUtama`
  (`keystatic.config.ts:727`).
- [ ] Unit tests for `readAksi` / `resolvePintuHref` (`src/lib/aksi.test.ts`) — they hard-code
  `'food'` and `'goods'` throughout.

## Track B — routing

- [ ] `src/pages/berbagi-[pintu].astro` → `src/pages/peduli/[pintu].astro`.
- [ ] New `src/pages/peduli/index.astro` hub, carrying each pintu's status.
- [ ] Six redirects in `astro.config.mjs` first — they ship with CI, close the 404 window, and are
  the only part of the URL move that `bun run preview` can verify.
- [ ] The same six as real 301s in `deploy/nginx/bagiberbagi.id.conf`, applied by hand on the VPS.
  `deploy/**` sits in the workflow's `paths-ignore`, so CI will never deliver this file — a merge
  alone does not publish the redirects.
- [ ] `?berbagi=` → `?peduli=` on `/jejak/` (`src/pages/jejak/index.astro:537`).
- [ ] Six manual open-graph entries in `open-graph/[...route].ts` re-slugged. A stale slug loses
  the share image silently.
- [ ] Programme pages can now derive `breadcrumbTrail` from the URL; check whether the hand-written
  trail can be dropped.
- [ ] Relawan and Logistik pages, linked from each pintu's "cara ikut" section and from the hub —
  **not** from `NAV_LINKS`. Without these links the four redirected URLs land on a hub that leads
  nowhere useful, and six written aksi items become unreachable.

## Track C — content migration

- [ ] Merge `berbagi-makanan-harian` into `berbagi-sembako`, carrying across anything the former
  says that the latter does not, then archive it. Nine programmes become eight.
- [ ] Eight programme YAML files: scalar `pintu:` → `pintu: []` + `pintuUtama:`, per the mapping
  table in `design.md`. Six of the eight keep `food` as their value, since the id survives the
  axis change — only `berbagi-buku-alat-sekolah`, `berbagi-beasiswa`, and
  `berbagi-bantuan-bencana` take new ids.
- [ ] Rename five of the six `src/content/aksi/*.json` files to the new ids; `food.json` keeps its
  name and its key. Move the seven items that transfer cleanly.
- [ ] Three new aksi lists (pendidikan, kesehatan, kemanusiaan), all interest-registration only —
  drafts in `COPY.md`. None may reference a programme or promise delivery, because none exists.
- [ ] Strip the three name-only aksi (`Ramadhan Berbagi`, `Community Giving`, `CSR Food Program`)
  — empty descriptions, programme names, no action described. See the diction note above.
- [ ] Relocate fourteen items: three to `organisasi`/kemitraan, six to Relawan and Logistik, one
  to `/transparansi`, one to a donation surface, three rewritten per pintu.
- [ ] Loosen `AKSI_KEYS` (`keystatic.config.ts:202`) so a site-level bucket can exist beside the
  per-pintu singletons.

## Track D — copy and assets

- [ ] Six taglines, blurbs, `seoDescription`s — drafted in `COPY.md`, owner to edit.
- [ ] Per-pintu `title`/`h1` using the natural phrase for each field — drafted in `COPY.md`; this
  is where the SEO lost by a neutral URL namespace is recovered.
- [ ] **Two** new icons in `Icon.astro`: `book` for Pendidikan, and a shield or cupped hands for
  Kemanusiaan. Pangan, Kesehatan, Pemberdayaan, and Lingkungan reuse `food`, `heart`, `money`,
  and `tree`. The earlier estimate of four was too pessimistic.
- [ ] Six colour trios — mapped in `COPY.md`, all inherited from the existing palette.
- [ ] `CATEGORY_CONTENT` (`src/consts.ts`) re-keyed **by hand** — it is `Partial<Record<…>>`, so a
  missed key fails silently rather than at build time. This is the one item with no compiler
  backstop.
- [ ] `ORDER` (`VisionSection.astro:40`) and the flagship lookup `getProgramsByPintu('food')`
  (`Header.astro:41`).

## Track E — rules and specs

- [ ] `.claude/rules/routing-taxonomy.md`: the axis change, the `/peduli/` hub and why the earlier
  no-hub decision expired, and **why the URL word does not appear in the interface** — without
  that note the mismatch reads as a bug.
- [ ] `.claude/rules/content-model.md`: `pintu[]` / `pintuUtama`, and the rule that metrics follow
  `pintuUtama` only.
- [ ] Record the tie-break rule and the promotion rule where editors will meet them.
- [ ] Apply the three spec deltas in `specs/`.

## Out of scope, deliberately

- Demoting Ramadhan Berbagi (season), CSR Food Program and Community Giving (channel) out of the
  programme collection. The fields that make it possible land here; the move is a follow-up.
- Reporting surfaces per pintu for CSR proposals and the annual report.
- Retiring `IMPACTS` (`src/consts.ts`) or wiring it up — it is dead code today and carries an
  unbacked payment promise to kitchen partners. Owned by `add-kemitraan-page`, not by this change.
