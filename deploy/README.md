# Deploy — VPS + nginx + GitHub Actions

Static build (`dist/`) di-deploy ke VPS via `rsync` tiap push ke `main`. Nginx serve file statis langsung, TLS via Let's Encrypt (certbot).

## Setup sekali jalan

### 1. Generate SSH key khusus CI (di laptop, bukan di VPS)

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f deploy_key -N ""
```

Hasilnya 2 file: `deploy_key` (private) dan `deploy_key.pub` (public).

### 2. Bootstrap VPS

Copy folder `deploy/` ke VPS (`scp -r deploy root@<VPS_IP>:/root/`), lalu login SSH sbg root dan jalankan:

```bash
cd /root/deploy
bash vps-setup.sh
```

Script ini install nginx + certbot, bikin user `deploy`, pasang config nginx, setup firewall (ufw), dan request sertifikat TLS untuk `bagiberbagi.id` (pastikan DNS A record udah nunjuk ke IP VPS sebelum run ini, kalo belum certbot bakal gagal — install nginx-nya tetep jalan, tinggal ulang command certbot manual nanti).

### 3. Pasang public key ke user `deploy`

```bash
cat deploy_key.pub | ssh root@<VPS_IP> "cat >> /home/deploy/.ssh/authorized_keys"
```

Verifikasi bisa login: `ssh -i deploy_key deploy@<VPS_IP>`

### 4. Set GitHub Secrets

Repo → Settings → Secrets and variables → Actions → New repository secret:

| Secret | Isi |
|---|---|
| `VPS_HOST` | IP VPS (ganti placeholder di config lain juga kalo masih ada) |
| `VPS_USER` | `deploy` |
| `VPS_SSH_KEY` | isi file `deploy_key` (private key, full content termasuk header/footer) |

### 5. Merge `astro-migration` ke `main`

Workflow (`.github/workflows/deploy.yml`) trigger dari push ke `main` — branch ini (`astro-migration`) belum otomatis deploy sampe di-merge.

## Deploy selanjutnya

Push/merge ke `main` → GitHub Actions otomatis: install → `bun test` → `astro check` → `bun run build` → rsync `dist/` ke `/var/www/bagiberbagi.id` di VPS. Gak perlu langkah manual lagi.

## Update konten legal/domain

Sertifikat TLS certbot auto-renew via systemd timer bawaan certbot (`certbot.timer`), gak perlu cron manual.
