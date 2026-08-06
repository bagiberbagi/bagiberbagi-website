# Tasks

> **Status 6 Agustus 2026: SELESAI, diarsipkan.** Kotak centang di bawah sempat
> berdiri kosong semua padahal pekerjaannya sudah live, jadi berkas ini pernah
> membaca "0 dari 33" dan itu menyesatkan. Sekarang tiap kotak diverifikasi ke
> kode dan ke situs live, bukan ke ingatan. Tiga baris sengaja dibiarkan
> terbuka, dan alasannya ditulis di tempatnya masing-masing.

Tiap track ditulis supaya bisa diserahkan utuh ke satu agent. Baca kolom "Wilayah berkas" di `proposal.md` sebelum menjalankan dua track sekaligus.

Aturan yang berlaku untuk semua track: satu agent satu worktree, jangan `git push` tanpa persetujuan pemilik, jangan menjalankan git di checkout utama `~/Developer/Project/bagiberbagi-website`, dan jangan pernah menambahkan trailer `Co-Authored-By`.

Gerbang selesai untuk track yang menyentuh kode: `bunx astro check` 0 error, `bun test` lulus, `bun run build` berhasil, dan `find dist/_astro dist/uploads -iname '*.png' | wc -l` mencetak 0.

---

## 0. Damaikan bentuk foto jejak dengan `main`

Basis `fix/seo-audit-findings`. **Kerjakan ini lebih dulu**: selama belum beres, branch SEO tak bisa merge dan `main` akan merah.

Latar: branch itu mengubah `jejak.cover` dan `jejak.gallery` dari `ImageMetadata` menjadi `JejakPhoto` (`{img, alt, caption}`). Kode organisasi yang masuk `main` belakangan masih membaca bentuk lama. Merge lolos tanpa konflik karena tak ada berkas yang sama disentuh, jadi kesalahannya baru muncul di `astro check` dan `build`.

- [x] 0.1 Merge `main` ke `fix/seo-audit-findings`, pastikan tak ada konflik teks
- [x] 0.2 `src/lib/organisasi.ts:85` — ubah `photos: ImageMetadata[]` jadi bentuk yang membawa alt, dan sesuaikan pengisinya di `:119-124` yang menyusun dari `j.cover` + `j.gallery`
- [x] 0.3 `src/components/OrganisasiCard.astro:100` dan `:115` — teruskan `.img` ke `<Image src>`
- [x] 0.4 `src/components/OrganisasiCard.astro:102` dan `:117` — ganti `alt=""` dengan alt foto yang kini tersedia; ini cacat yang sama dengan yang branch SEO ada untuk menghapusnya
- [x] 0.5 `src/pages/organisasi/[slug].astro:73` — `heroPhoto` ikut bentuk baru, dan `:253` meneruskan `.img`
- [x] 0.6 Jaga aturan pipeline gambar: dedup memakai identitas objek modul, jangan sekali pun membaca `img.src` di luar pipeline
- [x] 0.7 Jalankan gerbang selesai

## A. Dedup foto "pertama menang" dan penomoran yang sepakat

Basis `fix/seo-audit-findings`. Wilayahnya tak beririsan dengan Track 0, jadi boleh berjalan bersamaan di worktree lain.

- [x] A.1 `src/lib/jejak.ts` — ubah dedup jadi "pertama menang", mengikuti pola `seen`-Set
- [x] A.2 Tambah unit test untuk kasus cover yang kembar dengan salah satu entri galeri. Butuh langkah tambahan yang tak terduga saat menulis rencana ini: `jejak.ts` mengimpor `astro:content` di baris pertamanya, jadi apa pun yang serumah dengannya tak bisa diimpor `bun test` betapa pun murninya. `JejakPhoto` dan `dedupePhotos` karena itu pindah ke `src/lib/photos.ts` dan diekspor ulang, meniru pemisahan yang sudah dipakai `impact.ts`. Lima test baru di `src/lib/photos.test.ts`
- [ ] A.3 Selaraskan penomoran: alt menghitung cover+galeri (`src/lib/jejak.ts`), sementara `photoLabelOffset` di `src/pages/jejak/[slug].astro:77` menghitung yang benar-benar dirender. Pada jejak bervideo keduanya berbeda, sehingga tombol berbunyi "Buka foto 1" membungkus alt "foto 2". **MASIH TERBUKA, dan sengaja.** Tak ada yang rusak karena `aria-label` yang menang, dan sesudah semua alt diisi tangan (Track I) alt tak lagi memuat nomor sama sekali, jadi selisihnya tinggal soal kerapian dua konvensi
- [x] A.4 Jalankan gerbang selesai

