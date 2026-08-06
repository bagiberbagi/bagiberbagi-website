# Hasil audit SEO bagiberbagi.id

Dua audit terpisah, dijalankan 4 Agustus 2026 atas situs live. Dokumen ini
merekam temuannya berikut bukti, apa yang terbukti sehat, dan apa yang sudah
diperiksa lalu **ditolak**. Bagian terakhir itu yang paling mudah hilang, dan
yang paling mahal kalau hilang: tanpa catatan alasannya, temuan yang sama akan
diangkat lagi beberapa bulan lagi dan diperdebatkan dari nol.

Angka apa pun di sini berasal dari perintah yang benar-benar dijalankan, bukan
dari perkiraan. Kalau sesuatu tidak terukur, itu ditulis apa adanya.

---

## Audit menyeluruh — 74/100

Tujuh kategori, dibobot.

| Kategori | Bobot | Skor | Penahan utama |
|---|---:|---:|---|
| Content Quality | 23% | 76 | tanpa author/entitas legal; `/organisasi/` 462 kata |
| Technical SEO | 22% | 78 | sitemap memuat 3 URL `noindex`, tanpa `lastmod` |
| On-Page SEO | 20% | 80 | `/organisasi/` yatim, 2 judul kepanjangan |
| Schema | 10% | 78 | belum ada `ImageObject`, node NGO tipis |
| Performance | 10% | 90 | hero LCP tak di-preload; data lapangan tak tersedia |
| AI Search Readiness | 10% | 40 | crawler diblokir sambil menerbitkan `llms.txt` |
| Images | 5% | 55 | alt kosong di seluruh foto jejak |
| **Total** | | **74** | |

### Temuan, urut konsekuensi

**Halaman kerja internal terbit ke produksi.** `/sample-pintu/`, `-s2/`, dan
`-rel/` adalah alat banding visual yang benar ditandai `noindex`, tapi tetap
masuk sitemap karena filternya hanya mengecualikan `/keystatic`. Search Console
melaporkan itu sebagai *Submitted URL marked 'noindex'*. Bobotnya 625 KB HTML
mati, dan `/sample-pintu/` sendiri punya 11 `<h1>` serta 4.689 kata.

**Foto jejak tidak punya alt.** 11 dari 14 foto di `/jejak/`, 9 dari 12 di
halaman detail, semuanya `alt=""`. Foto lapangan adalah bukti yang jadi seluruh
argumen situs ini, jadi itu justru gambar paling tidak layak ditandai dekoratif.
Lint build lolos karena `alt=""` secara teknis valid.

**`llms.txt` basi.** Menyebut "Lima Pintu Berbagi" setelah pintu keenam terbit,
dan menautkan `https://www.bagiberbagi.id/jumat-berkah/` yang **404** sejak
halaman program pindah ke `/program/<slug>/`.

**`/organisasi/` yatim.** Satu inbound link, dari halaman detailnya sendiri.
Pembandingnya: halaman pintu punya 23 inbound.

**Sitemap tanpa `lastmod`.** Pada situs yang nilainya justru kebaruan
dokumentasi, tidak ada sinyal apa pun bahwa `/jejak/` berubah lebih sering
daripada `/syarat/`.

**Node `Organization` tipis.** Hanya `name`, `url`, `logo`, `description`,
`email`, `sameAs`. Tanpa `address`, `contactPoint`, atau `foundingDate`, dan
`logo` menunjuk `apple-touch-icon.png`.

**Dua judul jejak lewat 60 karakter**, terpotong di hasil pencarian.

### Keputusan yang menggantung: AI crawler

`robots.txt` terbit memuat blok terkelola Cloudflare yang melarang GPTBot,
ClaudeBot, CCBot, Google-Extended, meta-externalagent, Applebot-Extended,
Bytespider, dan Amazonbot, dengan sinyal `ai-train=no, use=reference`.

Yang **masih bisa** masuk, dan ini sering disalahpahami:

