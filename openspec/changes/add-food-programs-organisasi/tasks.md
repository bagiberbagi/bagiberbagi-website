## 1. Schema & CMS config: organisasi + field jejak baru

- [x] 1.1 Tambah collection `organisasi` di `src/content.config.ts` (glob `*.yaml` di `src/content/organisasi`): `label`, `logo` (`.nullish()`), `summary`, `detail{description, since, instagram, website}` (instagram/website optional), `active`
- [x] 1.2 Daftarkan `organisasi` di `collections` export
- [x] 1.3 Tambah field `organisasi` (string nullish, relationship) dan `reportPdf` (string nullish) di schema `jejak` (`content.config.ts`)
- [x] 1.4 Tambah collection `organisasi` di `keystatic.config.ts`: `slugField` pakai `fields.slug` dari `label`, `fields.image` untuk logo (upload ke `public/uploads/organisasi`), field teks untuk `detail`
- [x] 1.5 Tambah `fields.relationship` (`organisasi`, opsional, target collection `organisasi`) dan `fields.file` (`reportPdf`, opsional, upload ke `public/uploads/jejak-reports/`) di collection `jejak` di `keystatic.config.ts`
- [ ] 1.6 Verifikasi ekstensi & field selaras antara `content.config.ts` dan `keystatic.config.ts` (buka `/keystatic`, pastikan collection Organisasi listing dan form Jejak menampilkan 2 field baru) — **belum bisa dicentang oleh saya**, sama seperti 9.4: `/keystatic` mentok di gate login GitHub Keystatic Cloud yang butuh sesi kamu. `bunx astro check` sudah memastikan kedua config type-safe dan `format`/ekstensinya (`data: 'yaml'` untuk organisasi) konsisten dengan `content.config.ts`, tapi kecocokan visual form admin itu sendiri belum tersentuh mata.

## 2. Lib: agregasi organisasi

- [x] 2.1 Buat `src/lib/organisasi.ts` untuk `getOrganisasi()`/`getOrganisasiPages()`, meniru pola `src/lib/programs.ts`
- [x] 2.2 Tambah `getJejakByOrganisasi(organisasiSlug)` di `src/lib/jejak.ts`, meniru `getJejakByProgram`; keluarkan jejak dengan relasi organisasi yatim (organisasi terhapus/inactive)
- [x] 2.3 Tambah `getOrganisasiImpact(organisasiSlug)` di `src/lib/impact.ts`, agregasi sum-by-label lintas seluruh jejak organisasi itu (lintas program), meniru `getProgramImpact`
- [x] 2.4 Unit test agregasi baru: sum-by-label lintas program berbeda, exclude organisasi yatim/inactive

## 3. Halaman organisasi

- [x] 3.1 Buat `src/pages/organisasi/index.astro` — daftar organisasi ber-halaman (active + description terisi); render empty state sopan bila belum ada organisasi aktif
- [x] 3.2 Buat `src/pages/organisasi/[slug].astro` — `getStaticPaths` dari organisasi ber-halaman; render profil (logo, deskripsi, sejak kapan), dashboard dampak agregat (`getOrganisasiImpact`), daftar rekam jejak (`getJejakByOrganisasi`), meniru struktur section "Rekam Jejak" yang sudah ada di `program/[program].astro`
- [x] 3.3 CTA ajak organisasi lain bergabung di halaman index dan/atau detail

## 4. Konten program baru

- [x] 4.1 Buat `src/content/programs/community-giving.yaml` (pintu: food, active: true, detail lengkap, paket custom)
- [x] 4.2 Buat `src/content/programs/csr-food-program.yaml` (pintu: food, active: true, detail lengkap, paket custom)
- [x] 4.3 Cek apakah slug `ramadhan-berkah` sempat publik/terindeks; kalau aman, rename file jadi `ramadhan-berbagi.yaml`, ubah `label` jadi "Ramadhan Berbagi", isi `detail` lengkap (3 paket: Sahur/Takjil/Buka Puasa), set `active: true`

