# Deploy — VPS + nginx + GitHub Actions

Static build (`dist/`) di-deploy ke VPS via `rsync` tiap push ke `main`. Nginx serve file statis langsung.

**TLS diterminasi di Cloudflare, BUKAN di origin.** Diverifikasi 4 Agustus 2026: port 443 di VPS tidak punya listener sama sekali (`curl --resolve www.bagiberbagi.id:443:165.22.246.217` gagal konek), sementara port 80 menjawab 200. Sertifikat yang dilihat pengunjung milik Cloudflare. Konsekuensinya, ruas Cloudflare→origin melintas internet publik tanpa enkripsi, dan Encryption mode di Cloudflare karena itu efektif **Flexible** — memilih Full atau Full (Strict) akan mematikan situs dengan error 525 sampai origin benar-benar punya sertifikat.

Nginx juga tidak memakai konvensi Debian di sini: berkas config aslinya ada di `sites-enabled`, bukan symlink ke `sites-available`. Jangan menebak path-nya, cari dengan `sudo nginx -T | grep 'configuration file .*bagiberbagi'`.

## Setup sekali jalan

### 1. Generate SSH key khusus CI (di laptop, bukan di VPS)

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f deploy_key -N ""
```

Hasilnya 2 file: `deploy_key` (private) dan `deploy_key.pub` (public).

### 2. Bootstrap VPS

`vps-setup.sh` ada buat VPS fresh (install nginx+certbot, bikin `WEB_ROOT="/var/www/${DOMAIN}"`). **VPS produksi aktual gak pernah dibootstrap pake script ini** — nginx/TLS udah disetup manual sebelumnya dengan struktur beda. Jangan jalanin script ini di VPS yang udah live, bakal nimpa config nginx yang ada (termasuk blok SSL certbot + SPA-fallback `/keystatic/`).

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

Tidak ada sertifikat yang perlu di-renew di VPS: TLS-nya dipegang Cloudflare (lihat catatan di atas). Baris lama di sini menyebut certbot auto-renew, dan itu sudah tidak benar.
