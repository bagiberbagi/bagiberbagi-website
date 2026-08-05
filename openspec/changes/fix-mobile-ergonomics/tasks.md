# Tasks

Each track is written so it can be handed to one agent whole. Check the file territory table
in `proposal.md` before running two tracks at once.

## Rules that apply to every track

- One agent, one worktree off `main`. Do not work in the main checkout.
- **Do not `git push`.**
- **Do not run git in the main checkout at `~/Developer/Project/bagiberbagi-website`.**
- **Never append a `Co-Authored-By` trailer to a commit.**
- Every Bash command that concerns the worktree starts with `cd <absolute-worktree-path> &&`.
  The shell's working directory has silently returned to the main checkout mid-session before.
- Real `bun install` in the worktree. Never symlink `node_modules`; it has caused an ELOOP
  failure in CI.
- Unique dev port per worktree. 4322 and 4323 are free at time of writing. Trust the daemon
  log for the port actually bound, not the flag that was asked for.
- Do not touch visitor-facing copy. This change moves boxes, not words.
- No new dependency, no CSS framework, no client-side framework.
- New widths go through a `Container` tier or an `@theme` token. Never invent a raw `max-w-*`
  for a page shell.

## Completion gate, all tracks

```
bunx astro check                                   # 0 errors
bun test                                           # all pass
bun run build                                      # succeeds
find dist/_astro dist/uploads -iname '*.png' | wc -l   # prints 0
```

## The overflow probe

Run this after any layout change, at 320 / 390 / 430 / 768 / 1024 / 1280, on the routes the
track touched. Paste into the browser console on a `bun run preview` build. It neutralises the
body clip first, otherwise the answer is always zero and always meaningless.

```js
(() => {
  document.body.style.overflowX = 'visible';
  const de = document.documentElement;
  const over = de.scrollWidth - de.clientWidth;
  if (!over) { document.body.style.overflowX = ''; return 'clean'; }
  const lim = de.clientWidth, bad = [];
  for (const el of document.querySelectorAll('body *')) {
    const b = el.getBoundingClientRect();
    if (b.width && b.height && b.right + scrollX > lim + 1) bad.push(el);
  }
  const set = new Set(bad);
  const leaves = bad.filter(e => ![...e.querySelectorAll('*')].some(c => set.has(c)));
  document.body.style.overflowX = '';
  return { over, leaves: leaves.slice(0, 6) };
})()
```

An element that comes back is only a defect if it carries content. Decorative bleed
(`pointer-events-none` watermarks, `.imp-glow`, `.s1-close-mark`) is deliberate and already
clipped on purpose.

---

# GROUP 1 — no visual approval needed

An agent may finish these and hand back a merge-ready branch. The owner does not have to look
first. Track A is the one that fixes a live defect, so it goes first.

## Track A — header shell and logo

Base `main`. Files: `src/components/Header.astro`, plus the single `<Image>` line in
`src/components/Footer.astro`.

### A1. The mobile nav panel must keep every item reachable

Measured defect: opening the programme submenu grows `#mobile-nav-panel` from 298px to 1483px
at 390×844. `[data-header]` is `position: sticky; top: 0`, so the panel is pinned. Scrolling the
document to the bottom (`scrollY` 4532) leaves the panel's own top at 82px, unchanged. Eight of
thirteen targets never enter the viewport, ending with **Donasi Sekarang**. Same at 320×568 and
430×932.

- [ ] A1.1 `Header.astro:180` — give `#mobile-nav-panel` a height cap and its own scroll:
      `max-height: calc(100dvh - var(--nav-h) - 1rem)`, `overflow-y: auto`,
      `overscroll-behavior: contain`. Use a scoped `<style>` block, not utility soup, because
      the value depends on `--nav-h` which lives in `global.css`.
