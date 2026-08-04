# Runbook — perbaikan infrastruktur dari audit teknis SEO

Disusun 4 Agustus 2026 dari audit teknis situs live (skor 83/100). Semua yang di
sini **belum dikerjakan** dan butuh akses yang tidak dimiliki proses build:
dashboard Cloudflare dan shell VPS.

Urutannya penting. Langkah 1 harus selesai dan terbukti sebelum langkah 2, sebab
mengaktifkan HSTS saat situs masih melayani HTTP polos akan mengunci pengunjung
pada keadaan yang salah.

Temuan kode yang bisa diperbaiki tanpa akses ini sudah dikerjakan di branch
`fix/seo-audit-findings`.

---

## 1. Tutup HTTP polos di hostname www

**Masalah.** Seluruh situs bisa diakses tanpa enkripsi di `http://www.bagiberbagi.id`,
status 200, tanpa pernah naik ke HTTPS. Apex sudah benar, www tidak.

```
http://bagiberbagi.id/            → 301 https://www.bagiberbagi.id/   (benar)
https://bagiberbagi.id/           → 301 https://www.bagiberbagi.id/   (benar)
http://www.bagiberbagi.id/        → 200, tanpa TLS                    ← ini
http://www.bagiberbagi.id/faq/    → 200, tanpa TLS
```

**Kenapa ini yang pertama.** Bukan karena peringkat: tag canonical tetap menunjuk
URL https bahkan saat halaman diambil lewat http, jadi Google tidak akan
mengindeks yang polos sebagai versi utama. Yang membuatnya pantas didahulukan
adalah jangkauannya, seluruh 22 halaman, dan konteksnya. Ini situs donasi.
Pengunjung yang datang dari tautan WhatsApp atau QR tanpa skema membaca ajakan
donasi dan menekan tautan WhatsApp lewat sambungan terbuka.

**Perbaikan.** Satu toggle, bukan perubahan kode.

1. Buka Cloudflare → pilih zona `bagiberbagi.id`
2. Masuk **SSL/TLS → Edge Certificates**
3. Nyalakan **Always Use HTTPS**

Setelan itu berlaku untuk seluruh hostname di zona, jadi ia menutup www sekaligus
mempertahankan perilaku apex yang sudah benar.

> **KOREKSI, 4 Agustus 2026.** Paragraf di bawah ini salah waktu ditulis dan
> dibiarkan berdiri sebagai catatan. Dua kekeliruannya: origin **tidak** punya
> sertifikat Let's Encrypt (port 443 tidak punya listener sama sekali, jadi mode
> zona efektif Flexible), dan Flexible bukan penghalang buat menyalakan Always
> Use HTTPS. Redirect loop lahir dari Flexible **plus redirect di sisi origin**,
> sementara redirect di sisi edge justru aman. Langkah 1 memang dijalankan
> dengan mode Flexible dan hasilnya benar. Ruas origin ditutup terpisah lewat
> `RUNBOOK-tls-origin.md`.

**Sebelum menyalakan, pastikan mode SSL bukan Flexible.** Di halaman
**SSL/TLS → Overview**, mode harus **Full (strict)** atau minimal **Full**.
Kombinasi Flexible dengan redirect di sisi origin adalah resep redirect loop.
Origin ini punya sertifikat Let's Encrypt lewat certbot, jadi Full (strict)
seharusnya sudah benar. Kalau ternyata Flexible, jangan diubah dan dinyalakan
sekaligus dalam satu langkah: ubah mode dulu, cek situs masih hidup, baru
nyalakan Always Use HTTPS.

**Verifikasi.**

```bash
curl -sI http://www.bagiberbagi.id/ | head -2
# harapan: HTTP/1.1 301 (bukan 200), dengan Location: https://www.bagiberbagi.id/

for u in / /faq/ /tentang/ /jejak/; do
  printf "%-12s %s\n" "$u" "$(curl -sS -o /dev/null -w '%{http_code}' "http://www.bagiberbagi.id$u")"
done
# harapan: 301 di semuanya

curl -sSI https://www.bagiberbagi.id/ | head -1
# harapan: HTTP/2 200 — pastikan yang https TIDAK ikut rusak
```

**Kalau salah.** Gejala redirect loop: `curl -sIL` berputar sampai `curl` menyerah
dengan "Maximum (50) redirects followed". Matikan lagi **Always Use HTTPS**, situs
kembali seperti semula dalam hitungan detik, lalu periksa mode SSL sebelum
mencoba ulang.

---

## 2. HSTS, hanya setelah langkah 1 terbukti

**Jangan dikerjakan sebelum langkah 1 hijau.** HSTS memerintahkan peramban untuk
menolak HTTP untuk domain ini selama jangka waktu tertentu, dan perintah itu
tidak bisa ditarik dari peramban yang sudah menerimanya. Menyalakannya saat masih
ada jalur HTTP yang sah berarti menyimpan bom waktu.

