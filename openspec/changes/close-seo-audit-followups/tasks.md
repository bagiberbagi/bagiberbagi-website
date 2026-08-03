# Tasks

Tiap track ditulis supaya bisa diserahkan utuh ke satu agent. Baca kolom "Wilayah berkas" di `proposal.md` sebelum menjalankan dua track sekaligus.

Aturan yang berlaku untuk semua track: satu agent satu worktree, jangan `git push` tanpa persetujuan pemilik, jangan menjalankan git di checkout utama `~/Developer/Project/bagiberbagi-website`, dan jangan pernah menambahkan trailer `Co-Authored-By`.

Gerbang selesai untuk track yang menyentuh kode: `bunx astro check` 0 error, `bun test` lulus, `bun run build` berhasil, dan `find dist/_astro dist/uploads -iname '*.png' | wc -l` mencetak 0.

---

## 0. Damaikan bentuk foto jejak dengan `main`

Basis `fix/seo-audit-findings`. **Kerjakan ini lebih dulu**: selama belum beres, branch SEO tak bisa merge dan `main` akan merah.

Latar: branch itu mengubah `jejak.cover` dan `jejak.gallery` dari `ImageMetadata` menjadi `JejakPhoto` (`{img, alt, caption}`). Kode organisasi yang masuk `main` belakangan masih membaca bentuk lama. Merge lolos tanpa konflik karena tak ada berkas yang sama disentuh, jadi kesalahannya baru muncul di `astro check` dan `build`.

- [ ] 0.1 Merge `main` ke `fix/seo-audit-findings`, pastikan tak ada konflik teks
- [ ] 0.2 `src/lib/organisasi.ts:85` — ubah `photos: ImageMetadata[]` jadi bentuk yang membawa alt, dan sesuaikan pengisinya di `:119-124` yang menyusun dari `j.cover` + `j.gallery`
- [ ] 0.3 `src/components/OrganisasiCard.astro:100` dan `:115` — teruskan `.img` ke `<Image src>`
- [ ] 0.4 `src/components/OrganisasiCard.astro:102` dan `:117` — ganti `alt=""` dengan alt foto yang kini tersedia; ini cacat yang sama dengan yang branch SEO ada untuk menghapusnya
- [ ] 0.5 `src/pages/organisasi/[slug].astro:73` — `heroPhoto` ikut bentuk baru, dan `:253` meneruskan `.img`. Alt di sini sudah terisi (`Dokumentasi kegiatan bersama <organisasi>`), jadi cukup diputuskan apakah alt foto itu sendiri lebih baik dipakai ketimbang kalimat umum tersebut
- [ ] 0.6 Jaga aturan pipeline gambar: dedup dan perbandingan memakai identitas objek modul, jangan sekali pun membaca `img.src` di luar pipeline (lihat `.claude/rules/image-pipeline.md`). Mengakses `.img` pada pembungkus `JejakPhoto` aman, karena itu properti pembungkus, bukan pembacaan pada modul gambarnya
- [ ] 0.7 Jalankan gerbang selesai, plus buka `/organisasi/` dan `/organisasi/46cyclist/` di dev server untuk memastikan kolase fotonya utuh

## A. Dedup foto "pertama menang" dan penomoran yang sepakat

Basis `fix/seo-audit-findings`. Wilayahnya tak beririsan dengan Track 0, jadi boleh berjalan bersamaan di worktree lain.

- [ ] A.1 `src/lib/jejak.ts:263` — `new Map([...].map(p => [p.img, p]))` menyimpan nilai entri terakhir untuk kunci kembar sambil mempertahankan posisi entri pertama. Akibatnya, kalau satu foto dipasang sebagai cover sekaligus muncul di galeri, foto pembuka memakai `alt`/`caption` milik entri galeri. Ubah jadi "pertama menang", mengikuti pola `seen`-Set yang sudah dipakai di `src/pages/jejak/index.astro:75-83`
- [ ] A.2 Tambah unit test untuk kasus cover yang kembar dengan salah satu entri galeri
- [ ] A.3 Selaraskan penomoran: alt menghitung cover+galeri (`src/lib/jejak.ts`), sementara `photoLabelOffset` di `src/pages/jejak/[slug].astro:68` menghitung yang benar-benar dirender. Pada jejak bervideo keduanya berbeda, sehingga tombol berbunyi "Buka foto 1" membungkus alt "foto 2". Tidak merusak apa pun karena `aria-label` yang menang, tapi dua konvensi ini sebaiknya sepakat
- [ ] A.4 Jalankan gerbang selesai

