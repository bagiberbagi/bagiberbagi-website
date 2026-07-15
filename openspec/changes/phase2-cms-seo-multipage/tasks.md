## 1. Content Collection schemas

- [x] 1.1 Define `settings` singleton schema (waNumber, waNumberDisplay, socials.instagram, socials.tiktok, socials.email, statLabels, statTargets) in `src/content/config.ts`
- [x] 1.2 Define `faqs` collection schema (q, a) in `src/content/config.ts`
- [x] 1.3 Define `programs` collection schema (label, disabled) in `src/content/config.ts`
- [x] 1.4 Define `footer-cols` collection schema (title, links[{label, href, target?}]) in `src/content/config.ts`

## 2. Data migration (1:1 transcription, no content changes)

- [x] 2.1 Create `src/content/settings/site.json` from current `WA_NUMBER`, `WA_NUMBER_DISPLAY`, `SOCIALS`, `STAT_LABELS`, `STAT_TARGETS`
- [x] 2.2 Create `src/content/faqs/*.md` entries from current `FAQS` array (14 entries)
- [x] 2.3 Create `src/content/programs/*.md` entries from current `PROGRAMS` array (4 entries)
- [x] 2.4 Create `src/content/footer-cols/*.md` entries from current `FOOTER_COLS` array (3 entries)
- [x] 2.5 Run `bun test` + `bunx astro check` to catch schema/data mismatches before touching components

## 3. Wire components to Content Collections

- [x] 3.1 Update `Header.astro` to read WA number from `getEntry('settings', 'site')` (keep `NAV_LINKS` import from `consts.ts`)
- [x] 3.2 Update `Footer.astro` to read WA number, socials, and footer columns from collections
- [x] 3.3 Update `Faq.astro` to read from `getCollection('faqs')`
- [x] 3.4 Update `DonationCalculator.astro` to read programs and WA number from collections
- [x] 3.5 Update `JoinUs.astro` to read WA number from the settings singleton
- [x] 3.6 Update `src/scripts/calculator.js` / any client script referencing WA number to receive it via a data attribute or inline script variable instead of importing `consts.ts` directly (client scripts can't `getCollection`)
- [x] 3.7 Remove migrated exports (`WA_NUMBER`, `WA_NUMBER_DISPLAY`, `SOCIALS`, `STAT_LABELS`, `STAT_TARGETS`, `PROGRAMS`, `FAQS`, `FOOTER_COLS`) from `src/consts.ts`, keeping `FEATURES`, `STEPS`, `IMPACTS`, `NAV_LINKS`, `NAV_SECTION_IDS`, `ACTIVITIES`
- [x] 3.8 Build and visually diff output against pre-migration build to confirm no unintended HTML changes

## 4. SEO essentials

- [x] 4.1 Run `bunx astro add sitemap` to install and wire `@astrojs/sitemap`
- [x] 4.2 Set `site: 'https://bagiberbagi.id'` in `astro.config.mjs`
- [x] 4.3 Add `public/robots.txt` with `Sitemap: https://bagiberbagi.id/sitemap-index.xml`
- [x] 4.4 Build and verify `dist/sitemap-index.xml` / `dist/sitemap-0.xml` are generated and contain expected routes

## 5. Standalone legal + FAQ pages

- [x] 5.1 Create `src/pages/privasi.astro` rendering the `legal` collection's privacy entry
- [x] 5.2 Create `src/pages/syarat.astro` rendering the `legal` collection's terms entry
- [x] 5.3 Create `src/pages/transparansi.astro` rendering the `legal` collection's transparency entry
- [x] 5.4 Create `src/pages/faq.astro` rendering all `faqs` collection entries
- [x] 5.5 Verify existing home page anchors (`#faq`, `#privasi`, `#syarat`, `#tentang`) still scroll correctly and are unaffected by the new routes
- [x] 5.6 Rebuild, confirm new pages appear in the sitemap generated in step 4.4

## 6. Keystatic admin UI

- [x] 6.1 ~~Register a GitHub OAuth App~~ — superseded: chose Keystatic Cloud instead (avoids the Node-adapter requirement of GitHub-storage mode; see design.md "Auth" decision)
- [x] 6.2 Install `@keystatic/core`, `@keystatic/astro`, `@astrojs/react` (React needed to hydrate the Keystatic UI component)
- [x] 6.3 Create `keystatic.config.ts` (storage `kind: 'cloud'`, `cloud.project` placeholder) mapping the `settings`/`faqs`/`programs`/`footerCols` schemas to Keystatic collections/singleton
- [x] 6.4 Add `src/pages/keystatic/[...params].astro` admin route — manual `<Keystatic config client:only="react" />` mount (not the `keystatic()` integration, which would force an adapter), with `getStaticPaths()` for the static build and a `Config` type assertion for a known Keystatic generics/TS-variance issue. `client:load` initially caused a blank page: it forces an SSR pass that resolves `@keystatic/core/ui` to a Node-conditional stub (`Keystatic() { return null }`); `client:only` skips SSR and gets the real browser bundle, matching `@keystatic/astro`'s own internal page. Verified via `bun run build`: `component-url` points at a 2.6MB bundle, not the ~2.5KB stub. Known caveat: `bun run dev` can still render `/keystatic` blank due to a separate, unresolved Vite dev-time SSR resolution quirk — doesn't affect `bun run build` output.
- [x] 6.5 Repo transferred to the `bagiberbagi` GitHub org and pushed; `cloud.project` in `keystatic.config.ts` set to the real `bagiberbagi/bagiberbagi-website` slug. Still needed: actually sign up/log into keystatic.cloud and connect the project there (the config points at the right slug, but the Cloud-side project itself needs to exist)
- [ ] 6.6 Apply the nginx SPA-fallback location block (already added to `deploy/nginx/bagiberbagi.id.conf` in-repo) on the live VPS — see `deploy/README.md`
- [ ] 6.7 End-to-end test: log into `/keystatic` (via Keystatic Cloud auth), edit one FAQ entry, confirm it commits to `main` and the change appears after rebuild

## 7. Deploy verification

- [ ] 7.1 Push to `main`, confirm GitHub Actions pipeline passes (`bun test` → `astro check` → build → rsync)
- [ ] 7.2 Verify on production: `/sitemap-index.xml`, `/robots.txt`, `/faq`, `/privasi`, `/syarat`, `/transparansi` all reachable
- [ ] 7.3 Verify on production: `/keystatic` loads (once 6.5/6.6 are done) and a live edit round-trips through to the deployed site
