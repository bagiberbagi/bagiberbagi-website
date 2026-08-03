## Why

Audit SEO menyeluruh atas bagiberbagi.id (4 Agustus 2026) memberi skor 74/100 dan menemukan sepuluh hal yang layak dikerjakan. Empat di antaranya sudah selesai di branch `fix/seo-audit-findings` (alt foto jejak, `llms.txt` basi, field `alt`/`caption` untuk foto, `ImageObject` + sitemap gambar), dua diselesaikan sesi lain (`sample-pintu` dihapus, `/organisasi/` ditautkan). Sisanya belum tersentuh dan tercecer di percakapan, bukan di repo.

Ada satu hal yang lebih mendesak daripada sisa temuan itu. Branch `fix/seo-audit-findings` mengubah bentuk foto jejak dari `ImageMetadata` jadi `JejakPhoto`, sementara `main` sudah maju 22 commit dengan kode organisasi yang masih membaca bentuk lama. Merge-nya lolos tanpa konflik karena kedua sisi tak menyentuh berkas yang sama, tapi `astro check` menghasilkan 2 error dan `bun run build` berhenti di `/organisasi/46cyclist`. `main` adalah branch deploy, jadi merge dalam keadaan sekarang membuat produksi gagal terbit. Ini sudah diverifikasi lewat merge percobaan, bukan dugaan.

Dokumen ini mengumpulkan semuanya jadi satu daftar yang bisa dibagi ke beberapa pengerjaan paralel tanpa saling menimpa.

## What Changes

- **Damaikan bentuk foto jejak dengan `main`** supaya branch SEO bisa merge tanpa merah. Termasuk mengisi `alt` foto lapangan di kartu organisasi, yang kebetulan cacat yang sama dengan yang branch itu perbaiki.
- **Perbaiki dedup foto** di `getJejakMedia` agar "pertama menang", supaya `alt`/`caption` yang ditulis di cover tak tertimpa entri galeri.
- **Selaraskan penomoran foto** antara alt dan label tombol pada jejak bervideo.
- **Perkaya node `Organization`**: alamat, contactPoint, tanggal berdiri, dan logo yang layak.
- **Tambah `lastmod` di sitemap**, karena kebaruan dokumentasi adalah nilai jual situs ini.
- **Jadikan `llms.txt` turunan data**, bukan berkas tulis tangan yang pasti basi lagi.
- **Rapikan `robots.txt`** yang punya dua blok `User-agent: *`.
- **Isi alt hero beranda** yang selama ini kosong.
- **Pendekkan dua judul jejak** yang terpotong di hasil pencarian.
- **Putuskan sikap terhadap AI crawler.** Cloudflare memblokir GPTBot, ClaudeBot, CCBot, Google-Extended, dan meta-externalagent, sementara situs menerbitkan `llms.txt` untuk mereka. Dua hal itu bertolak belakang dan hanya pemilik yang bisa memutuskan.

## Capabilities

### Modified Capabilities

- `seo-essentials` — sitemap `lastmod`, node `Organization` yang lengkap, `robots.txt` yang tidak berulang, panjang judul yang muat di SERP.
- `content-cms` — bentuk foto jejak (`image`/`alt`/`caption`) merambat ke konsumen organisasi.

## Impact

- **Kode**: `src/lib/organisasi.ts`, `src/components/OrganisasiCard.astro`, `src/pages/organisasi/[slug].astro`, `src/lib/jejak.ts`, `src/pages/jejak/[slug].astro`, `src/components/Hero.astro`, `astro.config.mjs`, `src/content/seo/seo.json`, `public/robots.txt`, `public/llms.txt` (jadi endpoint).
- **Konten**: dua entri `src/content/jejak/*.mdoc` (judul), dan pengisian `alt`/`caption` foto oleh editor lewat Keystatic.
- **Di luar repo**: setelan AI crawler di dashboard Cloudflare.
- **Risiko utama**: Track 0 menyentuh berkas milik pekerjaan organisasi yang baru saja masuk `main`. Kerjakan lebih dulu, sendirian, sebelum track lain yang menyentuh foto jejak.

## Parallelisation

Tiap track punya basis dan wilayah berkas sendiri supaya beberapa agent bisa jalan bersamaan tanpa menimpa. Angka file di kolom ketiga adalah wilayah eksklusif track itu.

| Track | Basis | Wilayah berkas | Bisa jalan bareng |
|---|---|---|---|
| **0. Damaikan foto dengan main** | `fix/seo-audit-findings` | `lib/organisasi.ts`, `OrganisasiCard.astro`, `organisasi/[slug].astro` | Ya, dengan A sampai F |
| **A. Dedup & penomoran foto** | `fix/seo-audit-findings` | `lib/jejak.ts`, `jejak/[slug].astro` | Ya |
| **B. Node Organization** | `main` | `src/content/seo/seo.json` | Ya |
| **C. Sitemap lastmod** | `main` | `astro.config.mjs` | Ya, tapi lihat catatan |
| **D. robots.txt** | `main` | `public/robots.txt` | Ya |
| **E. Alt hero beranda** | `main` | `src/components/Hero.astro` | Ya |
| **F. Judul jejak** | `main` | `src/content/jejak/*.mdoc` | Tidak dengan Track 0 |
| **G. llms.txt jadi turunan** | setelah SEO merge | `public/llms.txt` → `src/pages/llms.txt.ts` | Tidak, tunggu merge |
| **H. Keputusan AI crawler** | tanpa kode | dashboard Cloudflare | Ya |

Tiga catatan yang menentukan urutan:

**Track 0 dan A dua-duanya berdiri di atas `fix/seo-audit-findings`,** tapi wilayah berkasnya tak beririsan sama sekali, jadi aman dikerjakan di dua worktree lalu digabung. Yang tak boleh adalah dua agent menulis di satu worktree.

**Track C dan G menyentuh berkas yang sudah diubah branch SEO** (`astro.config.mjs` dan `public/llms.txt`). Kalau branch itu belum merge, kerjakan keduanya di atasnya, bukan di atas `main`, atau tunggu.

**Track F menyentuh berkas `.mdoc` yang sama dengan yang dimigrasi branch SEO.** Kalau branch itu belum merge, konfliknya pasti. Tunggu, atau kerjakan di atas branch tersebut.

Sisanya (B, D, E, H) benar-benar lepas satu sama lain dan bisa dilempar bersamaan ke `main` kapan saja.