## B. Lengkapi node `Organization`

Basis `main`. Berdiri sendiri.

Node `NGO` sekarang hanya memuat `name`, `url`, `logo`, `description`, `email`, `sameAs`.

- [ ] B.1 Tambah `address` (minimal `addressLocality` + `addressCountry`) di `src/content/seo/seo.json`
- [ ] B.2 Tambah `contactPoint` dan `foundingDate`
- [ ] B.3 Ganti `logo` dari `/favicon/apple-touch-icon.png` ke logo yang memang logo (`logo-horizontal-color`), pastikan URL-nya absolut di keluaran JSON-LD
- [ ] B.4 Periksa hasilnya di `dist/index.html`: JSON-LD tetap terurai, dan nilai-nilai baru muncul di node `NGO`

## C. Sitemap `lastmod`

Basis `main`, **tapi** `astro.config.mjs` juga disentuh branch SEO. Kalau branch itu belum merge, kerjakan di atasnya.

- [ ] C.1 Isi `lastmod` per URL lewat opsi `serialize` di `astro.config.mjs`. Untuk halaman jejak, sumber tanggal paling jujur adalah `date` entri itu sendiri, bukan waktu build, karena waktu build berubah tiap deploy dan membuat seluruh sitemap terlihat baru
- [ ] C.2 Pastikan halaman statis yang jarang berubah tidak ikut mengaku baru setiap deploy
- [ ] C.3 Periksa `dist/sitemap-0.xml` memuat `<lastmod>` dan tetap XML yang sah

## D. Rapikan `robots.txt`

Basis `main`. Berdiri sendiri.

- [ ] D.1 `public/robots.txt` — berkas terbit punya dua blok `User-agent: *`, satu dari Cloudflare Managed dan satu milik situs. Crawler menggabungkannya sehingga `Disallow: /keystatic/` tetap berlaku, tapi bentuknya membingungkan siapa pun yang membacanya
- [ ] D.2 Pastikan directive `Sitemap:` tetap ada dan menunjuk `sitemap-index.xml`

## E. Alt hero beranda

Basis `main`. Berdiri sendiri. Sebelumnya ditunda karena `Hero.astro` sedang ditulis ulang di dua branch; keduanya kini sudah masuk `main`, jadi sudah aman.

- [ ] E.1 `src/components/Hero.astro` — foto hero dirender tanpa alt. Isi dengan keterangan yang menyebut apa yang tampak, bukan mengulang judul halaman
- [ ] E.2 Periksa `dist/index.html` tak lagi menyisakan gambar tanpa alt

## F. Pendekkan judul jejak yang terpotong

Basis `main`, **tapi** bertabrakan dengan berkas `.mdoc` yang dimigrasi branch SEO. Tunggu merge, atau kerjakan di atas branch itu.

- [ ] F.1 `jumat-berkah-2026-07-31-bogor` berjudul 84 karakter, terpotong di hasil pencarian. Pendekkan judulnya, atau beri judul SEO terpisah kalau judul panjangnya memang diinginkan di halaman
- [ ] F.2 `jumat-berkah-2026-07-31-dukuh-atas` 61 karakter, tepat di ambang; pendekkan sedikit
- [ ] F.3 Pastikan peringatan panjang metadata dari `astro-seo-graph` hilang saat build

## G. `llms.txt` jadi turunan data

Tunggu branch SEO merge, karena berkasnya baru saja diperbaiki di sana.

Berkas ini ditulis tangan, dan itu sebabnya ia sempat menyebut lima pintu ketika sudah ada enam, sekaligus menautkan URL program yang 404. Selama masih manual, ia akan basi lagi pada perubahan taksonomi berikutnya.