- [ ] A1.2 Add a `dvh` fallback for older Safari: declare `100vh` first, then `100dvh`.
- [ ] A1.3 Verify at 320×568, 390×844 and 430×932, submenu open, that the last target
      (`Donasi Sekarang`) is inside the viewport, either directly or after scrolling the panel.
      Report its `getBoundingClientRect()` bottom against `innerHeight` as the proof.
- [ ] A1.4 Verify the panel still fits without a scrollbar when the submenu is closed. It was
      298px tall; nothing should change in that state.
- [ ] A1.5 Verify scrolling inside the panel does not scroll the page behind it, and that the
      page still scrolls normally when the menu is closed.

### A2. The logo ships six times larger than it renders

Measured: `dist/_astro/logo-horizontal-color.*.webp` is 77,978 bytes at 2522px wide, with no
`srcset`. It renders at 201 CSS px in the header and 179 in the footer, so at DPR 2 it needs
403px. At viewport 320 the homepage pulls 295 KB of images and 76 KB of that (26%) is the logo,
on every page of the site.

- [ ] A2.1 `Header.astro:66` — add `widths` and `sizes` to the `<Image>`. Header slot is 201px,
      so `widths={[201, 402, 603]}` with `sizes="201px"` is sufficient. Keep `class="h-9 w-auto"`.
- [ ] A2.2 `Footer.astro:68` — same treatment for the 179px slot. **This is the only line in
      `Footer.astro` this track may touch**; Track F owns the rest of that file.
- [ ] A2.3 Confirm the emitted `srcset` is non-empty and that the file fetched at DPR 1 differs
      from the one fetched at DPR 2. Report both byte sizes.

### A3. Dead `relative` on the header

`Header.astro:54` carries both `sticky` and `relative`. Computed `position` resolves to
`sticky`, so `relative` never applies.

- [ ] A3.1 Remove `relative` from the class list.
- [ ] A3.2 Confirm `getComputedStyle(document.querySelector('[data-header]')).position` is still
      `sticky`, and that the header still overlaps the hero the way it did before.

**Done when**: the gate passes, and the report carries a measured bottom-vs-viewport number for
A1.3 plus the two logo byte sizes for A2.3.

---

## Track B — organisasi logos through `astro:assets`

Base `main`. Files: `src/components/OrganisasiCard.astro`, `keystatic.config.ts`,
`src/content.config.ts`, `src/lib/organisasi.ts`, `src/lib/assets.ts`.

Measured defect: `public/uploads/organisasi/46cyclist.jpeg` is 1079×979 and 67,269 bytes,
served as raw `image/jpeg`, byte-identical at 320 and at 1280, into a box that is 44×44
(`w-11 h-11`) or 56×56 (`w-14 h-14`). On `/jejak/` at viewport 320 it is the single largest
file on the page: 66 KB of a 239 KB total.

`.claude/rules/content-model.md` justifies the plain `<img>` on the grounds that this is "a small
logo". The first real upload is a megapixel. The premise did not survive contact with an editor.

**This track carries the change's main risk.** `fields.image` in Keystatic strips `publicPath`
with a blind `.slice(prefix.length)` and does not check the prefix first, so moving the folder
without moving the config in the same commit makes the admin fail to find the file **and** write
a corrupted path back on the next save. `.claude/rules/image-pipeline.md` documents this.

- [ ] B1 Move the upload target to `src/assets/organisasi/`, mirroring the programme photo
      pattern: `keystatic.config.ts` `publicPath: '/src/assets/organisasi/'` must match the key
      shape of the eager `import.meta.glob` exactly.
- [ ] B2 Add the resolver via `createImageResolver` in `src/lib/assets.ts`, the same shared
      helper `programs.ts` and `jejak.ts` already use. Do not write a fourth private copy.
- [ ] B3 `src/content.config.ts` — the logo field becomes an image module rather than a string.
      Keep it nullish, not optional: Keystatic writes `null` when an image field is cleared.
