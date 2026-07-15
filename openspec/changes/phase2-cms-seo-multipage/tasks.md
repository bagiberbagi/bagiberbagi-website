## 1. Content Collection schemas

- [ ] 1.1 Define `settings` singleton schema (waNumber, waNumberDisplay, socials.instagram, socials.tiktok, socials.email, statLabels, statTargets) in `src/content/config.ts`
- [ ] 1.2 Define `faqs` collection schema (q, a) in `src/content/config.ts`
- [ ] 1.3 Define `programs` collection schema (label, disabled) in `src/content/config.ts`
- [ ] 1.4 Define `footer-cols` collection schema (title, links[{label, href, target?}]) in `src/content/config.ts`

## 2. Data migration (1:1 transcription, no content changes)

- [ ] 2.1 Create `src/content/settings/site.json` from current `WA_NUMBER`, `WA_NUMBER_DISPLAY`, `SOCIALS`, `STAT_LABELS`, `STAT_TARGETS`
- [ ] 2.2 Create `src/content/faqs/*.md` entries from current `FAQS` array (14 entries)
- [ ] 2.3 Create `src/content/programs/*.md` entries from current `PROGRAMS` array (4 entries)
- [ ] 2.4 Create `src/content/footer-cols/*.md` entries from current `FOOTER_COLS` array (3 entries)
- [ ] 2.5 Run `bun test` + `bunx astro check` to catch schema/data mismatches before touching components

## 3. Wire components to Content Collections

- [ ] 3.1 Update `Header.astro` to read WA number from `getEntry('settings', 'site')` (keep `NAV_LINKS` import from `consts.ts`)
- [ ] 3.2 Update `Footer.astro` to read WA number, socials, and footer columns from collections
- [ ] 3.3 Update `Faq.astro` to read from `getCollection('faqs')`
- [ ] 3.4 Update `DonationCalculator.astro` to read programs and WA number from collections
- [ ] 3.5 Update `JoinUs.astro` to read WA number from the settings singleton
- [ ] 3.6 Update `src/scripts/calculator.js` / any client script referencing WA number to receive it via a data attribute or inline script variable instead of importing `consts.ts` directly (client scripts can't `getCollection`)
- [ ] 3.7 Remove migrated exports (`WA_NUMBER`, `WA_NUMBER_DISPLAY`, `SOCIALS`, `STAT_LABELS`, `STAT_TARGETS`, `PROGRAMS`, `FAQS`, `FOOTER_COLS`) from `src/consts.ts`, keeping `FEATURES`, `STEPS`, `IMPACTS`, `NAV_LINKS`, `NAV_SECTION_IDS`, `ACTIVITIES`
- [ ] 3.8 Build and visually diff output against pre-migration build to confirm no unintended HTML changes

## 4. SEO essentials

- [ ] 4.1 Run `bunx astro add sitemap` to install and wire `@astrojs/sitemap`
- [ ] 4.2 Set `site: 'https://bagiberbagi.id'` in `astro.config.mjs`
- [ ] 4.3 Add `public/robots.txt` with `Sitemap: https://bagiberbagi.id/sitemap-index.xml`
- [ ] 4.4 Build and verify `dist/sitemap-index.xml` / `dist/sitemap-0.xml` are generated and contain expected routes

## 5. Standalone legal + FAQ pages

- [ ] 5.1 Create `src/pages/privasi.astro` rendering the `legal` collection's privacy entry
- [ ] 5.2 Create `src/pages/syarat.astro` rendering the `legal` collection's terms entry
- [ ] 5.3 Create `src/pages/transparansi.astro` rendering the `legal` collection's transparency entry
- [ ] 5.4 Create `src/pages/faq.astro` rendering all `faqs` collection entries
- [ ] 5.5 Verify existing home page anchors (`#faq`, `#privasi`, `#syarat`, `#tentang`) still scroll correctly and are unaffected by the new routes
- [ ] 5.6 Rebuild, confirm new pages appear in the sitemap generated in step 4.4

## 6. Keystatic admin UI

- [ ] 6.1 Register a GitHub OAuth App for repo access (manual, outside-repo step — needs user decision on account/org)
- [ ] 6.2 Install `@keystatic/core` and `@keystatic/astro`
- [ ] 6.3 Create `keystatic.config.ts` mapping the `settings`/`faqs`/`programs`/`footer-cols` schemas to Keystatic collections/singleton
- [ ] 6.4 Add `src/pages/keystatic/[...params].astro` admin route
- [ ] 6.5 Wire GitHub OAuth App credentials as env vars/secrets (local `.env` for dev, GitHub Actions secret if needed at build time)
- [ ] 6.6 End-to-end test: log into `/keystatic` locally, edit one FAQ entry, confirm it commits and the change appears after rebuild

## 7. Deploy verification

- [ ] 7.1 Push to `main`, confirm GitHub Actions pipeline passes (`bun test` → `astro check` → build → rsync)
- [ ] 7.2 Verify on production: `/sitemap-index.xml`, `/robots.txt`, `/faq`, `/privasi`, `/syarat`, `/transparansi` all reachable
- [ ] 7.3 Verify on production: `/keystatic` requires GitHub login and a live edit round-trips through to the deployed site