1. Cloudflare → **SSL/TLS → Edge Certificates → HTTP Strict Transport Security (HSTS)**
2. Enable, dengan:
   - **Max-Age: 6 bulan** untuk mulai. Jangan langsung 12 bulan.
   - **Include subdomains: OFF** untuk sekarang. Nyalakan hanya kalau yakin tidak
     ada subdomain yang masih perlu HTTP.
   - **Preload: OFF.** Preload praktis permanen dan butuh pendaftaran terpisah.
     Jangan disentuh sampai HSTS berjalan mulus berbulan-bulan.

**Verifikasi.**

```bash
curl -sSI https://www.bagiberbagi.id/ | grep -i strict-transport-security
# harapan: strict-transport-security: max-age=15552000
```

**Catatan jujur soal nilainya.** HSTS bukan faktor peringkat. Ia tidak akan
menaikkan posisi satu pun kata kunci. Gunanya melindungi pengunjung yang pernah
membuka situs ini dari diturunkan ke HTTP di jaringan yang tidak tepercaya.
Kerjakan karena benar, bukan karena SEO.

---

## 3. Terapkan config nginx yang sudah diperbarui

Berkasnya sudah diedit di repo: `deploy/nginx/bagiberbagi.id.conf`. Deploy
otomatis **tidak** menyentuh config nginx, ia cuma `rsync` isi `dist/`, jadi
langkah ini manual.

Tiga perubahan di dalamnya:

| Perubahan | Alasan |
|---|---|
| `webp` dan `avif` masuk daftar aset ber-hash | Semua foto situs ini webp, dan justru itu satu-satunya jenis yang **tidak** ada di daftar. Foto jatuh ke default Cloudflare 4 jam sementara CSS dapat 30 hari. |
| Aset ber-hash naik 30 hari → 1 tahun `immutable` | Nama berkas mengandung hash isi, jadi URL berubah setiap kali byte-nya berubah. Setahun itu angka yang jujur untuk berkas yang tidak mungkin berubah diam-diam. |
| HTML dapat `s-maxage=3600` + `stale-while-revalidate` | HTML tidak mengirim `Cache-Control` sama sekali, jadi Cloudflare tidak menyimpan apa pun: seluruh halaman `cf-cache-status: DYNAMIC`. Untuk situs statis itu murni kehilangan. |

Ditambah dua header: `X-Content-Type-Options: nosniff` dan `Referrer-Policy`.

**Satu jebakan nginx yang wajib diketahui saat menyunting berkas live.**
`add_header` diwariskan dari level induk **hanya** kalau level itu tidak punya
`add_header` sendiri. Begitu satu ditambahkan di dalam sebuah `location`, seluruh
`add_header` level `server` berhenti terkirim untuk request yang cocok dengan
location tersebut. Karena itu ketiga header level server sengaja **ditulis ulang**
di dalam kedua blok `location` di berkas repo. Kalau nanti ada header yang diubah
di level server, ubah juga salinannya, atau HTML akan diam-diam kehilangannya.

Cara memastikan setelah reload:

```bash
curl -sSI https://www.bagiberbagi.id/ | grep -icE 'content-security-policy|x-content-type-options|referrer-policy'
# harapan: 3
```

### Langkahnya

```bash
# 1. Salin config baru ke VPS. Port SSH 32550, bukan 22.
scp -P 32550 deploy/nginx/bagiberbagi.id.conf <user-sudo>@165.22.246.217:/tmp/

# 2. Masuk
ssh -p 32550 <user-sudo>@165.22.246.217
```

Di dalam VPS:

```bash
# 3. TEMUKAN berkas config yang benar-benar dipakai. Jangan menebak path.
#    Konvensi Debian menaruh berkas di sites-available dan symlink-nya di
#    sites-enabled, tapi VPS ini tidak dibootstrap dengan konvensi itu dan
#    berkas aslinya ada di sites-enabled. `nginx -T` mencetak config yang
#    sedang berjalan berikut asal berkasnya, jadi ia benar apa pun tata letaknya.
CONF=$(sudo nginx -T 2>/dev/null | grep -m1 'configuration file .*bagiberbagi' | sed 's|.*configuration file \(.*\):|\1|')
echo "file aktif: $CONF"

# 4. Cadangkan.
sudo cp "$CONF" /root/$(basename "$CONF").bak.$(date +%F)

# 5. Bandingkan dulu, jangan langsung timpa.
sudo diff "$CONF" /tmp/bagiberbagi.id.conf
```

**Baca hasil diff itu sebelum melangkah.** Berkas live tertinggal beberapa
revisi dari repo, termasuk komentar yang masih menyebut Astro menghasilkan
`faq.html` padahal sekarang format direktori. Yang benar adalah menyalin **hanya
baris yang berubah** ke berkas live dengan editor, bukan menyalin seluruh berkas:

- baris `add_header X-Content-Type-Options` dan `add_header Referrer-Policy` (baru)
- baris `add_header Cache-Control` plus tiga header ulangan di dalam `location /` (baru)
- daftar ekstensi di `location ~*` (tambah `webp|avif`)
- `expires 30d` → `expires 1y`, dan tiga header ulangan di blok aset itu juga

