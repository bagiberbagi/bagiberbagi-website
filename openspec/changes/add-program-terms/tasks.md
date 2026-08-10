# Tasks

Small enough to run in one pass on one branch, `feat/program-terms`, in a worktree off `main`.
Everything below is done except the content, which is the owner's.

## Done

- [x] **Schema, both sides.** `ketentuanItem` shared by the singleton and the programme field in
  `src/content.config.ts`; `ketentuan` singleton plus `detail.ketentuan` in `keystatic.config.ts`;
  sidebar entry under Konten Situs.
- [x] **Reader.** `src/lib/ketentuan.ts` — `mergeKetentuan` pure, `getKetentuan` lazily importing
  `astro:content` so the merge stays unit-testable, the same arrangement `impact.ts` uses.
- [x] **Tests.** `src/lib/ketentuan.test.ts`, 8 cases: ordering, scope tagging, override, loose title
  matching, empty rows dropped, duplicate-within-block first-wins, empty programme block, both
  blocks empty.
- [x] **Shared content.** `src/content/ketentuan/ketentuan.json`, seven items, every one traceable to
  a `/syarat` clause. See `KETENTUAN.md`.
- [x] **Component and mount.** `src/components/Ketentuan.astro`; mounted between Cara Kerja and Rekam
  Jejak in `src/pages/program/[program].astro`, with a conditional `#ketentuan` link in the donation
  panel's `foot` slot.
- [x] **`Program.detail` type** gains `ketentuan`, and the `aksi.test.ts` fixture with it.
- [x] **Rules docs.** `content-model.md` (both content shapes), `section-ids.md` (the new id and the
  anchor-check map entry), `frontend-scripts.md` (why this accordion is the one with no script).

## Verified

| what | how |
|---|---|
| `bunx astro check` | 105 files, 0 errors |
| `bun test` | 70 pass, 0 fail |
| `bun run build` | 62 pages, no new warning |
| `bun run check:assets` | 278 images in dist, all referenced |
| anchor check | 17 ok, 0 broken, 0 unmapped, with `[program].astro` added to the map |
| stored shape | round-tripped through `createReader(cwd, config)`, Keystatic's own parser: singleton 7 rows, programme block 9 rows across both, 0 shape mismatches. A programme whose yaml has **no** `ketentuan` key reads back `[]`, so the absent-key case is safe on both sides |
| section renders | `id="ketentuan"` and the panel link present on all four programme pages |
| merge on screen | temporary rows on Jumat Berkah proved it: 2 programme items open above 6 shared items closed, and `laporan   PENYALURAN` replaced `Laporan penyaluran` rather than joining it. Rows reverted before commit |
| no script | `<details>` + `group-open:rotate-180` and `::-webkit-details-marker` both emitted in the built CSS; no script tag added to the page |
| anchor lands clear of the header | jumping to `#ketentuan` puts the section top at 96px with a 74px sticky header |
| touch target | every `<summary>` measures 56px tall at both 1280 and 390 |
| uniform with the page | after the tier correction, all five sections measure 1024 wide with content starting at x=168 at 1280, and 390 / x=0 at mobile. The reading measure inside each term stays 672 |

## Open, and it needs the owner

- [ ] **Write the per-programme terms.** `KETENTUAN.md` §3 holds a draft per active programme and the
  questions behind each gap. Two of them are the shape "is this value a rule or just this week's
  value", about `nextAgenda.cutoff` and `nextAgenda.location`.
- [ ] **Decide on the four withheld lines** in `KETENTUAN.md` §2, the anti-fraud one first.
- [ ] **Decide whether the donation panel's `note` and shared item 2 should both exist**, the open
  question at the end of `design.md`.

## Known and left alone

The `#ketentuan` link in the donation panel's foot measures 18px tall, under the 44px the design
system asks for. It matches the mitra link sitting directly beneath it (19px per line), which has
been there since that panel was built. Enlarging one and not the other would look wrong, and
enlarging both is a change to an existing panel nobody asked for — the same trade the owner already
declined for the footer links, which the spec now carries a carve-out for.