## B. Lengkapi node `Organization`

Basis `main`. Berdiri sendiri.

- [x] B.1 Tambah `address` di `src/content/seo/seo.json` — Bogor, Jawa Barat, ID. Diisi pemilik 5 Agustus 2026
- [x] B.2 Tambah `contactPoint` — nomor WhatsApp dan email, diambil dari singleton `settings`. **`foundingDate` MASIH KOSONG dan sengaja dibiarkan begitu**: ia pernyataan fakta tentang lembaga, belum ada yang menyebut tanggalnya, dan menebaknya berarti menerbitkan data palsu yang dibaca mesin pencari sebagai kebenaran. Field-nya sudah ada di Keystatic, tinggal diisi
- [x] B.3 Ganti `logo` dari `/favicon/apple-touch-icon.png` ke logo yang memang logo. Sekarang menunjuk berkas yang sama dengan yang di-import Header dan Footer, lewat `resolveOrgLogo` di `src/lib/share-image.ts`, bukan salinan terpisah di `public/` yang akan basi diam-diam. Keluarannya webp 600px, 21 KB dari sumber 2522px 167 KB
- [x] B.4 Periksa hasilnya di `dist/index.html`

## C. Sitemap `lastmod`

- [x] C.1 Isi `lastmod` per URL lewat opsi `serialize` di `astro.config.mjs`, bersumber dari `date` entri jejak
- [x] C.2 Pastikan halaman statis yang jarang berubah tidak ikut mengaku baru setiap deploy
- [x] C.3 Periksa `dist/sitemap-0.xml` memuat `<lastmod>` dan tetap XML yang sah

## D. Rapikan `robots.txt`

- [x] D.1 **DIBATALKAN, bukan dikerjakan.** Dua blok `User-agent: *` itu bukan cacat: blok pertama sisipan terkelola Cloudflare, dan RFC 9309 §2.2.1 mewajibkan crawler menggabungkan grup bertoken sama, jadi `Disallow: /keystatic/` tetap berlaku. Mengutak-atiknya cuma menambah risiko tanpa hasil
- [x] D.2 Directive `Sitemap:` diperiksa, menunjuk `sitemap-index.xml`

## E. Alt hero beranda

- [x] E.1 **GUGUR karena berubahnya kenyataan.** `Hero.astro` tidak lagi punya foto sama sekali; latarnya sekarang gradasi CSS. Tidak ada gambar yang perlu diberi alt
- [x] E.2 Diperiksa di halaman live: 7 gambar di beranda, nol yang alt-nya kosong

## F. Pendekkan judul jejak yang terpotong

- [x] F.1 `jumat-berkah-2026-07-31-bogor` 84 → 67 → **60 karakter**. Kata "Asuhan" dibuang sekali, kedua nama panti tetap utuh karena itu yang dicari orang. Slug tak ikut berubah, jadi tak ada URL yang patah
- [x] F.2 `jumat-berkah-2026-07-31-dukuh-atas` kini 44 karakter
- [x] F.3 Peringatan panjang metadata dari `astro-seo-graph` bersih. Yang tersisa cuma `program/index.html`, dan itu stub redirect noindex yang memang tak punya judul sungguhan

## G. `llms.txt` jadi turunan data

- [x] G.1 `public/llms.txt` diganti endpoint `src/pages/llms.txt.ts`, isinya disusun dari `PINTU` dan koleksi `programs`
- [x] G.2 Bentuk keluarannya dipertahankan, kecuali angka jumlah pintu yang sengaja dibuang: angka itulah yang dulu basi
- [x] G.3 Berkas manualnya dihapus

## H. Putuskan sikap terhadap AI crawler