- [ ] B4 `src/lib/organisasi.ts` — the reader returns the module.
- [ ] B5 `OrganisasiCard.astro:138-145` — swap the plain `<img>` for `<Image>` with
      `widths={[44, 56, 88, 112]}` and a `sizes` matching the 44/56 slots. Keep
      `object-contain bg-white border border-border p-1.5` so the visual result is identical.
- [ ] B6 Move the existing file, then confirm `/organisasi/`, `/organisasi/46cyclist/` and
      `/jejak/` all still render the logo and all still return 200.
- [ ] B7 Report the served byte size before and after at viewport 320. It must drop by at least
      an order of magnitude.
- [ ] B8 **A missing file must warn and fall back, not fail the build**, matching how
      `jejak.ts` handles a stale path. One bad content entry must not take the site down.
- [ ] B9 Update the "deliberately not routed through `astro:assets`" sentence in
      `.claude/rules/content-model.md`, because this change makes it false.

**Done when**: the gate passes, `/organisasi/46cyclist/` returns 200, and the before/after byte
sizes are in the report.

---

## Track C — FAQ search field

Base `main`. File: `src/components/Faq.astro`.

Measured defect: the field looks 302×48 but the `<input>` box is 241×22, and its parent at
`Faq.astro:45` is a `<div>`, so tapping the visible padding does nothing. The top and bottom
13px of an apparently normal form field are dead.

- [ ] C1 `Faq.astro:45` — make the wrapper a `<label for="faq-search">`, or nest the input in
      one. The `for` already exists at `:44` on the "Cari Topik" label, so keep exactly one
      label as the accessible name and let the other be presentational.
- [ ] C2 Confirm `document.activeElement` becomes the input after clicking 2px inside the
      wrapper's top edge.
- [ ] C3 Confirm the accessible name is still "Cari Topik" and has not been duplicated or lost.

**Done when**: the gate passes and C2 is demonstrated.

---

## Track D — name the 900px breakpoint

Base `main`. Files: `tailwind.config.mjs`, `TrustSection.astro`, `ImpactSection.astro`,
`ClosingSection.astro`, `SolutionSection.astro`.

`900px` appears in eight rules across five shipped components with no name. It is **not** drift:
measured on the homepage, the whole page changes shape at exactly that number, in unison.

```
@899  rail 1 col · imp-journey 2 · cl-grid 1 · river none · stack block
@900  rail 5 col · imp-journey 4 · cl-grid 2 · river block · stack none
```

So it is a real threshold that never got a name, the way `860px` did as `screens.nav`.

- [ ] D1 `tailwind.config.mjs:81-83` — add `wide: '900px'` next to `nav: '860px'`.
- [ ] D2 Replace the raw `900px` in `TrustSection.astro:89,93,98,105`, `ImpactSection.astro:213`,
      `ClosingSection.astro:135`, `SolutionSection.astro:158,222`. Where the rule is in a scoped
      `<style>` block a media query has to stay a media query, so the win there is a comment
      naming the threshold rather than a utility swap. Do not convert working scoped CSS to
      utilities just to use the token.
- [ ] D3 **Prove the rendered output is unchanged.** Build before and after, then diff
      `dist/**/*.html` and the emitted CSS. Any difference at all is a mistake in this track, not
      an improvement.
- [ ] D4 Note in `tailwind.config.mjs` that the breakpoint vocabulary lives here while the
      container tiers live in `@theme` in `global.css`, so the next reader does not look in one
      place and conclude the other is empty.

**Done when**: the gate passes and D3's diff is empty.

---

## Track E — drift cleanup

Base `main`. Files: `src/layouts/LegalLayout.astro`, `src/styles/global.css`,
`src/layouts/BaseLayout.astro`, and the deletion of `src/components/WhyFood.astro`.

- [ ] E1 `LegalLayout.astro:51` — `md:w-[240px]` is a raw arbitrary width on a page shell, which
      `.claude/rules/layout-tiers.md` forbids. Give it an `@theme` token and use that. Keep the
      computed value at exactly 240px so nothing moves.
