# Runbook — TLS on the origin (Cloudflare Origin CA)

Written 4 August 2026. This closes the last unencrypted leg of the request path.

```
BEFORE
  visitor ──HTTPS──▶ Cloudflare ──HTTP, in the clear──▶ origin (165.22.246.217)

AFTER
  visitor ──HTTPS──▶ Cloudflare ──HTTPS──────────────▶ origin
```

Measured the same day, before any of this ran:

```
origin :443   connection refused, no listener at all
origin :80    200, nginx/1.26.3
edge          Always Use HTTPS on, HSTS on (max-age=15552000)
mode          Automatic SSL/TLS, currently running Flexible
```

**Visitors will see no difference.** The padlock is already green and stays
green. This changes what happens behind the edge, not in front of it.

---

## Ground rules

**Step 0 exists for a reason and is not optional.** The zone is on *Automatic
SSL/TLS*, which is not a label, it is a process. Cloudflare re-probes the origin
on its own schedule and raises the encryption mode by itself the moment the
origin presents a usable certificate on 443. Leave it on and step 3 becomes the
trigger: finish the nginx work, go to bed, and the edge can promote the zone to
Full (strict) overnight with nobody watching. Step 0 pins the mode to what it is
already running, so the rest of the runbook happens under your control.

**With step 0 done, nothing in steps 1 to 4 can take the site down.** Port 80
keeps serving throughout and the edge keeps using it. Step 5 is the only step
that changes what visitors get.

**Never paste the private key into a file in this repository.** It goes from the
Cloudflare dashboard into `/etc/ssl/cloudflare/` on the VPS and nowhere else.
Cloudflare displays it exactly once.

**The DNS records must stay proxied (orange cloud), permanently.** An Origin CA
certificate is trusted by Cloudflare and by nothing else. Grey-cloud a record
and every visitor reaching the origin directly gets a browser certificate
warning. This is the one lasting constraint the choice buys.

Connection details, so they are in one place:

| | |
|---|---|
| origin IP | `165.22.246.217` |
| SSH port | `32550` |
| sudo user | your own admin account, written `<user-sudo>` below (not `deploy`) |
| web root | `/var/www/html/bagiberbagi` |
| live nginx config | discover it, do not guess (step 3) |

---

## Rollback

Read this before starting, not after something breaks.

### Edge layer, if the site is erroring after step 5

**SSL/TLS → Overview → Configure → Custom SSL/TLS → Flexible → Save.**

Seconds to take effect, no VPS access needed. Do this FIRST and diagnose after.

> **Do not click "Automatic SSL/TLS" to roll back.** It is the option the page
> offers first and it is the wrong one. Automatic re-probes the origin, finds
> the certificate you just installed, and puts the zone straight back into Full
> (strict), restoring the outage you were trying to end. Rolling back means
> choosing **Custom** and then **Flexible**.

### Origin layer, if nginx is serving wrongly after the reload in step 3

The backup lives outside nginx's config directory on purpose (see step 3):

```bash
sudo cp /root/bagiberbagi.id.conf.bak-pre-tls "$LIVE"
sudo nginx -t && sudo systemctl reload nginx
```

If `$LIVE` is gone because you opened a new shell, re-run the discovery command
at the top of step 3 first.

Then re-check port 80 directly, since that is the leg the edge is still using:

```bash
curl -sSI --resolve www.bagiberbagi.id:80:165.22.246.217 http://www.bagiberbagi.id/faq/ | head -2
```

If visitors saw broken pages in the meantime, purge the edge afterwards:
**Caching → Configuration → Purge Everything.**

---

## 0. Pin the encryption mode before anything else

Dashboard only. The mode you select is the one the zone is already running, so
nothing changes for visitors. What changes is that Cloudflare stops moving it on
its own.

1. Cloudflare → zone `bagiberbagi.id` → **SSL/TLS → Overview**
2. **Configure**
3. Choose **Custom SSL/TLS**, then **Flexible**, then **Save**

Confirm the card now reads *Custom SSL/TLS: Flexible* and no longer says
Automatic. Then confirm the site is untouched:

```bash
curl -sS -o /dev/null -w '%{http_code}\n' https://www.bagiberbagi.id/
# 200
```

---

## 1. Generate the Origin CA certificate

Dashboard only, nothing reaches the VPS yet.

