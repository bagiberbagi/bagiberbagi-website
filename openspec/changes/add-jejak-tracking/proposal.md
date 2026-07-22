## Why

Jumat Berkah sudah berjalan di lapangan, dan ke depan tiap program akan berjalan berkali-kali — tapi situs tidak punya tempat menampilkan buktinya. Angka dampak di halaman pintu (`CATEGORY_CONTENT.stats`, mis. "12.400 porsi") masih hardcoded, tidak bersumber dari data nyata. Fitur **Jejak** membuat setiap jejak terdokumentasi (foto, angka, cerita) menjadi sumber tunggal yang mengisi kartu beranda, halaman pintu, dan halaman program — sekaligus mengubah angka dampak dari karangan menjadi agregat terhitung.

## What Changes

- **Collection baru `jejak`** — satu file `.mdoc` per jejak, mengacu ke program induk lewat `relationship`. Field: `title`, `program`, `date`, `location`, `summary`, `metrics[{label, value:number}]`, `cover`, `gallery[]`, `body`, `published`. Pintu **tidak** disimpan di jejak — diturunkan dari `program.pintu` (single-source terjaga).
- **Model berlapis Pintu → Program → Jejak.** Jejak menempel ke Program (relationship); Program sudah menempel ke Pintu (`pintu` field). Impact = lapisan komputasi agregat, bukan data baru dan bukan istilah publik.
- **Lib baru** `src/lib/jejak.ts` (`getJejak`/`getJejakByProgram`/`getJejakByPintu`/`getJejakPages`) dan `src/lib/impact.ts` (`getPintuImpact`/`getProgramImpact`, agregasi sum-by-label pada `metrics`).
- **Halaman detail** `/jejak/[slug]` — route dinamis dari `getJejakPages()`: hero, baris metrics, galeri, body naratif, CTA ke program induk, OG image.
- **Halaman rekam jejak per pintu** `/berbagi/[category]/jejak` — header counter agregat **real** (sum metrics), galeri gabungan, dan **breakdown per-program** (kartu tiap program: total metric, jumlah jejak, badge warna pintu) untuk memantau program mana yang dampaknya tinggi dan di kategori pintu apa.
- **Blok "Jejak {Program}"** di `[program].astro` — daftar `getJejakByProgram(slug)` + agregat program itu.
- **Section "Jejak Terbaru"** di beranda (`JejakTerbaru.astro`) — kartu jejak terbaru lintas pintu.
- **CATEGORY_CONTENT.stats hardcoded diganti/di-override** hasil `getPintuImpact` di halaman pintu.
- **Keystatic**: collection `jejak` (relationship ke `programs`, upload ke `public/uploads/jejak`, `contentField: body`), konsisten `.mdoc` antara `content.config.ts` dan `keystatic.config.ts`.
- **OG & SEO**: extend `open-graph/[...route].ts` + `seo.pages[]` untuk halaman jejak.
- **Seed** satu entry `jejak` dari Jumat Berkah yang sudah berjalan.

## Capabilities

### New Capabilities
- `jejak-tracking`: dokumentasi jejak terstruktur per program, agregasi metrik berlapis (per pintu / per program), serta permukaannya di beranda, halaman pintu, halaman program, dan halaman detail jejak.

### Modified Capabilities
- `content-cms`: menambah collection editor-managed `jejak` (relationship ke `programs`, image array, `contentField` `.mdoc`) ke model CMS Keystatic + Astro content config.

## Impact

- **Konten baru**: `src/content/jejak/*.mdoc`, `public/uploads/jejak/`.
- **Config**: `src/content.config.ts`, `keystatic.config.ts` (harus sepakat `.mdoc`).
- **Lib baru**: `src/lib/jejak.ts`, `src/lib/impact.ts`.
- **Route baru**: `src/pages/jejak/[slug].astro`, `src/pages/berbagi/[category]/jejak.astro`.
- **Komponen baru**: `src/components/JejakTerbaru.astro` (+ kartu jejak, mungkin galeri-lightbox script vanilla).
- **Route diubah**: `src/pages/berbagi/[category].astro` (stats statis → agregat), `src/pages/[program].astro` (blok jejak), `src/pages/index.astro` (mount section).
- **OG/SEO**: `src/pages/open-graph/[...route].ts`, `src/content/seo/seo.json`.
- **consts**: `CATEGORY_CONTENT.stats` jadi fallback/override, bukan sumber utama.
- **Zero-framework** dipertahankan (`.astro` + vanilla JS); image field `.nullish()` sesuai konvensi Keystatic clear→null.
