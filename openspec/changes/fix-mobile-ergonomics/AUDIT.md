# Responsive audit, 4 August 2026

## Method

Production build (`bun run build`), served with `astro preview`, driven through headless
Chromium. Not the dev server: the dev toolbar and the unoptimised image path would both have
polluted the measurements.

18 routes × 6 widths = 108 page loads per pass, three passes.

```
routes   /  /tentang/  /faq/
         /jejak/  /jejak/jumat-berkah-2026-07-31-bogor/  /jejak/jumat-berkah-2026-07-17/
         /program/jumat-berkah/  /program/ramadhan-berbagi/  /program/community-giving/
         /berbagi-makanan/  /berbagi-barang/  /berbagi-pohon/  /berbagi-dana/
         /organisasi/  /organisasi/46cyclist/
         /privasi/  /syarat/  /transparansi/
widths   320  390  430  768  1024  1280
```

`[data-fade]` elements were forced visible before every measurement, because they start at
`opacity: 0` and only appear through an IntersectionObserver, which had previously produced
blank screenshots.

Interactive states were driven, not just static pages: mobile nav open, mobile programme
submenu open, desktop mega-menu open, lightbox open, carousel scrolled.

## The methodological correction that changed the result

The first pass reported zero horizontal overflow everywhere. That number was worthless.
`BaseLayout.astro:231` puts `overflow-x: hidden` on `<body>`, so the document can never report
sideways scroll no matter what happens inside it. Overflow is clipped, not prevented.

Every subsequent pass neutralised the clip first (`body { overflow-x: visible }`) and
additionally walked every `overflow: hidden` container looking for `scrollWidth > clientWidth`.

The probe itself was validated against an injected 500px canary element on a 320px viewport
before being trusted: it detected +180px and named the offending node.

## Result: horizontal overflow is genuinely clean

Zero document overflow at 18 routes × 6 widths, with the body clip removed.

Containers that do clip something all clip a decorative layer, never content:

| container | clipped by | at 320 | verdict |
|---|---|---|---|
| `section#pintu.vision` | `div.pointer-events-none.absolute.-top-10.left-1/3` | 459px | deliberate watermark |
| `section#dampak.impact` | `div.imp-glow.imp-glow-top` | 208px | deliberate glow |
| `section.s1-close` | `span.s1-close-mark` | 70px | deliberate mark |
| pintu cards | `span.pointer-events-none.absolute.-right-5.-bottom-7` | 19px | deliberate |

No interactive state produced overflow either. The mega-menu panel measures exactly
`left: 0, right: 1024` at viewport 1024 and `right: 1280` at 1280.

---

## Findings that became tracks

| # | severity | where | measured | track |
|---|---|---|---|---|
| 1 | breaks-on-phone | `Header.astro:54,180` | panel 1483px in an 844px viewport, pinned; 8 of 13 targets unreachable | A |
| 2 | degraded | `Share.astro:22,30` | 5 × 32×32, 2px apart, 34px pitch | G |
| 3 | degraded | `ProgramStage.astro:517,526` | ticks 30×22, sole control on phones | H |
| 4 | degraded | `Footer.astro:92` + 3 more | links 33.7px tall, 0.3px gap, two pairs at −0.7px | F |
| 5 | degraded | `Header.astro:66`, `Footer.astro:68` | logo 2522px / 76 KB into a 201px slot, no srcset, every page | A |
| 6 | degraded | `OrganisasiCard.astro:138` | logo 1079×979 / 66 KB raw JPEG into a 44px box, identical at every width | B |
| 7 | degraded | `Faq.astro:45` | field looks 302×48, only 241×22 is tappable | C |
| 8 | degraded | `jejak/[slug].astro:311,314` | carousel arrows 36×36 | I |
| 9 | degraded | `Footer.astro:156` | 200 chars/line at 1280, 12px, 65% opacity | F |
| 10 | degraded | `program/[program].astro` | zero 16px text on the page at viewport 390 | I |
| 11 | degraded | `DonationCard.astro:338` | package buttons 37px tall | J |
| 12 | drift | 5 components, 8 rules | coordinated `900px` threshold with no name | D |
| 13 | drift | `Hero.astro:102` | hero splits at 960 while the page splits at 900 | K |
| 14 | drift | `LegalLayout.astro:51` | raw `md:w-[240px]` on a page shell | E |
| 15 | drift | `Header.astro:54` | dead `relative` alongside `sticky` | A |
| 16 | drift | `WhyFood.astro` | dead file, imported by nothing | E |
| 17 | drift | `BaseLayout.astro:231` | `overflow-x: hidden` hides nothing today, hides everything tomorrow | E |

### Finding 1 in full, because it is the reason this change exists

| viewport | panel height | visible portion | unreachable targets |
|---|---|---|---|
| 320 × 568 | 1533px | 486px | 8 of 13 |
| 390 × 844 | 1483px | 762px | 8 of 13 |
| 430 × 932 | 1467px | 850px | 8 of 13 |

