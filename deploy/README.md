# Deploy — VPS + nginx + GitHub Actions

Static build (`dist/`) di-deploy ke VPS via `rsync` tiap push ke `main`. Nginx serve file statis langsung.

**TLS terpasang di dua ruas, dan sertifikatnya beda.** Pengunjung bicara dengan Cloudflare memakai sertifikat Cloudflare. Cloudflare bicara dengan origin memakai **sertifikat Cloudflare Origin CA** yang dipasang manual di VPS, berlaku sampai **31 Juli 2041**, tanpa proses renewal apa pun. Encryption mode zona: **Full (strict)**. Dipasang dan diverifikasi 4 Agustus 2026 lewat `deploy/RUNBOOK-tls-origin.md`; bukti: `curl -sSIk --resolve www.bagiberbagi.id:443:165.22.246.217` menjawab 200 dan `openssl s_client` menunjukkan issuer `CloudFlare Origin SSL Certificate Authority`.

Konsekuensi yang tidak boleh dilupakan: **sertifikat Origin CA hanya dipercaya Cloudflare, tidak oleh browser mana pun.** Jadi DNS record wajib tetap proxied (awan oranye) selamanya. Begitu proxy dimatikan, pengunjung yang menyentuh IP origin langsung akan kena peringatan sertifikat. Kalau proxy memang harus dilepas suatu saat, pindah ke certbot dulu; alasannya ditulis di bagian akhir runbook itu.

Port 80 di origin sengaja tetap terbuka dan tetap melayani, tanpa redirect ke 443. Redirect di sisi origin adalah bahan redirect loop, dan pengunjung tidak pernah menyentuh port itu karena **Always Use HTTPS** sudah menutupnya di edge. HSTS juga aktif di edge: `max-age=15552000; includeSubDomains; preload`. Flag `preload` di header itu baru pernyataan niat; yang mengikat dan sulit dibatalkan adalah submit ke hstspreload.org, dan itu belum dilakukan.

Nginx juga tidak memakai konvensi Debian di sini: berkas config aslinya ada di `sites-enabled`, bukan symlink ke `sites-available`. Jangan menebak path-nya, cari dengan `sudo nginx -T | grep 'configuration file .*bagiberbagi'`.

## Setup sekali jalan

### 1. Generate SSH key khusus CI (di laptop, bukan di VPS)

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f deploy_key -N ""
```

Hasilnya 2 file: `deploy_key` (private) dan `deploy_key.pub` (public).

### 2. Bootstrap VPS

`vps-setup.sh` ada buat VPS fresh (install nginx+certbot, bikin `WEB_ROOT="/var/www/${DOMAIN}"`). **VPS produksi aktual gak pernah dibootstrap pake script ini** — nginx/TLS udah disetup manual sebelumnya dengan struktur beda. Jangan jalanin script ini di VPS yang udah live, bakal nimpa config nginx yang ada (termasuk blok TLS Origin CA + SPA-fallback `/keystatic/`). Script-nya sendiri juga bakal gagal sekarang: `nginx -t` jalan sebelum certbot, sementara config-nya nunjuk sertifikat di `/etc/ssl/cloudflare/` yang belum ada di box baru. Lihat peringatan di kepala script itu.

Nilai aktual VPS produksi (bukan default script):
- SSH port: `32550` (bukan 22 default)
- Web root: `/var/www/html/bagiberbagi` (bukan `/var/www/bagiberbagi.id`)
- User `deploy`: dibikin manual, join grup `www-data` (bukan `chown` jadi owner) — akses tulis ke web root lewat grup

### 3. Bikin user `deploy` + pasang public key (manual, VPS yang udah live)

```bash
# via user sudo yang ada (mis. developer@), bukan root langsung
sudo adduser --disabled-password --gecos "" deploy
sudo mkdir -p /home/deploy/.ssh
sudo touch /home/deploy/.ssh/authorized_keys
sudo chmod 700 /home/deploy/.ssh
sudo chmod 600 /home/deploy/.ssh/authorized_keys
sudo chown -R deploy:deploy /home/deploy/.ssh

sudo usermod -aG www-data deploy
sudo chown -R root:www-data /var/www/html/bagiberbagi
sudo chmod -R 775 /var/www/html/bagiberbagi
sudo find /var/www/html/bagiberbagi -type d -exec chmod g+s {} +

echo "<isi deploy_key.pub>" | sudo tee -a /home/deploy/.ssh/authorized_keys
```

Verifikasi bisa login: `ssh -i deploy_key -p 32550 deploy@<VPS_IP>`

### 4. Set GitHub Secrets

Repo → Settings → Secrets and variables → Actions → New repository secret:

| Secret | Isi |
|---|---|
| `VPS_HOST` | `165.22.246.217` |
| `VPS_USER` | `deploy` |
| `VPS_SSH_KEY` | isi file `deploy_key` (private key, full content termasuk header/footer) |
| `VPS_SSH_PORT` | `32550` |

### 5. Merge `astro-migration` ke `main`

Workflow (`.github/workflows/deploy.yml`) trigger dari push ke `main` — branch ini (`astro-migration`) belum otomatis deploy sampe di-merge.

## Deploy selanjutnya

Push/merge ke `main` → GitHub Actions otomatis: install → `bun test` → `astro check` → `bun run build` → rsync `dist/` ke `/var/www/html/bagiberbagi` di VPS (port SSH `32550`). Gak perlu langkah manual lagi.

## Update konten legal/domain

Tidak ada renewal yang perlu dijadwalkan. Sertifikat Origin CA di VPS berlaku sampai **31 Juli 2041** dan Cloudflare mengurus sertifikat sisi pengunjung sendiri. Tidak ada certbot dan tidak ada `/etc/letsencrypt` di box ini, apa pun yang tertulis di `vps-setup.sh`.
