# Status per 4 Agustus 2026, 04:05

Ditulis sesudah satu sesi kerja otonom. **Tujuh dari sembilan track selesai** dan
ada di branch `fix/seo-audit-findings` (17 commit, belum di-push). Satu track
dibatalkan karena premisnya keliru. Sisanya butuh keputusan atau akses yang tidak
dimiliki proses build.

Sesi ini juga menjalankan `/seo technical` atas situs live, yang menghasilkan
temuan baru di luar daftar semula. Temuan itu ikut dicatat di bawah.

## Selesai

| Track | Hasil | Commit |
|---|---|---|
| **0. Damaikan foto dengan main** | Merge `main`, migrasi `organisasi.ts` + `OrganisasiCard` + halaman detail ke bentuk `JejakPhoto`. Blocker CI hilang. Alt kolase dan logo organisasi ikut terisi. | `789ea6d` |
| **A. Dedup foto** | `dedupePhotos()` jadi satu sumber, aturan "pertama menang". Tiga salinan logika yang sudah menyimpang digabung. | `8bf215c` |
| **B. Node Organization** | `contactPoint` WhatsApp masuk graph. `address` + `foundingDate` disiapkan di schema dan Keystatic tapi **sengaja dibiarkan kosong**, lihat di bawah. | `eecb26c` |
| **C. Sitemap lastmod** | Hanya URL jejak, dari tanggal frontmatter. 3 dari 22 URL. | `7984d32` |
| **E. Alt hero beranda** | Selesai lewat perbaikan `DonationCard`: alt terisi, plus `srcset` 4 lebar dan `fetchpriority="high"` karena ia kandidat LCP. | `4b416bd` |
| **F. Judul terpotong** | Judul jejak panjang berdiri tanpa suffix merek (84 → 67 karakter). Judul organisasi yang terlalu pendek dapat deskriptor. | `34d45b1` |
| **G. llms.txt turunan** | Jadi endpoint yang menyusun isinya dari `PINTU` + koleksi `programs`. Berkas manual dihapus. | `52b45ca` |

Ditambah, dari audit teknis:

| Temuan | Hasil | Commit |
|---|---|---|
| Breadcrumb program menunjuk stub noindex | JSON-LD kini mengikuti breadcrumb yang dilihat pengunjung (lewat pintu, bukan `/program/`). Prop `breadcrumbTrail` baru di BaseLayout. | `9888df8` |
| Dokumen aturan tak lagi cocok dengan kode | Tiga klaim di `.claude/rules/` dan satu komentar di `astro.config.mjs` dibetulkan. | `bedca56` |
| Config nginx + langkah infra | Config diperbarui di repo, plus `deploy/RUNBOOK-infra-seo.md`. **Belum diterapkan ke VPS.** | `5a1187c` |

## Dibatalkan

**Track D, rapikan `robots.txt`.** Premisnya keliru. Berkas di repo sudah benar;
duplikasi `User-agent: *` adalah sisipan terkelola Cloudflare, dan RFC 9309
§2.2.1 mewajibkan crawler menggabungkan grup dengan token yang sama. Aturan
efektif untuk Googlebot tetap `Allow: /` plus `Disallow: /keystatic/`. Tidak ada
yang perlu dikerjakan, dan mengubahnya justru berisiko.

## Masih terbuka

**Infrastruktur, butuh dashboard Cloudflare dan shell VPS.** Langkah lengkap ada
di `deploy/RUNBOOK-infra-seo.md`, berurutan dan dengan cara verifikasi serta
rollback tiap langkah. Ringkasnya:

1. `http://www.bagiberbagi.id` melayani seluruh situs tanpa TLS, status 200.
   Apex sudah benar, www tidak. Satu toggle: **Always Use HTTPS**.
2. HSTS, dan hanya setelah nomor 1 terbukti hijau.
3. Terapkan config nginx (webp masuk daftar cache, HTML dapat `Cache-Control`).
4. Purge Cloudflare tiap deploy, karena HTML mulai di-cache di edge.

**Track H, sikap terhadap AI crawler.** Belum dijawab, dan jawabannya menentukan
apakah `llms.txt` yang baru dibangun itu berguna atau justru harus dihapus.

**Track I, pengisian alt dan caption oleh editor.** Kotaknya sudah ada di
Keystatic. Yang kosong jatuh ke kalimat turunan judul, jadi tidak ada yang rusak
kalau dilewati, tapi `caption` tidak punya pengganti otomatis dan itulah yang
paling menambah nilai halaman.

**`address` dan `foundingDate` organisasi.** Field-nya sudah ada di Keystatic,
sengaja kosong. Keduanya masuk JSON-LD sebagai pernyataan fakta tentang lembaga,
jadi mengisinya dengan tebakan berarti menerbitkan data palsu. Hanya pemilik yang
tahu jawabannya.

## Sisa temuan audit teknis yang tidak dikerjakan, dengan alasannya

- **Body copy 14px** pada jawaban FAQ dan deskripsi program. Keterbacaan, bukan
  kegagalan mobile-friendliness. Viewport benar dan tidak ada halaman yang
  menggulir mendatar di 360px. Perubahan tipografi butuh mata pemilik.
- **`VideoObject.embedUrl` menunjuk pratinjau Google Drive** yang mengirim
  `x-robots-tag: noindex, nofollow, nosnippet`, sehingga video rich result tidak
  mungkin terjadi. Ini operasional, memindahkan video ke penyedia lain, bukan bug
  kode. Sudah terdokumentasi di `src/lib/schema.ts`.
- **`/program` telanjang** adalah 301-ke-slash lalu stub meta-refresh. Itu
  perilaku terdokumentasi Astro untuk `output: 'static'` tanpa adapter. Nol
  tautan internal menunjuk ke sana, tidak ada di sitemap, dan ia `noindex`.
  Setelah breadcrumb dibetulkan, tidak ada lagi yang merujuknya.
- **Core Web Vitals lapangan** tidak terukur. Tidak ada API key CrUX atau
  PageSpeed, jadi klaim LCP di atas adalah inferensi dari posisi dan ukuran,
  bukan paint yang teramati. Mengukurnya butuh API key atau 28 hari data Search
  Console.