1. **SSL/TLS → Origin Server → Create Certificate**
2. Leave *Generate private key and CSR with Cloudflare* selected
3. Private key type: **RSA (2048)**. ECC works too, but the verification
   commands in step 2 assume RSA, so take RSA unless you have a reason.
4. Hostnames: the box is prefilled with `bagiberbagi.id` and `*.bagiberbagi.id`.
   Keep both. The wildcard covers `www`; the apex entry is what covers
   `bagiberbagi.id` itself, since a wildcard does not.
5. Validity: **15 years**
6. **Create**

Two text blocks appear. Keep the tab open until step 2 is finished.

- **Origin Certificate** — can be re-displayed later
- **Private Key** — shown once, never again. Losing it means generating a new
  certificate, which is free and takes a minute, so this is annoying rather
  than fatal.

---

## 2. Install the certificate on the VPS

```bash
ssh -p 32550 <user-sudo>@165.22.246.217
```

**First command in that session, before anything else:**

```bash
unset HISTFILE
```

Bash records an interactive heredoc *including its body*, so without this the
complete private key is written verbatim into `~/.bash_history` and stays there,
readable by anything running as your user and captured by every backup of
`/home`. Unsetting `HISTFILE` means this whole session is not recorded, which is
the intended trade.

Create the directory. Mode 700 means only root can even list it.

```bash
sudo mkdir -p /etc/ssl/cloudflare
sudo chown root:root /etc/ssl/cloudflare
sudo chmod 700 /etc/ssl/cloudflare
```

Paste the **Origin Certificate**. Type the first line and press Enter, paste the
block, **press Enter once more so the cursor sits on an empty line**, then type
`PEM` and Enter.

```bash
sudo tee /etc/ssl/cloudflare/bagiberbagi.id.pem > /dev/null <<'PEM'
-----BEGIN CERTIFICATE-----
...paste the Origin Certificate here, including both marker lines...
-----END CERTIFICATE-----
PEM
```

That extra Enter matters: whether the clipboard carries a trailing newline
varies by browser and OS, and without one the terminator ends up glued to the
end of the last line as `-----END CERTIFICATE-----PEM`, which never closes the
heredoc. If the prompt is still showing `>` after you typed `PEM`, press Ctrl-C
and start the command over.

Now the **Private Key**, same shape and the same extra Enter:

```bash
sudo tee /etc/ssl/cloudflare/bagiberbagi.id.key > /dev/null <<'KEY'
-----BEGIN PRIVATE KEY-----
...paste the Private Key here, including both marker lines...
-----END PRIVATE KEY-----
KEY
```

Lock the permissions:

```bash
sudo chmod 644 /etc/ssl/cloudflare/bagiberbagi.id.pem
sudo chmod 600 /etc/ssl/cloudflare/bagiberbagi.id.key
sudo chown root:root /etc/ssl/cloudflare/bagiberbagi.id.*
```

### Verify before touching nginx

Three checks. All cheap, and together they catch the failure that otherwise
surfaces later as a confusing `nginx -t` error or, worse, as a 526 in
production.

**1. Are the files parseable at all?** Run these first. A truncated paste, or
one that still contains the `...paste the ... here...` placeholder line, fails
here with a clear error.

```bash
sudo openssl x509 -noout -subject -in /etc/ssl/cloudflare/bagiberbagi.id.pem
sudo openssl rsa  -noout -check   -in /etc/ssl/cloudflare/bagiberbagi.id.key
```

Expect a subject line, and `RSA key ok`.

**2. Do the certificate and the key belong together?** The two hashes must match.

```bash
sudo openssl x509 -noout -modulus -in /etc/ssl/cloudflare/bagiberbagi.id.pem | openssl md5
sudo openssl rsa  -noout -modulus -in /etc/ssl/cloudflare/bagiberbagi.id.key | openssl md5
```

> **"Identical" is not sufficient on its own.** openssl writes parse errors to
> stderr and nothing to stdout, so two unreadable files both pipe an empty
> stream into md5 and both print
> `d41d8cd98f00b204e9800998ecf8427e` — a perfect match that means both files are
> broken. If you see that exact value, check 1 above failed. This is why check 1
> comes first.

For an ECC key, compare
`openssl x509 -pubkey -noout -in ...pem | openssl md5` against
`openssl pkey -pubout -in ...key | openssl md5` instead.

**3. Does the certificate cover both hostnames, and how long does it run?**

```bash
sudo openssl x509 -noout -dates -ext subjectAltName \
  -in /etc/ssl/cloudflare/bagiberbagi.id.pem
```

