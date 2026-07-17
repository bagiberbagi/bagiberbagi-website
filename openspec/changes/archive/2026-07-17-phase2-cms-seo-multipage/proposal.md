## Why

Editing content that changes often (WhatsApp number, FAQ, Program list, footer links) currently requires editing TypeScript in `src/consts.ts` and going through a full git commit/push/CI cycle. This is a barrier for a non-developer to maintain the site, and the site is also missing baseline SEO infrastructure (sitemap, robots.txt) and standalone routes for legal content that already exists as a Content Collection but isn't rendered as pages.

## What Changes

- Migrate editorial (frequently-edited, non-layout-bound) data out of `src/consts.ts` into Astro Content Collections: a `settings` singleton (WA number, socials, stat targets) and `faqs`, `programs`, `footer-cols` collections.
- Add Keystatic as a git-native admin UI (`/keystatic` route) so non-developers can edit that content through a form and have it committed to `main` automatically, triggering the existing GitHub Actions build+deploy pipeline. No new server process, no database.
- Add SEO essentials: `@astrojs/sitemap` integration, `site` field in `astro.config.mjs`, `public/robots.txt` referencing the sitemap.
- Add standalone pages for content that only lives inline today: `/privasi`, `/syarat`, `/transparansi` (rendering the existing `legal` Content Collection entries), and a dedicated `/faq` page. Home page keeps its inline sections; new pages are additive, not a replacement of the single-page layout.
- `FEATURES`, `STEPS`, `IMPACTS`, `NAV_LINKS` stay in `src/consts.ts` — they're layout/design-bound (icon enums, fixed section order), not content an editor would realistically change, so migrating them would add editing surface without reducing any actual friction.

## Capabilities

### New Capabilities
- `content-cms`: Content Collections schema for settings/faqs/programs/footer-cols, plus Keystatic config and admin route for editing them without touching code.
- `seo-essentials`: sitemap generation, robots.txt, canonical `site` URL configuration.
- `legal-and-faq-pages`: standalone routed pages for legal documents and FAQ, sourced from Content Collections.

### Modified Capabilities
(none — no existing specs in `openspec/specs/` yet; this is the first change for this project)

## Impact

- **Affected code**: `src/consts.ts` (trim migrated exports), `src/content/config.ts` (new collection schemas), new `src/content/{settings,faqs,programs,footer-cols}/` entries, `src/components/{Header,Footer,Faq,DonationCalculator,JoinUs}.astro` (switch from `consts.ts` imports to `getCollection`/`getEntry`), `astro.config.mjs` (`site` field, sitemap integration), new `src/pages/{privasi,syarat,transparansi,faq}.astro`, new `keystatic.config.ts` + `src/pages/keystatic/[...params].astro`.
- **New dependencies**: `@keystatic/core`, `@keystatic/astro`, `@astrojs/sitemap`.
- **Deploy pipeline**: unchanged — still `bun test` → `astro check` → `bun run build` → rsync to VPS on push to `main`. Keystatic writes commits through the same path.
- **Auth**: requires a GitHub OAuth App (or GitHub App) registration for Keystatic login — one-time manual setup outside the repo, credentials stored as env vars/secrets.
- **No architecture change**: `output: 'static'` stays as-is; no SSR, no runtime database.
