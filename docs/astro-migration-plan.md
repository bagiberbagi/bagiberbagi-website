# Migrasi ke Astro — ringkasan keputusan

Phase 1: port situs existing (1 halaman landing) ke Astro. Konten/struktur sama, styling boleh dirapiin. Fitur & halaman baru dari `plan.md`/`faq.md`/`kebijakan.md`/`syarat.md` jadi backlog Phase 2 — tidak dikerjakan sekarang.

## Tooling

- Package manager: bun (`bun create astro@latest .`, `@astrojs/tailwind`)
- `astro.config.mjs`: `output: 'static'`, no adapter (belum ada target deploy pasti)
- Styling: Tailwind CSS

## Struktur project

```
bagiberbagi-website/
├── legacy/                    # file builder lama, dipindah kesini, jadi referensi
│   ├── bagiberbagi.dc.html
│   ├── content.js
│   ├── image-slot.js
│   └── support.js
├── src/
│   ├── consts.ts              # semua data: waNumber, socials, statLabels, programs,
│   │                          #   features, steps, impacts, faqs, footerCols
│   ├── content/
│   │   ├── config.ts
│   │   └── legal/             # privacy.md, terms.md, transparency.md (Content Collection)
│   ├── components/
│   ├── layouts/BaseLayout.astro
│   ├── pages/index.astro
│   └── scripts/               # vanilla JS per fitur interaktif
├── public/
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
└── package.json
```

**Kenapa `legal/` beda dari yang lain:** isinya prosa panjang (privacy/terms/transparency), bukan array data pendek, dan calon halaman sendiri di Phase 2 — cocok Content Collection (markdown body + schema title). `programs`/`features`/`steps`/`impacts`/`faqs` jumlahnya fix & kecil (4-5 item), tightly-coupled ke 1 section, tidak individually routed — cukup plain typed array di `consts.ts`, gak perlu 1-file-per-entry.

## Komponen & mapping section asli → Astro

| Section asli (`bagiberbagi.dc.html`) | Komponen | Sumber data | JS |
|---|---|---|---|
| HEADER | `Header.astro` | consts.ts | `mobile-nav.js` + `scrollspy.js` |
| HERO | `Hero.astro` + `DonationCalculator.astro` | consts.ts | `ticker.js` + `calculator.js` |
| STATS | `Stats.astro` | target hardcoded (8.5jt/42/210/5, sama kayak asli) | `stats-counter.js` |
| PROGRAM | `ProgramFeatures.astro` | consts.ts `features` | — |
| DOKUMENTASI | `Documentation.astro` | placeholder abu-abu (belum ada foto asli) | — |
| CARA KERJA | `HowItWorks.astro` | consts.ts `steps` | — |
| SATU AKSI BANYAK DAMPAK | `ImpactSection.astro` | consts.ts `impacts` | — |
| BANGUN DAMPAK BERSAMA | `JoinUs.astro` | **hardcoded di komponen** — 2 card ini gak ada di `content.js` asli, murni markup, dipertahankan apa adanya | — |
| FAQ | `Faq.astro` | consts.ts `faqs` | `faq-accordion.js` |
| LEGAL | `Legal.astro` | Content Collection `legal/*.md` | — |
| FOOTER | `Footer.astro` | consts.ts `footerCols`, socials | — |

Shared: `fade-in.js` (generic `[data-fade]` reveal-on-scroll, dipake banyak komponen). `BaseLayout.astro` bungkus `<head>` (font Plus Jakarta Sans, favicon, meta) + slot.

Semua state kecil & kekontain per komponen → vanilla JS, gak perlu Alpine/React.

## Fitur interaktif asli yang harus di-port persis

Dari inline script `bagiberbagi.dc.html:396-580`-an:
- Mobile nav toggle + close-on-link-click
- Scrollspy: highlight nav link aktif berdasar section yang keliatan (IntersectionObserver, rootMargin `-40% 0px -50% 0px`, section ids: cara-kerja/program/faq/tentang)
- Fade-in-on-scroll: elemen `[data-fade]` opacity 0→1 + translateY 24px→0, threshold 0.15
- Activity ticker: rotasi 3 teks tiap N detik (default 4s)
- Stats count-up: animasi easeOutCubic durasi 1800ms, trigger sekali pas section keliatan (threshold 0.3), target: statDana 8.5jt, statDonatur 42, statBerbagi 210, statArea 5
- FAQ accordion: 1 item terbuka dalam satu waktu
- Donation calculator: program select + pax counter (min 1, max 999) + total = pax × 25000 (format `Rp` id-ID) + WA link dinamis berisi program+pax+total
- WA links statis (dibangun dari consts, bukan JS-reactive): header CTA, mitra UMKM, CSR korporasi, footer socials (IG/TikTok/email)

## Styling tokens (Tailwind)

```js
colors: {
  brand: { yellow: '#FFD900', blue: '#1D46B9', orange: '#F4791D' },
  ink: '#0F172A',
  muted: '#64748B',
  border: '#EEF0F3',
}
fontFamily: { sans: ['Plus Jakarta Sans', 'sans-serif'] }
```

## Legacy & docs handling

- `bagiberbagi.dc.html`, `content.js`, `image-slot.js`, `support.js` → `legacy/`, tidak dihapus
- `plan.md`, `faq.md`, `kebijakan.md`, `syarat.md` → tetap di root, backlog Phase 2
- README.md/CLAUDE.md/AGENTS.md diupdate: command baru (bun install/dev/build), arsitektur Astro+Tailwind+Content Collections, catatan `legacy/` = referensi situs lama

## Verifikasi

Gak ada test framework (scope scratch). Verifikasi manual: `bun run dev`, bandingin tiap section vs situs lama di browser, cek responsive mobile/desktop, jalanin skill `verify` sebelum commit final.
