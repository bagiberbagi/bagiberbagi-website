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
# 3. Cadangkan yang sekarang. Config live punya blok SSL certbot yang TIDAK ada
#    di berkas repo, jadi jangan pernah menimpa mentah-mentah.
sudo cp /etc/nginx/sites-available/bagiberbagi.id /root/bagiberbagi.id.conf.bak.$(date +%F)

# 4. Bandingkan dulu, jangan langsung timpa.
sudo diff /etc/nginx/sites-available/bagiberbagi.id /tmp/bagiberbagi.id.conf
```

**Baca hasil diff itu sebelum melangkah.** Berkas di repo adalah versi tanpa blok
TLS; certbot menyisipkan `listen 443 ssl`, path sertifikat, dan blok redirect
sendiri ke berkas live. Yang benar adalah menyalin **hanya baris yang berubah**
ke berkas live dengan editor, bukan menyalin seluruh berkas:

- baris `add_header X-Content-Type-Options` dan `add_header Referrer-Policy` (baru)
- baris `add_header Cache-Control` di dalam `location /` (baru)
- daftar ekstensi di `location ~*` (tambah `webp|avif`)
- `expires 30d` → `expires 1y` dan `Cache-Control` aset (diubah)

```bash
sudo nano /etc/nginx/sites-available/bagiberbagi.id

# 5. Uji sintaks. Jangan reload sebelum baris ini bilang "syntax is ok".
sudo nginx -t

# 6. Reload (bukan restart — reload tidak memutus koneksi berjalan)
sudo systemctl reload nginx
```

**Verifikasi dari laptop:**

```bash
# foto webp harus ikut kebijakan panjang sekarang
curl -sSI https://www.bagiberbagi.id/_astro/jumat-berkah.fhWFl395_Z1Xaz14.webp | grep -i cache-control
# harapan: public, max-age=31536000, immutable

# HTML harus punya Cache-Control
curl -sSI https://www.bagiberbagi.id/ | grep -iE 'cache-control|x-content-type|referrer-policy'

# halaman masih hidup
curl -sS -o /dev/null -w "%{http_code}\n" https://www.bagiberbagi.id/jejak/
```

**Rollback:**

```bash
sudo cp /root/bagiberbagi.id.conf.bak.<tanggal> /etc/nginx/sites-available/bagiberbagi.id
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