After scrolling the document to its very bottom (`scrollY` 4532 at 390×844), the panel's own
`getBoundingClientRect().top` is still 82. It does not move, because a sticky element taller
than the viewport stays pinned for the whole scroll.

Unreachable, in order: Berbagi Ruang, Berbagi Dana, Berbagi Pohon, Lihat Program Jumat Berkah,
Jejak & Dampak, Tentang Kami, FAQ, **Donasi Sekarang**.

### Finding 12 in full, because it looks like drift and is not

Homepage layout state either side of the threshold:

```
@899  rail 1 col · imp-journey 2 · cl-grid 1 · river none · stack block
@900  rail 5 col · imp-journey 4 · cl-grid 2 · river block · stack none
```

Five rules in four components flip together at exactly 900px. It is a real threshold that
simply was never named, the way `860px` was named `screens.nav` in `tailwind.config.mjs:82`.
Track D gives it a name; it does not move it.

---

## Findings that were refuted. Do not raise these again.

**`100vw` in six components is not an overflow risk.** Every occurrence is inside a `sizes=`
attribute on an `<Image>`, not a CSS width. `sizes="100vw"` is the correct hint for a
full-bleed band and has no relationship to the scrollbar gutter. There is **no CSS
`width: 100vw` anywhere in the codebase.** Verified at `DonationCard.astro:108`,
`JejakCard.astro:119-122`, `ProgramStage.astro:131`, `OrganisasiCard.astro:69-73`,
`ProgramCover.astro:50`, `VideoEmbed.astro:41`, `jejak/[slug].astro:251,380`,
`organisasi/[slug].astro:272`, `PintuS1.astro:597,872`.

**`min-height: 78vh` does not make a band jump on a phone.** `ProgramStage.astro:277` is
inside `@media (min-width: 768px)`. The phone path is `min-height: 560px` at `:273`.
`WhyFood.astro:56` has no media query but the component is imported by nothing.
`Hero.astro:86` already uses `100svh`. **No `vh` band reaches any phone.** Switching the
≥768px rule to `dvh` is still the more modern choice, but it is cosmetic and out of scope.

**Responsive images work correctly.** An earlier measurement appeared to show every photo
served at half the density needed on a retina phone. That reading was wrong: for images using
`w` descriptors, `naturalWidth` returns the *density-corrected* intrinsic size, so a correctly
chosen 2× resource reports as 1× of the CSS box. Verified properly by comparing `currentSrc`
between DPR 1 and DPR 2 contexts: the browser fetches different files, from
`widths={[640, 960, 1280]}` against `sizes="100vw"`, exactly as intended. Raw PNG count in
`dist` remains 0.

**`.ps-tick-label` clipped to 1×1 is not a defect.** `ProgramStage.astro:478-487` is a
deliberate visually-hidden block providing the accessible name for each tick, so a screen
reader and a no-JS visitor get four labelled destinations.

**The lightbox is correct.** Buttons measure 44×44 ("Tutup galeri", "Foto sebelumnya", "Foto
berikutnya"), the image fits at 356×633 inside a 390×844 viewport, and body scroll is locked
while it is open.

**The jejak carousel's 1436px `scrollWidth` inside a 350px box is intentional.** It is a
`snap-x` horizontal track of eight 169px items with `overscroll-behavior-x: contain`.

**`860px` is not drift.** It is `screens.nav` in `tailwind.config.mjs:82`, and both
`Header.astro:241` and `Hero.astro:91` match it deliberately. The only note against it is that
it lives in `tailwind.config.mjs` while container tiers live in `@theme` in `global.css`, so
the vocabulary is split across two files. Track D writes that down rather than moving it.

**Line length is fine everywhere except the footer paragraph.** At 320 the longest measured
line is 47 characters. At 768 body copy sits at 81-86 characters. Only `Footer.astro:156`
exceeds that, at 115 characters on 768 and 200 on 1280.

**Touch targets that are already correct**, so nobody spends a track on them: lightbox buttons
44×44, hamburger 44×44, mobile menu items 324×48, DonationCard porsi chips 69.5×84.5, the
donation CTA 302×57.5, FAQ accordion triggers 350×64 to 350×88, legal TOC links 350×36, jejak
gallery buttons 170×128.

## Coverage gap, stated rather than hidden

The `/jejak/` pintu filter chips were never exercised. Only one pintu currently has jejak, so
the component falls back to a meta row and the chips never render. They cannot be tested until
a second pintu has documentation.

## Evidence

Screenshots and the raw JSON from all three passes live in the session scratchpad at
`/private/tmp/claude-502/-Users-ekodedypurnomo-Developer-Project-bagiberbagi-website/d214811b-baaa-45a2-b534-89660aa9973a/scratchpad/`.
They are temporary. Anything that matters has been transcribed into the tables above.