Expect `DNS:bagiberbagi.id` and `DNS:*.bagiberbagi.id` in the SAN list, and a
`notAfter` roughly 15 years out.

---

## 3. Add the 443 listener to nginx

### Find the live file

It is **not** at the Debian-conventional `sites-available` path. Find it rather
than guessing, and confirm there is exactly one match:

```bash
sudo nginx -T 2>/dev/null | grep -c '^# configuration file .*bagiberbagi'
LIVE=$(sudo nginx -T 2>/dev/null | sed -n 's/^# configuration file \(.*bagiberbagi[^:]*\):$/\1/p' | head -1)
echo "$LIVE"
```

The count must be **1**. Anything else means a leftover vhost fragment is also
loaded (an old `-le-ssl.conf`, a stray copy from a previous manual edit), and
`head -1` would silently pick whichever sorts first. Stop and look by hand:
`sudo nginx -T | grep '^# configuration file'`.

`$LIVE` lives only in this shell. Open a new SSH session and you must re-run
those lines before any command below that uses it.

### Check the config directory is clean

```bash
sudo ls -la "$(dirname "$LIVE")"
```

Stock Debian nginx pulls that whole directory in with
`include /etc/nginx/sites-enabled/*;` and **no extension filter**. Anything
sitting there is live config, including a file named `.bak` or `.old`. Two
copies of this vhost means nginx keeps the first and logs
`conflicting server name ... ignored` as a *warning*, so `nginx -t` still
reports success and the problem hides. If there is anything in that directory
other than the vhost, move it to `/root/` before continuing.

### Copy the target config up

From your laptop, in a second terminal, from the repo root:

```bash
scp -P 32550 deploy/nginx/bagiberbagi.id.conf \
  <user-sudo>@165.22.246.217:/tmp/bagiberbagi-target.conf
```

### Gate on directives, not on text

The live file and the repo file **are expected to differ in their comments.**
The previous rollout (`RUNBOOK-infra-seo.md`) applied its change by hand-copying
only the altered lines into the live file, so the live copy carries today's
directives with yesterday's comments. A full-text diff here is noise, and a
runbook that told you to stop on any difference would strand you.

Compare what nginx actually reads instead:

```bash
diff -u \
  <(sudo grep -vE '^[[:space:]]*(#|$)' "$LIVE") \
  <(grep -vE '^[[:space:]]*(#|$)' /tmp/bagiberbagi-target.conf)
```

`sudo` sits on the inner `grep`, which is the part that needs root, and
deliberately **not** on `diff`. Putting it on the outside breaks the command:
sudo closes every file descriptor above 2 before exec (the `closefrom` default,
3, on every current Ubuntu), and process substitution passes its two pipes as
`/dev/fd/63` and `/dev/fd/62`. `sudo diff <(...) <(...)` therefore fails with
`diff: /dev/fd/63: No such file or directory`, naming a path that appears
nowhere in this document.

Expect **added lines only**, and only these:

```
+    listen 443 ssl;
+    listen [::]:443 ssl;
+    http2 on;
+    ssl_certificate     /etc/ssl/cloudflare/bagiberbagi.id.pem;
+    ssl_certificate_key /etc/ssl/cloudflare/bagiberbagi.id.key;
+    ssl_protocols       TLSv1.2 TLSv1.3;
+    ssl_prefer_server_ciphers off;
+    ssl_session_cache   shared:SSL:10m;
+    ssl_session_timeout 1d;
+    ssl_session_tickets off;
```

**Any removed line, or any added line that is not in that list, means the live
file has a directive this repo does not know about.** Copying over it would
delete it silently. Stop, and reconcile the two files first.

If you want to read the comment differences too, `sudo diff -u "$LIVE"
/tmp/bagiberbagi-target.conf` still works. It is informational, not a gate.

### Back up, apply, test

The backup goes to `/root/`, **outside** the directory nginx globs, for the
reason above. This matches what `RUNBOOK-infra-seo.md` already does.

```bash
sudo cp "$LIVE" /root/bagiberbagi.id.conf.bak-pre-tls
sudo cp /tmp/bagiberbagi-target.conf "$LIVE"
sudo nginx -t
```

Expected, both lines:

```
nginx: the configuration file ... syntax is ok
nginx: configuration file ... test is successful
```