- [x] H.1 **DIPUTUSKAN 5 Agustus 2026: pertahankan apa adanya, dan `llms.txt` TETAP.** Pemeriksaan ulang ke `robots.txt` live menunjukkan gambarannya lebih halus dari yang ditulis saat rencana ini disusun. Yang diblokir semuanya crawler TRAINING (GPTBot, ClaudeBot, CCBot, Google-Extended, meta-externalagent, Amazonbot, Applebot-Extended, Bytespider). Yang tidak ada di daftar blokir: OAI-SearchBot, ChatGPT-User, Claude-SearchBot, PerplexityBot, yaitu crawler PENCARIAN. Jadi situs tetap bisa dikutip saat orang bertanya ke asisten AI, tanpa isinya dipakai melatih model, dan `llms.txt` tetap punya pembaca
- [x] H.2 Track G tetap relevan, tidak dibatalkan

## I. Isi alt dan caption foto (pekerjaan editor)

- [x] I.1 `caption` terisi untuk 23 foto di tiga entri jejak. Ditulis dari isi fotonya, bukan dari teks entri: tiap foto dibuka satu per satu
- [x] I.2 `alt` terisi untuk 23 foto yang sama. Penerima digambarkan lewat apa yang mereka lakukan atau kenakan, bukan dilabeli, sebab ini orang sungguhan di halaman publik
- [ ] I.3 Saat mengunggah foto baru, beri nama berkas yang deskriptif. Astro mempertahankan nama asli di URL keluaran, jadi nama yang dipilih saat unggah ikut terbaca mesin pencari. **Tetap terbuka karena ini kebiasaan, bukan tugas yang bisa ditutup.** Berkas yang sudah ada sengaja tidak diganti namanya: itu berarti menulis ulang tiap path di frontmatter demi hasil yang gratis didapat pada unggahan berikutnya

---

## Yang sudah selesai, jangan dikerjakan ulang

- Alt foto jejak di kartu, hero detail, carousel, galeri gabungan, poster video, dan lightbox — `fix/seo-audit-findings`
- Field `alt`/`caption` di Keystatic dan zod, plus migrasi tiga entri konten — `fix/seo-audit-findings`
- `ImageObject` di graph halaman jejak dan `/sitemap-images.xml` — `fix/seo-audit-findings`
- `llms.txt`: jumlah pintu dan URL program yang 404 — `fix/seo-audit-findings`
- Halaman `sample-pintu` yang terbit ke produksi — sudah dihapus di `main` (`a262c95`)
- `/organisasi/` yang yatim tanpa tautan masuk — sudah ditautkan di `main`
- TLS di origin, ruas Cloudflare→VPS yang dulu polos — `deploy/RUNBOOK-tls-origin.md`, dieksekusi 4 Agustus 2026

## Temuan yang diperiksa lalu ditolak

Enam temuan dari review adversarial, lima gugur setelah ditantang dua peninjau independen. Dicatat di sini supaya tidak diangkat lagi sebagai temuan baru.

- `representativeOfPage` menandai foto yang salah — keliru baca, foto pertama memang foto pembuka
- `ImageObject` menggantung dari `WebPage` — node lepas di `@graph` itu sah, `VideoObject` yang sudah ada pun begitu
- Caption tak terbaca pembaca layar — `figcaption` di dalam `figure` memang sudah terbaca
- Dokumen `.claude/rules/` masih menyebut foto sebagai string — ternyata tidak menyatakan bentuk itu
- URL `customSitemaps` menduplikasi `site` — hardcoded, tapi tak punya jalur kegagalan
- FAQ schema di `/faq/` — Google menghentikan hasil kaya FAQ untuk semua situs pada 7 Mei 2026, jadi markup itu tak lagi menghasilkan tampilan khusus. Tidak perlu dihapus, tidak perlu ditambah di halaman lain

## Ketidakcocokan data yang ditemukan, dan sengaja tidak diperbaiki sendiri

Ditemukan saat membaca foto satu per satu untuk Track I. Ini soal catatan pemilik tentang kegiatannya sendiri, jadi bukan tempat kode menebak.

- `jumat-berkah-2026-07-17` menulis `location: Baranangsiang, Bogor`, tapi watermark GPS pada foto ke-7 dan ke-8 menyebut **Tegallega, Kecamatan Bogor Tengah**, sekitar 570 m dari masjidnya
- Entri yang sama menceritakan pembagian di jalan sebagai lanjutan **seusai** salat Jumat, sementara stempel waktu foto jalanan itu **10.33 dan 10.38**, sedangkan foto di masjid 12.38
