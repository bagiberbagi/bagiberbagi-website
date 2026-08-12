# Roadmap

Where the project stands, what has shipped, and what is waiting on whom.

**What this file is, and what it is not.** This is the milestone view: one line per piece of
work, in the order it happened or will happen. The reasoning behind each one lives in
`openspec/changes/` (proposal, design, task list) and the behaviour it produced lives in
`openspec/specs/`. When this file and OpenSpec disagree, OpenSpec wins and this file is stale.
Nothing here should be the only place a fact is written down.

Measured against `main` on 12 August 2026.

## Where the site is now

Live at <https://www.bagiberbagi.id>. Static Astro build, deployed to a self-managed VPS on
every push to `main`. The last build came out at 62 pages and 278 images, with 70 unit tests
passing, `astro check` reporting 0 errors, and `check:assets` finding no unreferenced image.

What the CMS holds today: six pintu, nine programmes of which four are active and have their
own page, four published jejak, one organisasi, and six aksi files carrying eighteen ways to
take part, every one of them with a working destination.

## Shipped

Each row is an archived change under `openspec/changes/archive/`, and the date is its folder
prefix.

| date | change | what it did |
|---|---|---|
| 2026-07-17 | `design-system` | Replaced 12 raw hex colours, 14 arbitrary font sizes and one section header repeated 15 times by hand with tokens and shared component classes. |
| 2026-07-17 | `homepage-redesign` | One visual pass over the homepage, section by section, against the supplied mockup. |
| 2026-07-17 | `legal-page-layout` | Gave `/syarat`, `/privasi` and `/transparansi` a shared layout with a sticky table of contents. |
| 2026-07-17 | `phase2-cms-seo-multipage` | Moved often-edited content out of `src/consts.ts` into Keystatic, and added the sitemap, `robots.txt` and the legal routes. |
| 2026-07-17 | `program-megamenu-pages` | Replaced four flat nav links with the pintu mega-menu, and gave programmes their own pages. |
| 2026-07-17 | `standalone-faq-page` | Made `/faq` the only home for FAQ content, removing the duplicate homepage section. |
| 2026-07-21 | `add-analytics-tooling` | A six-provider switchboard in Keystatic with consent gating. It ships no script while every provider is off, which is still the case. |
| 2026-07-23 | `add-jejak-tracking` | The `jejak` collection, turning hardcoded impact numbers into sums over documented activities. |
| 2026-08-06 | `close-seo-audit-followups` | Closed the remaining findings of the 4 August SEO audit, and cleared a merge that would otherwise have failed the production build. |
| 2026-08-07 | `add-food-programs-organisasi` | Added the three donation schemes that had been running outside the site, plus the `organisasi` entity for institutional donors. |
| 2026-08-07 | `fix-mobile-ergonomics` | Fixed what a real-browser audit at six widths found. The layout itself measured sound; horizontal overflow was zero everywhere. |
| 2026-08-10 | `add-aksi-mechanism` | Gave all eighteen ways to take part a real destination, so every pintu page now carries three working buttons. |

## In flight

**`add-program-terms`** is merged and live. Programme pages state what only that programme can
say, and `getKetentuan` merges the programme layer over the shared one. It is not archived
because four content facts are still missing, listed in its `tasks.md` under the owner-only
heading. The visible consequence: a programme with no terms of its own renders no `#ketentuan`
section at all and the donation panel drops its link, which is where Community Giving and CSR
Food Program stand today.

**`add-kemitraan-page`** is designed and deliberately not built, at the owner's instruction.
Zero of its 24 tasks have run. Five owner questions block the content; the first of them,
whether kitchen partners are paid at all, also decides the fate of `IMPACTS` in `src/consts.ts`.
The load-bearing design decision is that an unanswered fact renders as absence rather than as a
placeholder, so a page that is not ready comes out short instead of full of brackets. `/mitra`
stays reserved for a separate partner showcase and is not folded into this change.

## Waiting on the owner

None of this is blocked on engineering.

| what | written down in | why only they can answer |
|---|---|---|
| four programme facts | `openspec/changes/add-program-terms/tasks.md` | what one portion contains, what each Ramadhan package contains, Community Giving's lead time and minimum, and which documents CSR can actually issue |
| five kemitraan questions | `openspec/changes/add-kemitraan-page/tasks.md` | anything about money, timelines, or obligations to partners; an invented commission split would be worse than a gap |
| analytics account IDs | `src/content/analytics/site.json` | all six providers have been off since 21 July, so no traffic and no WhatsApp conversion is measured anywhere |
| HSTS `preload` submission | `deploy/RUNBOOK-infra-seo.md` | the one irreversible step in the deploy runbook |

## Open, not scheduled

- **HSTS `preload` promises more than it can back.** The header sets the token but the domain is
  not enrolled, and would be rejected today for two reasons: `max-age` is 180 days against a
  required year, and `http://bagiberbagi.id` redirects straight to `https://www.bagiberbagi.id/`
  instead of reaching HTTPS on the apex first, which would file the entry under the `www`
  subdomain rather than the parent. Nothing is broken by this. The commands to re-check are in
  the runbook.
- **Cloudflare dashboard settings are not under version control**, so `deploy/` cannot be trusted
  as truth for anything set there without measuring it first.
- **`Chip.astro` has never been seen in its `tone="cat"` form.** The `/jejak/` pintu filter chips
  only render once more than one pintu has jejak, and only `food` does. The code is fine; the
  look is unproven.
- **One CTA label serves every conversation aksi.** On `/berbagi-dana/` an aksi whose text says to
  go read `/jejak/` first still shows a button reading "Hubungi lewat WhatsApp". This follows from
  the decision that everything defaults to WhatsApp, and fixing it means a label field per aksi.
  One row does not justify it; revisit if a second lands in the same position.
- **The `home` collection is half live.** `programStage` drives the homepage band through
  `ProgramStage.astro`, but the highlighted-programme list with its eyebrow and title has no
  reader at all while `ProgramHighlights.astro` sits parked in `src/components/_parked/`. An
  editor can fill those fields in the Keystatic "Beranda" panel and change nothing on the site.
  Either revive the component or retire `getProgramSection()` along with the fields it feeds;
  leaving it as it is means the admin keeps offering a control that is not wired to anything.

## Decided, do not reopen

Recorded here so the same ground is not covered twice. Each one has its reasoning in
`.claude/rules/` or in the change that settled it.

- **No `/berbagi/` hub.** Pintu is a category and a filter, not a page-owning entity.
- **The shared programme terms layer stays empty.** Every service-wide obligation has exactly one
  home, on `/syarat`. The layer survives only for an operational rule that spans programmes
  without being a `/syarat` obligation.
- **No per-pintu terms layer.** What varies varies per programme, not per pintu.
- **A programme's cover is its own asset**, never a frame borrowed from its jejak. The
  "newest jejak cover" fallback was built and removed, because newest is a date order rather than
  a choice.
- **Footer links stay at 33.7px**, below the 44px the design system asks for. Clearing it added
  about 120px to every mobile page. The design system carries the carve-out.