**Jangan sentuh baris `index index.html;`.** Salah ketik satu huruf di situ
(`index.htm`) membuat SELURUH halaman direktori menjawab 403 sementara berkas
biasa seperti `/llms.txt` tetap 200. Ini sudah pernah terjadi dan gejalanya
menyesatkan, karena situs terlihat "sebagian hidup".

```bash
sudo nano "$CONF"

# 5. Uji sintaks. Jangan reload sebelum baris ini bilang "syntax is ok".
sudo nginx -t

# 6. Reload (bukan restart — reload tidak memutus koneksi berjalan)
sudo systemctl reload nginx
```

**Verifikasi dari laptop:**

```bash
# PALING PENTING, jalankan ini lebih dulu: setiap halaman DIREKTORI harus 200.
# Semua rute situs ini adalah direktori (/faq/ -> /faq/index.html), dan
# kesalahan pada `index` atau `try_files` membuat semuanya 403 sementara berkas
# biasa tetap 200 — sehingga situs terlihat hidup padahal mati.
for u in / /faq/ /jejak/ /organisasi/ /program/jumat-berkah/ /berbagi-makanan/; do
  printf "%-28s %s\n" "$u" "$(curl -sS -o /dev/null -w '%{http_code}' https://www.bagiberbagi.id$u)"
done
# harapan: 200 di SEMUA baris. Satu saja 403 = rollback.

# Header diperiksa LANGSUNG ke origin, bukan lewat Cloudflare: edge masih
# menyimpan salinan lama berikut header lamanya, jadi lewat CDN kamu bisa
# melihat angka lama dan mengira config gagal.
curl -sSI --resolve www.bagiberbagi.id:80:165.22.246.217 \
  http://www.bagiberbagi.id/_astro/index.CZXMiEAz.css | grep -i cache-control
# harapan: dua baris, `max-age=31536000` dan `public, immutable`.
# Keduanya digabung jadi satu header di sisi klien; itu memang bentuknya.

# Ketiga header keamanan harus sampai ke HTML. Ini yang menangkap jebakan
# pewarisan add_header.
curl -sSI --resolve www.bagiberbagi.id:80:165.22.246.217 http://www.bagiberbagi.id/ \
  | grep -icE 'content-security-policy|x-content-type-options|referrer-policy'
# harapan: 3
```

**Rollback:**

```bash
sudo cp /root/<nama-cadangan> "$CONF"
sudo nginx -t && sudo systemctl reload nginx
```

**Rollback saja tidak cukup.** Begitu langkah ini pernah aktif, Cloudflare sudah
menyimpan HTML di edge beserta header lamanya, dan mengembalikan config origin
tidak menyentuh apa yang sudah tersimpan di sana. Setelah reload, purge:
Cloudflare → **Caching → Configuration → Purge Everything**. Tanpa itu,
pengunjung masih bisa menerima respons dari config yang baru saja kamu batalkan
selama satu jam berikutnya.

---

## 4. Purge cache Cloudflare setiap deploy

Langkah 3 membuat Cloudflare mulai menyimpan HTML selama satu jam. Konsekuensinya:
tanpa purge, sebuah deploy butuh sampai satu jam untuk terlihat oleh pengunjung
yang tidak melakukan reload.

Untuk sekarang cukup manual setelah deploy yang penting: Cloudflare → **Caching →
Configuration → Purge Everything**.

Kalau nanti terasa mengganggu, purge bisa disambungkan ke akhir
`.github/workflows/deploy.yml` dengan API token Cloudflare ber-scope
`Zone.Cache Purge`. Itu perubahan tersendiri dan butuh satu secret baru, jadi
sengaja tidak dikerjakan sekarang.

---

## Yang sengaja TIDAK ada di runbook ini

**Memaksa HTTPS lewat nginx.** Secara teknis bisa, dengan memeriksa
`$http_x_forwarded_proto` lalu 301. Tidak dianjurkan di sini karena Cloudflare
sudah memegang lapisan itu, dan dua lapisan yang sama-sama meredirect adalah cara
paling umum menciptakan loop. Kerjakan di edge saja.

**`robots.txt`.** Terlihat punya dua blok `User-agent: *` dan sempat dicurigai
sebagai cacat. Bukan. Blok pertama sisipan terkelola Cloudflare, dan RFC 9309
§2.2.1 mewajibkan crawler menggabungkan grup dengan token user-agent yang sama.
Aturan efektif untuk Googlebot tetap `Allow: /` plus `Disallow: /keystatic/`.
Tidak ada yang perlu dikerjakan.

**Blokir AI crawler.** Cloudflare melarang GPTBot, ClaudeBot, CCBot,
Google-Extended, dan meta-externalagent lewat blok terkelola itu, sementara situs
menerbitkan `llms.txt` untuk mereka. Dua hal yang saling meniadakan, dan
memilihnya keputusan pemilik, bukan perbaikan teknis. Yang masih bisa masuk:
Googlebot (jadi AI Overviews tetap mungkin), PerplexityBot, dan OAI-SearchBot.