- [ ] E2 Delete `src/components/WhyFood.astro`. `ProgramStage.astro:3` states it replaced it and
      absorbed it whole; nothing imports it. Confirm with a grep across `src/` before deleting,
      excluding the comment references in `ProgramStage.astro` and `index.astro`.
- [ ] E3 `BaseLayout.astro:231` — keep `overflow-x-hidden` on `<body>`, but write down why it is
      there and what it costs. Measured today it hides nothing: with the clip neutralised,
      document overflow is 0 at 18 routes × 6 widths. The cost is that the next regression will
      be invisible in a browser. **Recommendation is to keep it**, because removing it trades a
      silent clip for a real sideways scroll on some device that cannot be tested here, and add
      the probe from the top of this file to the review checklist instead.
- [ ] E4 Confirm the legal pages render identically at 768 and 1024 before and after E1.

**Done when**: the gate passes and E4 is confirmed.

---

# GROUP 2 — hold for the owner's visual approval

Each of these changes something that currently looks fine. Finish the branch, start a dev
server, hand over the URL and the widths to look at, then wait. Do not merge on your own
judgement.

Every track in this group ends with the same handover: a running dev server, the exact routes
and widths to check, and a one-line statement of what moved.

## Track F — footer

Base: `main` **after Track A has merged** (A owns `Footer.astro:68`). File:
`src/components/Footer.astro`.

- [ ] F1 Link stack. Measured: `link self-start text-body-sm ... py-1.5` renders 33.7px tall
      with a 0.3px gap to the next link, and two measured pairs sit at −0.7px, meaning they
      touch. Four occurrences of the class, 20+ links, on every page. `py-2.5` brings the box to
      roughly 44px.
- [ ] F2 **The consequence needs the owner's eyes**: the mobile footer grows by roughly 200px.
      That may be fine, or it may argue for two columns instead of four on a phone. Prepare both
      and let the owner pick.
- [ ] F3 The SEO paragraph at `Footer.astro:156-157` runs 200 characters per line at 1280 and
      115 at 768, set at 12px in `text-muted/65`. Wrap it in the `prose` tier so the measure
      caps at 672px. **The copy does not change.** Only the width.
- [ ] F4 Decide with the owner whether that block stays 12px. It is search-facing text, so
      small is defensible; 200 characters per line is not.

**Hand over**: `/` and `/faq/` at 320, 390 and 1280.

## Track G — share row

Base `main`. File: `src/components/Share.astro`.

Measured: five targets at 32×32, x positions 64/98/132/166, so a 34px pitch and 2px of clear
space between neighbours. `Share.astro:22` sets `w-8 h-8`, `:30` sets `gap-0.5`.

- [ ] G1 Raise the icon buttons to 44×44 and the gap to at least 8px.
- [ ] G2 The row grows from about 170px to about 236px. Confirm it still fits the 280px content
      column at viewport 320 without wrapping.
- [ ] G3 If the owner prefers the row to stay visually light, keep the 32px painted circle and
      grow only the hit area with padding or a pseudo-element. Prepare this variant too; it is
      the option that changes nothing on screen.

**Hand over**: `/program/jumat-berkah/` and `/organisasi/46cyclist/` at 320 and 390.

## Track H — programme stage ticks

Base `main`. File: `src/components/ProgramStage.astro`.

Measured: four ticks at 30×22 with 8px gaps at viewport 390. `:526` shrinks the width to 30px
below 768 while `:517` hides `.ps-arrow` below 768, so **these ticks are the only slide control
a phone user has**. The comment at `:455` claims the 22px anchor "clears the minimum"; it does
not.

- [ ] H1 Raise the `.ps-tick` anchor to 44px tall. The painted bar stays 3px, so nothing on
      screen changes size.
- [ ] H2 `.ps-nav` sits at `bottom: 16px` on phones. Check the taller anchor does not overlap
      `.ps-cta` above it, and adjust the offset if it does.
