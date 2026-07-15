#!/usr/bin/env bash
# One-time VPS bootstrap for bagiberbagi.id (Ubuntu 22.04/24.04).
# Run once as root on a fresh VPS: bash vps-setup.sh
set -euo pipefail

DOMAIN="bagiberbagi.id"
WEB_ROOT="/var/www/${DOMAIN}"
DEPLOY_USER="deploy"

echo "==> Updating system"
apt-get update -y && apt-get upgrade -y

echo "==> Installing nginx, certbot, ufw"
apt-get install -y nginx certbot python3-certbot-nginx ufw

echo "==> Creating deploy user (non-root, for CI/CD)"
if ! id -u "$DEPLOY_USER" >/dev/null 2>&1; then
  adduser --disabled-password --gecos "" "$DEPLOY_USER"
fi
mkdir -p "/home/${DEPLOY_USER}/.ssh"
touch "/home/${DEPLOY_USER}/.ssh/authorized_keys"
chmod 700 "/home/${DEPLOY_USER}/.ssh"
chmod 600 "/home/${DEPLOY_USER}/.ssh/authorized_keys"
chown -R "${DEPLOY_USER}:${DEPLOY_USER}" "/home/${DEPLOY_USER}/.ssh"

echo ">>> Paste the CI public key into /home/${DEPLOY_USER}/.ssh/authorized_keys manually, then re-run this script or continue."
echo ">>> (ssh-keygen -t ed25519 -C \"github-actions-deploy\" -f deploy_key  -- generate this LOCALLY, not on the VPS)"

echo "==> Preparing web root"
mkdir -p "$WEB_ROOT"
chown -R "${DEPLOY_USER}:www-data" "$WEB_ROOT"
chmod -R 755 "$WEB_ROOT"

echo "==> Installing nginx site config"
cp "$(dirname "$0")/nginx/${DOMAIN}.conf" "/etc/nginx/sites-available/${DOMAIN}.conf"
ln -sf "/etc/nginx/sites-available/${DOMAIN}.conf" "/etc/nginx/sites-enabled/${DOMAIN}.conf"
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "==> Firewall"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "==> Requesting TLS cert (requires DNS already pointing ${DOMAIN} -> this server's IP)"
certbot --nginx -d "$DOMAIN" -d "www.${DOMAIN}" --non-interactive --agree-tos -m "bagiberbagi.official@gmail.com" --redirect

echo "==> Done. Web root: ${WEB_ROOT} (owned by ${DEPLOY_USER}:www-data)"
echo "==> Next: add deploy user's public key to authorized_keys if not done, then configure GitHub Secrets (see deploy/README.md)."