`nginx -t` is a real gate for the certificate: a missing or malformed
`ssl_certificate` fails it, and a failed test means the running config is never
replaced. If it fails, restore and re-read the error. Nothing is live yet.

```bash
sudo cp /root/bagiberbagi.id.conf.bak-pre-tls "$LIVE"
```

On success:

```bash
sudo systemctl reload nginx
sudo ss -lntp | grep ':443'
```

That must now show `nginx` listening on `0.0.0.0:443` and `[::]:443`. A reload
is enough to bind a newly added port; nginx starts new worker processes for the
new config. If 443 is absent from that output, the reload did not take the new
file: check `sudo systemctl status nginx` and `sudo journalctl -u nginx -n 30`.

**From this point the new config is live on port 80 as well**, because both
ports share one server block. Port 80 is still what the edge is using, so if the
sweep in step 4 shows 403 or 404 on directory routes, use the origin-layer
rollback at the top of this document rather than pressing on.

---

## 4. Verify the origin actually serves HTTPS

From your laptop, not from the VPS. These bypass Cloudflare with `--resolve`,
so they measure the origin itself.

**A certificate error here is the expected result, not a failure.**

```bash
curl -sSI --resolve www.bagiberbagi.id:443:165.22.246.217 https://www.bagiberbagi.id/
```

Expect `SSL certificate problem: unable to get local issuer certificate` or
`self signed certificate in certificate chain`. Your laptop does not trust
Cloudflare's Origin CA and never will. Reaching a TLS error instead of
`Failed to connect` is itself the proof that the handshake got somewhere.

Now the real check, skipping validation:

```bash
curl -sSIk --resolve www.bagiberbagi.id:443:165.22.246.217 https://www.bagiberbagi.id/ | head -3
```

Expect `HTTP/2 200`.

**Confirm it is the right certificate**, not some other service that happened to
be on the port:

```bash
echo | openssl s_client -connect 165.22.246.217:443 -servername www.bagiberbagi.id 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates
```

The issuer must name **CloudFlare Origin SSL Certificate Authority**.

**Sweep real routes over BOTH ports.** Port 80 is what the edge is still using,
so a regression there is the one that would actually hurt.

Most of the list lands in `location /`, which is the point: it is where the
directory-route failure lives. `/keystatic/` is in there to exercise the one
other block with routing logic of its own, the `^~` SPA fallback. The
fingerprinted-asset block is checked separately below, because a status code
cannot see what is wrong with it.

```bash
for port in 80 443; do
  scheme=$([ "$port" = 443 ] && echo https || echo http)
  for u in / /faq/ /jejak/ /organisasi/ /program/jumat-berkah/ /llms.txt /sitemap-index.xml /keystatic/; do
    code=$(curl -sSk -o /dev/null -w '%{http_code}' \
      --resolve "www.bagiberbagi.id:$port:165.22.246.217" "$scheme://www.bagiberbagi.id$u")
    printf "%-4s %-28s %s\n" "$port" "$u" "$code"
  done
done
```

All sixteen must be 200. A 403 on the directory routes while `/llms.txt` stays
200 is the `index index.html` failure that has happened before; roll back.

**Then check one fingerprinted asset**, which needs its headers read rather than
its status code, since a broken `expires` or a dropped `add_header` still
returns 200. Pull a real asset path out of the homepage rather than hardcoding
one, because the hash changes on every build:

```bash
ASSET=$(curl -sSk --resolve www.bagiberbagi.id:443:165.22.246.217 \
  https://www.bagiberbagi.id/ \
  | grep -oE '/_astro/[A-Za-z0-9._-]+\.(css|js|webp)' | head -1)
echo "$ASSET"
curl -sSIk --resolve www.bagiberbagi.id:443:165.22.246.217 \
  "https://www.bagiberbagi.id$ASSET" \
  | grep -iE 'HTTP/|cache-control|x-content-type-options'
```

Expect 200, `max-age=31536000`, `immutable`, and `nosniff`. Two separate
`cache-control` lines is the expected shape here, not a bug; the nginx conf
explains why.

### If it times out instead of answering

`ss` showing nginx bound to 443 while curl hangs means a firewall, not nginx.
Two places to look, and this droplet may have either or both:

```bash
sudo ufw status          # if active, 443/tcp must be ALLOW
```

Plus the DigitalOcean cloud firewall in the control panel, which sits outside
the droplet and is invisible to `ufw`.