## 5. CTA bercabang di halaman program

- [x] 5.1 Di `src/pages/program/[program].astro`, tambah percabangan CTA berdasar slug program: self-serve (Jumat Berkah, Ramadhan Berbagi) vs inquiry (Community Giving, CSR Food Program)
- [x] 5.2 Untuk varian inquiry, ganti panel harga fixed dengan tombol WA "Diskusikan Program {label}" (reuse pola `buildWaLink` yang sudah ada)
- [x] 5.3 Untuk Ramadhan Berbagi, tambah selector paket (Sahur/Takjil/Buka Puasa) sebelum tombol donasi; pastikan pesan WA yang terbentuk menyebut paket yang dipilih

## 6. Attachment PDF di halaman jejak

- [x] 6.1 Di `src/pages/jejak/[slug].astro`, render tombol unduh (mis. "Unduh Laporan (PDF)") bila `jejak.reportPdf` terisi, sembunyikan section-nya bila kosong

## 7. OG & SEO

- [x] 7.1 Extend `src/pages/open-graph/[...route].ts` agar meng-generate OG untuk halaman program baru dan halaman organisasi (program baru sudah otomatis lewat `getProgramPages()` yang sudah generic; organisasi ditambah blok `organisasiPages` baru)
- [x] 7.2 Tambah entri `seo.pages[]` untuk `/organisasi/` bila perlu — tidak perlu: mengikuti pola `/jejak/` (index statis lain tanpa entri `seo.pages[]`), title/description sudah eksplisit lewat props `BaseLayout`, OG image jatuh ke `defaultImage`

## 8. Dokumentasi

- [x] 8.1 Update `.claude/rules/routing-taxonomy.md`: tambahkan organisasi sebagai entity lateral baru (menempel ke jejak, bukan ke program/pintu), deskripsikan route `/organisasi/` dan `/organisasi/[slug]`
- [x] 8.2 Update `.claude/rules/content-model.md`: tambahkan collection `organisasi` dan 2 field baru di `jejak`

## 9. Verifikasi

- [x] 9.1 `bunx astro check` hijau
- [x] 9.2 `bun test` hijau (termasuk test agregasi baru)
- [x] 9.3 `bun run build` sukses; cek `/organisasi/`, `/organisasi/[slug]` (pakai entri uji), `/program/community-giving/`, `/program/csr-food-program/`, `/program/ramadhan-berbagi/`, tombol unduh PDF di jejak uji, dan OG ter-generate untuk semuanya — diverifikasi dengan entri organisasi + jejak uji sementara (dihapus lagi setelah verifikasi), lewat `dist/` grep dan Playwright (klik paket "Takjil" di Ramadhan Berbagi mengubah pesan WA dengan benar). Ketemu regresi SEO di tengah jalan: `program/[program].astro` tak pernah kirim `title`/`description` eksplisit ke `BaseLayout`, jadi 3 program baru jatuh ke title/description default situs (duplikat). Diperbaiki: kirim title/description turunan `program.label`/`summary`, tapi tetap kalah dari entri kurasi `seo.pages[]` kalau ada (jaga copy Jumat Berkah yang sudah dikurasi manual tak tertimpa).
- [ ] 9.4 Buka `/keystatic` → tambah 1 organisasi uji dan atribusikan 1 jejak ke situ, pastikan dashboard dampak organisasi menghitung benar — **belum bisa dicentang oleh saya**: Keystatic pakai `storage: cloud` yang butuh login GitHub asli (dicoba, mentok di gate "Log in with Keystatic Cloud"). Logika yang sama sudah diverifikasi lewat file konten langsung (lihat 9.3), jadi cuma UI form admin Keystatic-nya yang belum tersentuh — cek manual sekali lewat `/keystatic` setelah branch ini di-merge/dijalankan di mesinmu.
