## Why

Pintu Berbagi Makanan baru punya satu program aktif (Jumat Berkah, self-serve fixed-price), padahal ada tiga skema donasi lain yang sudah lama berjalan di luar situs (Community Giving, CSR Food Program, Ramadhan Berbagi), dan komunitas/perusahaan yang memberi secara rutin (mis. 46Cyclist) tidak punya tempat menampilkan rekam jejak dan dampak kumulatif mereka sendiri — semuanya numpuk anonim di balik satu angka pintu. Godok panjang bareng user menghasilkan rancangan solid untuk kedua kebutuhan ini sekaligus.

## What Changes

- **3 entri baru di collection `programs`** (schema tidak berubah): Community Giving, CSR Food Program (keduanya pintu `food`, paket custom/negosiasi), dan reaktivasi + rename entri lama `ramadhan-berkah.yaml` menjadi **Ramadhan Berbagi** (paket fixed, 3 pilihan: Sahur/Takjil/Buka Puasa).
- **Varian CTA di `program/[program].astro`**: program berpaket custom (Community Giving, CSR Food Program) dapat tombol WA "Diskusikan Program", menggantikan panel harga fixed Rp 25.000/pax; Ramadhan Berbagi tetap self-serve tapi butuh selector paket dulu sebelum tombol donasi.
- **Collection baru `organisasi`** — donor institusional yang memberi rutin (komunitas atau perusahaan, satu schema, sengaja tanpa subtipe karena strukturnya identik) dapat entri sendiri: label, logo, summary, `detail{description, since, instagram/website}`, `active`. Pola publish sama seperti `programs` (`active` + `description` terisi baru dapat halaman).
- **2 field baru di collection `jejak`**: `organisasi` (relationship opsional, sengaja lateral terhadap `program`, bukan field di dalamnya, supaya satu organisasi yang jejaknya lintas program tetap teragregasi jadi satu dashboard) dan `reportPdf` (`fields.file` opsional, upload manual ke `public/uploads/jejak-reports/`, tanpa auto-generate PDF).
- **Route baru** `/organisasi/` (index daftar organisasi aktif) dan `/organisasi/[slug]` (profil + dashboard dampak agregat + rekam jejak, meniru pola section "Rekam Jejak" yang sudah ada di halaman program).
- **Lib baru** `getJejakByOrganisasi` (`jejak.ts`) dan `getOrganisasiImpact` (`impact.ts`), paralel persis ke `getJejakByProgram`/`getProgramImpact` yang sudah ada.
- **OG image** `open-graph/[...route].ts` diperluas untuk halaman program dan organisasi baru.

## Capabilities

### New Capabilities
- `organisasi-directory`: entitas Organisasi, donor institusional (komunitas/perusahaan) yang memberi rutin lintas program, dengan collection, index, dan halaman detail berisi dashboard dampak agregat serta rekam jejak, didukung field relationship `jejak.organisasi` dan attachment `jejak.reportPdf`.
- `program-donation-cta`: cabang CTA di halaman program antara self-serve (harga tetap, dengan/tanpa selector paket) dan inquiry (diskusi custom via WhatsApp), berdasarkan sifat paket programnya.

### Modified Capabilities
- `content-cms`: model editor Keystatic bertambah satu collection baru (`organisasi`), dan collection `jejak` bertambah dua field opsional (`organisasi`, `reportPdf`).

## Impact

- **Konten baru**: `src/content/organisasi/*.yaml`, `src/content/programs/community-giving.yaml`, `src/content/programs/csr-food-program.yaml`; `src/content/programs/ramadhan-berkah.yaml` di-rename/diisi ulang jadi Ramadhan Berbagi; `public/uploads/jejak-reports/`.
- **Config**: `src/content.config.ts` (collection `organisasi` baru + field baru di `jejak`), `keystatic.config.ts` (harus selaras).
- **Lib baru**: fungsi baru di `src/lib/jejak.ts` dan `src/lib/impact.ts`.
- **Route baru**: `src/pages/organisasi/index.astro`, `src/pages/organisasi/[slug].astro`.
- **Route diubah**: `src/pages/program/[program].astro` (blok CTA bercabang).
- **OG/SEO**: `src/pages/open-graph/[...route].ts`, kemungkinan entri `seo.pages[]` untuk `/organisasi/`.
- **Dokumentasi**: `.claude/rules/routing-taxonomy.md` perlu update pasca-implementasi karena organisasi jadi entity lateral baru (menempel ke jejak, bukan ke program atau pintu).