Note the difference in symptom: **connection refused** means nothing is
listening, **timeout** means something is dropping the packets. Both must be
resolved before step 5, because both become a full outage the moment the edge
stops using port 80.

---

## 5. Switch Cloudflare to Full (Strict)

Only now. Step 4 must have passed on both ports.

1. Cloudflare → zone `bagiberbagi.id` → **SSL/TLS → Overview → Configure**
2. **Custom SSL/TLS** is already selected from step 0. Change the mode from
   **Flexible** to **Full (strict)**, then **Save**.

Full (strict) validates the origin certificate, and Cloudflare trusts its own
Origin CA. That is the entire reason this certificate type works here.

---

## 6. Verify through the edge

```bash
for u in / /faq/ /tentang/ /jejak/ /organisasi/ /program/jumat-berkah/ /llms.txt; do
  code=$(curl -sS -o /dev/null -w '%{http_code}' "https://www.bagiberbagi.id$u")
  printf "%-30s %s\n" "$u" "$code"
done
```

All 200. If any of them is a 5xx, the site is **down for every visitor** and the
edge is no longer falling back to port 80. Roll the mode back first, then read
the table:

| code | what it means | after rolling back to Flexible |
|---|---|---|
| 521 | origin refused the connection on 443 | nginx is not listening. `sudo ss -lntp \| grep ':443'` on the VPS, redo step 3's reload. |
| 522 | packets dropped before reaching nginx | firewall. `ufw status` and the DigitalOcean cloud firewall, per step 4. |
| 525 | TCP connected, TLS handshake failed | certificate and key do not pair, or protocol mismatch. Redo step 2's checks. |
| 526 | handshake fine, certificate rejected | wrong certificate, or the hostnames are missing from the SAN list. Redo step 2 check 3. |

Confirm the edge behaviour that was already correct still is:

```bash
curl -sSI http://www.bagiberbagi.id/ | head -2
# 301 to https, from Always Use HTTPS

curl -sSI https://www.bagiberbagi.id/ | grep -i strict-transport
# strict-transport-security: max-age=15552000
```

---

## 7. Record it

Once step 6 passes, four places in the repository state the old reality as fact
and become wrong:

- `deploy/README.md` — the paragraph near the top asserting the origin has no
  TLS, and the closing line saying no certificate needs renewing
- `deploy/nginx/bagiberbagi.id.conf` — the header comment declaring the file a
  target rather than what is live
- `deploy/RUNBOOK-infra-seo.md` line ~47 — claims the origin has a Let's Encrypt
  certificate via certbot. That was already false before this work; after it, it
  is false in a new way.
- `deploy/vps-setup.sh` — its certbot flow no longer matches how TLS is actually
  obtained here (see the warning added to the top of that script)

Do not trust that list to stay complete. Find them instead:

```bash
grep -rniE "certbot|let's encrypt|terminat|no TLS" --include='*.md' --include='*.sh' --include='*.conf' . \
  | grep -v node_modules
```

Tell Claude the runbook is done and those get corrected in one commit.

---

## Optional, later: Authenticated Origin Pulls

Everything above encrypts the Cloudflare-to-origin leg. It does not stop someone
who learns the origin IP from talking to it directly and bypassing the edge
entirely, including its WAF and its caching. The IP is written down in
`deploy/README.md`, and origin IPs are discoverable regardless.

Authenticated Origin Pulls closes that: nginx demands a client certificate that
only Cloudflare holds, and refuses everyone else.

```
SSL/TLS → Origin Server → Authenticated Origin Pulls
plus ssl_client_certificate + ssl_verify_client on in nginx
```

It is deliberately **not** part of this runbook. Turning it on with a wrong
certificate path makes the origin refuse Cloudflare too, which is a full outage
with a rollback that needs SSH rather than a dashboard toggle. It also earns
much less than the encryption above, because everything this origin serves is
public static HTML. Worth doing as its own piece of work, on its own day.

## Alternative considered: Let's Encrypt

A publicly trusted certificate from certbot works here too, and it survives the
proxy being turned off, which Origin CA does not.

It was not chosen because it costs a renewal that has to keep working for 90
days at a time, forever, on a box nobody logs into between deploys. A renewal
that quietly stops takes the site down with a 526 three months after anyone last
thought about it. Origin CA runs 15 years with nothing to maintain, and the
constraint it adds, keeping the records proxied, is something this site wants
anyway.

If the proxy ever has to come off, switch to certbot then. The nginx block
changes by two paths.