| Kanal | Status |
|---|---|
| Google Search + AI Overviews | jalan, Googlebot tidak diblokir, `max-snippet:-1` terpasang |
| Perplexity (PerplexityBot) | jalan, tidak ada di daftar blokir |
| ChatGPT Search (OAI-SearchBot) | jalan, yang diblokir GPTBot yang berbeda |
| Gemini app grounding | tertutup (Google-Extended) |
| Claude, Meta AI, Common Crawl | tertutup |

Situs sekaligus menerbitkan `llms.txt`, berkas yang gunanya hanya memberi
konteks kepada crawler LLM. Dua hal itu saling meniadakan. Ini keputusan
pemilik, bukan cacat teknis.

### Yang terbukti sehat

Brotli memampatkan beranda 105.725 byte jadi **17.202 byte**. TTFB 186 ms. TLS
1.3. Font self-hosted dengan `font-display: swap` dan `unicode-range` per subset
sehingga peramban Indonesia hanya menarik subset latin. Seluruh foto lewat
`astro:assets` jadi webp responsif dengan `width`/`height`, dan nol PNG mentah di
`dist/`.

25 title dan 25 description, semuanya unik, nol duplikat. Canonical benar di
semua halaman. Satu `<h1>` per halaman publik, urutan heading tidak pernah
melompat. Redirect apex→www dan http→https keduanya 301. 404 menghasilkan status
404 yang benar. Tidak ada halaman di bawah 300 kata.

---

## Audit teknis — 83/100

Sembilan kategori terhadap situs live, tiap temuan ditantang peninjau independen
yang tugasnya meruntuhkannya. Sembilan bertahan, satu gugur, tiga belas temuan
severity rendah lolos tanpa verifikasi dan ditandai demikian.

**Nol cacat yang memblokir indexing.** Seluruh pengurangan skor adalah kebersihan
infrastruktur ditambah satu bug structured data.

### Temuan yang paling berarti

**`http://www.bagiberbagi.id` melayani seluruh situs tanpa TLS.**

```
http://bagiberbagi.id/            → 301 https://www.bagiberbagi.id/   (benar)
https://bagiberbagi.id/           → 301 https://www.bagiberbagi.id/   (benar)
http://www.bagiberbagi.id/        → 200, tanpa TLS, tanpa Location    ← ini
http://www.bagiberbagi.id/faq/    → 200
```

Tiga dari empat kombinasi host/skema benar. Yang keempat justru hostname
kanoniknya sendiri.

Kenapa ia menang atas yang lain, dan alasannya **bukan peringkat**: tag canonical
tetap menunjuk URL https bahkan ketika halaman diambil lewat http, jadi Google
tidak akan mengindeks varian polos sebagai versi utama. Ia menang karena
jangkauannya seluruh 22 halaman, karena ini situs donasi sehingga pengunjung
yang datang dari tautan WhatsApp tanpa skema membaca ajakan dan menekan tautan
donasi lewat sambungan terbuka, dan karena perbaikannya satu toggle.

### Temuan lain, dikelompokkan menurut akibat

**Memblokir indexing: tidak ada.** Nol temuan di tingkat ini.

**Menurunkan peringkat, nyata tapi sedang:**

- **Breadcrumb JSON-LD keempat halaman program menunjuk stub `noindex`.** Yang
  terlihat berbunyi Beranda / Berbagi Makanan / Community Giving, yang dibaca
  mesin berbunyi Beranda / Program / Community Giving dengan posisi kedua
  menunjuk `/program/` yang isinya hanya `<meta http-equiv="refresh">` plus
  `noindex`. Dua representasi di satu halaman yang tidak sepakat, dan yang
  dibaca mesin menamai halaman yang tidak ada. Ini satu-satunya cacat SEO sejati
  dalam daftar, dan letaknya di halaman yang membawa ajakan donasi.
- **Foto kartu donasi tanpa `srcset` dan `fetchpriority`.** Satu berkas webp
  1280w berukuran 88.428 byte dikirim ke kotak setinggi 246 px di semua ukuran
  layar, di atas fold, bersebelahan dengan hero yang sudah punya keduanya.

