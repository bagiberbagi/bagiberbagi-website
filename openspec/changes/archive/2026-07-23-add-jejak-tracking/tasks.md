## 1. Schema & CMS config

- [ ] 1.1 Tambah collection `jejak` di `src/content.config.ts` (glob `*.mdoc` di `src/content/jejak`): `title`, `program` (string slug), `date`, `location`, `summary`, `metrics` (array `{label, value:number}`), `cover` (`.nullish()`), `gallery` (array `.nullish()`), `published` (default false); body via Markdoc
- [ ] 1.2 Daftarkan `jejak` di `collections` export
- [ ] 1.3 Tambah collection `jejak` di `keystatic.config.ts`: `slugField` pakai `fields.slug` (name = `title`, slug ikut konvensi `{program-slug}-YYYY-MM-DD` dengan `description` hint di admin), `format: { contentField: 'body' }` (`.mdoc`), `fields.relationship` ke `programs`, `fields.array` untuk `metrics` & `gallery`, `fields.image` cover/gallery upload ke `public/uploads/jejak`
- [ ] 1.4 Verifikasi ekstensi `.mdoc` sepakat antara kedua config (buka `/keystatic`, pastikan collection Jejak tidak listing nol entry)

## 2. Lib: data & agregasi

- [ ] 2.1 Buat `src/lib/jejak.ts` + tipe `Jejak`: `getJejak()` (published, terurut `date` desc), `getJejakByProgram(slug)`, `getJejakPages()` (published → dasar route/OG)
- [ ] 2.2 `getJejakByPintu(pintuId)` — muat `getPrograms()` sekali, map slug→pintu, filter jejak yang program-nya di pintu itu; keluarkan jejak dengan relasi program yatim
- [ ] 2.3 Buat `src/lib/impact.ts`: `getProgramImpact(slug)` & `getPintuImpact(pintuId)` — agregasi sum-by-label (normalisasi key trim+lowercase, simpan label asli), plus `jejakCount` & `programCount`
- [ ] 2.4 Unit test agregasi di `src/lib/` (pola `format.test.ts`): sum-by-label, exclude unpublished, exclude program yatim

## 3. Seed konten

- [ ] 3.1 Buat `src/content/jejak/jumat-berkah-YYYY-MM-DD.mdoc` (slug ikut konvensi `{program-slug}-YYYY-MM-DD`) dari Jumat Berkah nyata yang sudah berjalan; isi `title` display + `date` konsisten dengan slug, metrics, cover, galeri, body; taruh gambar di `public/uploads/jejak/`
- [ ] 3.2 Verifikasi `getJejakByProgram('jumat-berkah')` & `getPintuImpact('food')` mengembalikan angka yang benar

## 4. Halaman detail jejak

- [ ] 4.1 Buat `src/pages/jejak/[slug].astro` — `getStaticPaths` dari `getJejakPages()`; render hero (judul/tanggal/lokasi/badge program), baris metrics, galeri, body Markdoc, CTA ke program induk
- [ ] 4.2 Draft (`published:false`) tidak ter-route

## 5. Halaman rekam jejak per pintu

- [ ] 5.1 Buat `src/pages/berbagi/[category]/jejak.astro` — `getStaticPaths` dari `PINTU`; header counter agregat dari `getPintuImpact` (reuse script count-up Stats), galeri gabungan
- [ ] 5.2 Breakdown per-program: kartu tiap program (total metrik, jumlah jejak sebagai "× kali", badge warna pintu via `--cat`), tautan ke halaman program; urut menurut dampak
- [ ] 5.3 Keadaan kosong anggun bila pintu belum punya jejak

## 6. Integrasi permukaan existing

- [ ] 6.1 `src/pages/berbagi/[category].astro` — ganti `CATEGORY_CONTENT.stats` statis dengan `getPintuImpact` bila ada jejak, fallback ke statis; tambah teaser + tautan ke `/berbagi/[category]/jejak`
- [ ] 6.2 `src/pages/[program].astro` — tambah blok "Jejak {Program}" list `getJejakByProgram` + agregat program; sembunyikan bila kosong
- [ ] 6.3 Buat `src/components/JejakTerbaru.astro` (kartu N terbaru lintas pintu) dan mount di `src/pages/index.astro`; sembunyikan section bila belum ada jejak

## 7. OG & SEO

- [ ] 7.1 Extend `src/pages/open-graph/[...route].ts` agar meng-generate OG untuk route jejak
- [ ] 7.2 Tambah entry `seo.pages[]` (title/description) untuk `/jejak` & halaman rekam jejak pintu bila perlu; pastikan urutan resolve prop → `pages[]` → default tetap

## 8. Verifikasi

- [ ] 8.1 `bunx astro check` hijau
- [ ] 8.2 `bun test` hijau (termasuk test agregasi baru)
- [ ] 8.3 `bun run build` sukses; cek `/jejak/[slug]`, `/berbagi/makanan/jejak`, blok di `/jumat-berkah/`, section beranda, dan OG ter-generate
- [ ] 8.4 Buka `/keystatic` → tambah 1 jejak uji lewat admin, pastikan tertulis & terbaca