- [ ] H3 Correct the comment at `:455`, which currently states something false.
- [ ] H4 Consider whether phones should get the arrows back rather than relying on swipe plus a
      hairline. That is a design call, so raise it, do not decide it.

**Hand over**: `/` at 320, 390 and 430, scrolled to the programme band.

## Track I — programme, jejak and pintu pages

Base: `main` **after Track D has merged** (this track converts `PintuS1.astro`'s own `900px`
and `899px` rules to the new name). Files: `src/pages/program/[program].astro`,
`src/pages/jejak/index.astro`, `src/pages/jejak/[slug].astro`,
`src/components/_variants/PintuS1.astro`.

- [ ] I1 Carousel arrows at `jejak/[slug].astro:311` and `:314` measure 36×36. Raise to 44×44.
- [ ] I2 Breadcrumb links measure 53×19.5 and 84×19.5 at
      `program/[program].astro:103` and `PintuS1.astro:536`. Add vertical padding. This pushes
      the H1 down, which is why it is in this group.
- [ ] I3 Body text. Measured font-size histogram at viewport 390:

      | page | 12px | 14px | 16px | 17px+ |
      |---|---|---|---|---|
      | `/program/jumat-berkah/` | 2 | 18 | **0** | 1 |
      | `/jejak/` | 4 | 7 | 1 | 0 |
      | `/tentang/` | 1 | 6 | 8 | 0 |
      | `/berbagi-makanan/` | 1 | 10 | 16 | 11 |

      This is not a broken token. `body-sm` at 14px is a named role in the type scale. The
      finding is that on programme and jejak pages it has become the default rather than the
      exception, and `/berbagi-*/` shows what the same content looks like when it is not.
      Promote the paragraph-level text to `body`, leave labels, meta rows and captions alone.
      **This is a typographic decision across two page types, so propose, do not impose.**
- [ ] I4 Convert `PintuS1.astro:1300,1402,1439` and `:1974` to the `wide` name from Track D.

**Hand over**: `/program/jumat-berkah/`, `/jejak/`, `/jejak/jumat-berkah-2026-07-31-bogor/` and
`/berbagi-makanan/` at 320, 390 and 768.

## Track J — donation package buttons

Base `main`. File: `src/components/DonationCard.astro`.

Measured: `.dc-pkg-opt` at `:338-343` renders 67.5×37, 73×37 and 111.5×37 on
`/program/ramadhan-berbagi/`. The porsi chips next to them are 69.5×84.5 and the CTA is
302×57.5, both fine, so only this row is short.

- [ ] J1 Raise `padding: 7px 16px` so the button clears 44px tall.
- [ ] J2 The row is `flex-wrap` with an 8px gap; confirm it does not wrap to three lines at
      viewport 320.

**Hand over**: `/program/ramadhan-berbagi/` at 320 and 390.

## Track K — hero breakpoint

Base: `main` **after Track D has merged**. File: `src/components/Hero.astro`.

`Hero.astro:102` splits `.hero-inner` into two columns at `min-width: 960px`, while the rest of
the homepage splits at 900. Between 860 and 959 the desktop navbar is showing over a
phone-shaped hero with 819px of unused content width.

- [ ] K1 Move the hero split to the `wide` threshold from Track D.
- [ ] K2 Check the hero's donation card is not too narrow at 900-959. If it is, the correct
      answer may be to move the whole cluster to 960 rather than the hero to 900. Measure both
      and let the owner choose.
- [ ] K3 `Hero.astro:91` uses `860px`, which correctly matches `screens.nav`. Leave it, and add
      a comment saying it is deliberate so nobody "harmonises" it later.

**Hand over**: `/` at 860, 899, 900, 959, 960 and 1024.

---

## Ordering

```
A ──► F
D ──► I
  └─► K
B, C, E, G, H, J   independent
```

Group 1 is five tracks with no interdependencies except that F waits on A. Start A first: it is
the only track fixing something that is broken for a visitor today.