**Kebersihan saja, tanpa efek peringkat.** Bagian ini sengaja dipisah supaya
tidak digelembungkan jadi masalah SEO:

- **Tanpa HSTS.** Bukan faktor peringkat. Berarti hanya karena memperparah
  temuan di atas.
- **Foto webp tidak kena aturan cache.** Regex nginx memuat `css|js|svg|woff2?|
  jpg|jpeg|png|gif|ico` dan **tidak** memuat `webp`, padahal setiap foto situs
  ini webp. Foto jatuh ke default Cloudflare 4 jam sementara stylesheet menikmati
  30 hari. Dampaknya lebih ringan dari kelihatannya: respons webp membawa `etag`,
  dan permintaan bersyarat menjawab `304` dengan 0 byte, jadi yang hilang adalah
  satu perjalanan revalidasi, bukan unduh ulang.
- **HTML tidak pernah di-cache di edge.** Lima halaman diperiksa, semuanya
  `cf-cache-status: DYNAMIC`, karena nginx tidak mengirim `Cache-Control` sama
  sekali sehingga Cloudflare memilih asumsi teraman. Untuk situs statis itu murni
  kehilangan, dan TTFB menyumbang langsung ke LCP.
- **Body copy 14px** pada jawaban FAQ dan deskripsi program. Keterbacaan, bukan
  kegagalan mobile-friendliness: viewport benar dan tidak ada halaman yang
  menggulir mendatar di 360 px.
- **`VideoObject.embedUrl` menunjuk pratinjau Google Drive** yang mengirim
  `x-robots-tag: noindex, nofollow, nosnippet`, sehingga video rich result tidak
  mungkin terjadi. Operasional, bukan bug kode.
- **`/program` telanjang** adalah 301-ke-slash lalu stub meta-refresh. Perilaku
  terdokumentasi Astro untuk `output: 'static'` tanpa adapter. Nol tautan internal
  menunjuk ke sana, tidak ada di sitemap, dan ia `noindex`.

### Yang terbukti sehat, jangan habiskan waktu di sini

Crawlability dan indexability bersih dan diperiksa keras. Seluruh 21 URL sitemap
menjawab 200 dengan canonical menunjuk dirinya sendiri dan `index, follow`. Nol
halaman yatim, BFS dari beranda menjangkau semua 22, kedalaman klik maksimum 2.
Tidak ada crawl trap, tidak ada URL filter berparameter, jalur paginasi dan
kalender tebakan semuanya 404. Googlebot tidak dihadang di edge. 404 sungguhan,
bukan soft-404.

Pengiriman solid: TLS 1.3, sertifikat sah, HTTP/2 dengan h3 ditawarkan, Brotli
aktif, nol mixed content, `font-display: swap` di seluruh 20 face, `width`/
`height` eksplisit di setiap `img` yang disampel, dan hanya sekitar 56 byte JS
modul di beranda.

Konten bertahan tanpa JavaScript, pemeriksaan yang justru paling sering gagal di
situs statis. Kartu jejak, tautan program di mega-menu, jawaban FAQ sebagai
elemen `<p>` sungguhan berikut `FAQPage` JSON-LD dengan 5 Question, dan tautan
donasi WhatsApp, semuanya ada di HTML mentah dari server.

### Temuan yang diperiksa lalu ditolak

Dicatat supaya tidak diangkat ulang sebagai temuan baru. Masing-masing gugur di
hadapan dua peninjau independen.

