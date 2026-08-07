## 1. Schema & CMS config: organisasi + field jejak baru

- [x] 1.1 Tambah collection `organisasi` di `src/content.config.ts` (glob `*.yaml` di `src/content/organisasi`): `label`, `logo` (`.nullish()`), `summary`, `detail{description, since, instagram, website}` (instagram/website optional), `active`
- [x] 1.2 Daftarkan `organisasi` di `collections` export
- [x] 1.3 Tambah field `organisasi` (string nullish, relationship) dan `reportPdf` (string nullish) di schema `jejak` (`content.config.ts`)
- [x] 1.4 Tambah collection `organisasi` di `keystatic.config.ts`: `slugField` pakai `fields.slug` dari `label`, `fields.image` untuk logo (upload ke `public/uploads/organisasi`), field teks untuk `detail`
- [x] 1.5 Tambah `fields.relationship` (`organisasi`, opsional, target collection `organisasi`) dan `fields.file` (`reportPdf`, opsional, upload ke `public/uploads/jejak-reports/`) di collection `jejak` di `keystatic.config.ts`
- [x] 1.6 Verifikasi ekstensi & field selaras antara `content.config.ts` dan `keystatic.config.ts` (buka `/keystatic`, pastikan collection Organisasi listing dan form Jejak menampilkan 2 field baru) — **verified mechanically on 7 August 2026, which is the half that carries the risk.** `content.config.ts:220` globs `*.yaml` under `src/content/organisasi`; `keystatic.config.ts:672-673` writes `src/content/organisasi/*` with `format: { data: 'yaml' }`. They agree, so the documented failure mode (admin lists zero entries while the site renders fine) cannot occur. The image side also agrees after Track B of `fix-mobile-ergonomics`: `publicPath: '/src/assets/organisasi/'` matches the eager glob key shape in `organisasi.ts`.

      **Note that 1.4 above is now stale**: it says the logo uploads to `public/uploads/organisasi`, and that is no longer true. The first real upload was 1079×979 and 66 KB served identically into a 44px box, so Track B moved it to `src/assets/organisasi/` and through `astro:assets`. The task text is left as written rather than edited, because it records what was decided then.

      What is still untouched by anyone's eyes: whether the admin form *looks* right. That needs your GitHub session and is listed in STATUS.md.

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
- [x] 9.4 Buka `/keystatic` → tambah 1 organisasi uji dan atribusikan 1 jejak ke situ, pastikan dashboard dampak organisasi menghitung benar — **discharged by production, not by a test entry.** Written when the only evidence available was a temporary fixture, because Keystatic's `storage: cloud` needs a real GitHub session. Since then a real organisasi has gone through the whole path: `46cyclist.yaml` exists, `jumat-berkah-2026-07-31-dukuh-atas.mdoc` is attributed to it, and `/organisasi/46cyclist/` renders its dashboard live.

      The upload path is demonstrated too, and by the strongest available evidence: the logo the editor actually uploaded arrived at 1079×979 and 66 KB, which is what exposed the `public/uploads` mistake in the first place. It now serves as `/_astro/46cyclist.*.webp` with a `srcset`, rendered into a 72px box — so Keystatic's `publicPath` stripping, the eager glob key shape, and `astro:assets` all agree on a file a human put there through the form.

      What no one has checked is whether the form *looks* right while being filled in. That is a look, not a behaviour, and it stays in STATUS.md.