- [ ] G.1 Ganti `public/llms.txt` dengan endpoint `src/pages/llms.txt.ts` yang menyusun isinya dari `PINTU` di `src/consts.ts` dan koleksi `programs`
- [ ] G.2 Pastikan keluarannya sama persis bentuknya dengan berkas manual sekarang, supaya perubahannya murni soal sumber data
- [ ] G.3 Hapus berkas manualnya

## H. Putuskan sikap terhadap AI crawler

Tanpa kode. Butuh keputusan pemilik.

Cloudflare menyisipkan blok terkelola di `robots.txt` yang melarang GPTBot, ClaudeBot, CCBot, Google-Extended, meta-externalagent, Applebot-Extended, Bytespider, dan Amazonbot, dengan sinyal `ai-train=no`. Yang tetap bisa masuk: Googlebot (jadi AI Overviews masih mungkin), PerplexityBot, dan OAI-SearchBot.

Situs sekaligus menerbitkan `llms.txt`, berkas yang gunanya hanya memberi konteks kepada crawler LLM. Dua hal itu saling meniadakan.

- [ ] H.1 Putuskan: longgarkan blokirnya lewat dashboard Cloudflare (AI Scrapers & Crawlers), atau pertahankan dan hapus `llms.txt`
- [ ] H.2 Kalau dilonggarkan, Track G tetap relevan. Kalau dipertahankan, Track G dibatalkan dan diganti penghapusan berkas

## I. Isi alt dan caption foto (pekerjaan editor)

Bukan pekerjaan kode. Dilakukan lewat Keystatic setelah branch SEO merge.

Setiap foto kini punya kotak `alt` dan `caption` yang boleh dikosongkan. Yang kosong jatuh ke kalimat turunan judul jejak, jadi tak ada yang rusak kalau dilewati.

- [ ] I.1 Isi `caption` untuk foto yang punya cerita: siapa, sedang apa, kapan. Ini yang tampil ke pengunjung saat foto dibuka besar
- [ ] I.2 Isi `alt` hanya untuk foto yang isinya perlu dijelaskan dan tak tertangkap judul jejak
- [ ] I.3 Saat mengunggah foto baru, beri nama berkas yang deskriptif. Astro mempertahankan nama asli di URL keluaran (`jb-2026-07-31-6.jpg` menjadi `jb-2026-07-31-6.<hash>.webp`), jadi nama yang dipilih saat unggah ikut terbaca mesin pencari. Ini perbaikan paling murah di seluruh daftar: nol baris kode

---

## Yang sudah selesai, jangan dikerjakan ulang

- Alt foto jejak di kartu, hero detail, carousel, galeri gabungan, poster video, dan lightbox — `fix/seo-audit-findings`
- Field `alt`/`caption` di Keystatic dan zod, plus migrasi tiga entri konten — `fix/seo-audit-findings`
- `ImageObject` di graph halaman jejak dan `/sitemap-images.xml` — `fix/seo-audit-findings`
- `llms.txt`: jumlah pintu dan URL program yang 404 — `fix/seo-audit-findings` (sumbernya masih manual, lihat Track G)
- Halaman `sample-pintu` yang terbit ke produksi — sudah dihapus di `main` (`a262c95`)
- `/organisasi/` yang yatim tanpa tautan masuk — sudah ditautkan di `main`

## Temuan yang diperiksa lalu ditolak

Enam temuan dari review adversarial, lima gugur setelah ditantang dua peninjau independen. Dicatat di sini supaya tidak diangkat lagi sebagai temuan baru.

- `representativeOfPage` menandai foto yang salah — keliru baca, foto pertama memang foto pembuka
- `ImageObject` menggantung dari `WebPage` — node lepas di `@graph` itu sah, `VideoObject` yang sudah ada pun begitu
- Caption tak terbaca pembaca layar — `figcaption` di dalam `figure` memang sudah terbaca
- Dokumen `.claude/rules/` masih menyebut foto sebagai string — ternyata tidak menyatakan bentuk itu
- URL `customSitemaps` menduplikasi `site` — hardcoded, tapi tak punya jalur kegagalan
- FAQ schema di `/faq/` — Google menghentikan hasil kaya FAQ untuk semua situs pada 7 Mei 2026, jadi markup itu tak lagi menghasilkan tampilan khusus. Tidak perlu dihapus, tidak perlu ditambah di halaman lain