| Klaim | Kenapa gugur |
|---|---|
| `robots.txt` punya dua blok `User-agent: *` yang berkonflik | Bukan konflik. RFC 9309 §2.2.1 mewajibkan crawler menggabungkan grup bertoken sama, jadi aturan efektif Googlebot tetap `Allow: /` plus `Disallow: /keystatic/` |
| `representativeOfPage` menandai foto yang salah | Keliru baca; foto pertama memang foto pembuka |
| `ImageObject` menggantung dari `WebPage` | Node lepas di `@graph` itu sah, dan `VideoObject` yang sudah ada pun begitu |
| Caption tak terbaca pembaca layar | `figcaption` di dalam `figure` memang sudah terbaca |
| Dokumen rule menyebut foto sebagai string | Ternyata tidak menyatakan bentuk itu |
| URL `customSitemaps` menduplikasi `site` | Hardcoded, tapi tidak punya jalur kegagalan |
| Varian URL bergaris miring ganda menjawab 200 | Severity rendah, tidak punya konsekuensi terukur di situs 22 halaman |

**FAQ schema di `/faq/`**: informasi saja, bukan temuan. Google menghentikan FAQ
rich result untuk semua situs pada 7 Mei 2026, jadi markup itu tidak lagi
menghasilkan tampilan khusus di SERP. Tidak perlu dihapus, tidak perlu ditambah
di halaman lain, dan tidak ada bukti bahwa ia membantu kutipan AI.

### Yang tidak terukur

- **Core Web Vitals lapangan.** Tidak ada API key CrUX maupun PageSpeed, jadi
  LCP/INP/CLS hanya dinilai dari sinyal lab dan statis. Klaim LCP pada kartu
  donasi adalah inferensi dari posisi dan ukuran, bukan paint yang teramati.
  Mengukurnya butuh API key atau 28 hari data Search Console.
- **Aturan Cloudflare mana yang menghasilkan 301 apex.** Tidak ada akses
  dashboard saat audit berjalan.

---

## Temuan tambahan yang muncul saat perbaikan

Dua hal ini tidak ada di audit mana pun. Keduanya baru ketahuan saat menerapkan
perbaikan ke server, dan keduanya mengoreksi dokumentasi yang selama ini salah.

**Origin tidak melayani HTTPS sama sekali.** Port 443 di VPS tidak punya listener
(`curl --resolve www.bagiberbagi.id:443:<ip>` gagal konek), sementara port 80
menjawab 200. Artinya `deploy/README.md` yang menyebut "TLS via Let's Encrypt
(certbot)" sudah lama tidak benar, sertifikat yang dilihat pengunjung milik
Cloudflare, dan Encryption mode di dashboard karena itu efektif **Flexible**.
Memilih Full atau Full (Strict) akan mematikan situs dengan 525 sampai origin
benar-benar punya sertifikat. Ruas Cloudflare→origin melintas internet publik
tanpa enkripsi, dan itu pekerjaan tersendiri yang belum dikerjakan.

**Berkas nginx live tidak di path konvensional.** Ia ada di `sites-enabled`,
bukan symlink ke `sites-available` seperti konvensi Debian. Cara yang benar
menemukannya: `sudo nginx -T | grep 'configuration file .*bagiberbagi'`.

---

## Status penyelesaian

Lihat `STATUS.md` di folder yang sama untuk daftar lengkap berikut nomor commit.
Ringkasnya per 4 Agustus 2026:

**Sudah diperbaiki dan live**: halaman sample dihapus dari produksi, alt foto
jejak di seluruh permukaan, `llms.txt` jadi turunan data, breadcrumb program,
`contactPoint` pada node Organization, `lastmod` sitemap khusus URL jejak, judul
terpotong, `srcset` dan `fetchpriority` kartu donasi, `ImageObject` di graph,
sitemap gambar, serta `/organisasi/` yang kini ditautkan.

**Sudah diterapkan ke infrastruktur**: Always Use HTTPS di Cloudflare, `webp`
masuk daftar cache nginx, `Cache-Control` untuk HTML, dan tiga header keamanan.

**Belum dikerjakan**: HSTS, TLS di origin, keputusan AI crawler, pengisian
`alt`/`caption` foto oleh editor, serta `address` dan `foundingDate` organisasi
yang field-nya sudah ada tapi sengaja dikosongkan karena keduanya pernyataan
fakta tentang lembaga.
