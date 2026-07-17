## Context

The site is a solo-maintained Astro static site (`output: 'static'`, no adapter). Content today splits two ways:
- `src/consts.ts` — plain TS arrays/objects for everything (WA number, socials, FAQ, programs, footer links, features, steps, impacts, nav).
- `src/content/legal/*.md` — already an Astro Content Collection (`src/content/config.ts`), but not yet routed to any page.

Deploy is GitHub Actions on push to `main`: `bun install` → `bun test` → `bunx astro check` → `bun run build` → `rsync dist/` to the VPS. This pipeline is the safety net (broken content fails CI, never reaches the VPS) and must keep working unchanged.

Not all content in `consts.ts` is a good CMS candidate. `FEATURES`, `STEPS`, `IMPACTS`, `NAV_LINKS` are small, fixed-size, and coupled to hardcoded icon enums/section order in their components — editing them means touching layout, not content. Migrating them would add editing surface without removing real friction, so they're explicitly out of scope.

## Goals / Non-Goals

**Goals:**
- Let a non-developer edit WA number, socials, stat targets, FAQ entries, program list, and footer links without touching code or git directly.
- Keep the site fully static — same build pipeline, same VPS deploy, no new always-on server process, no database.
- Keep SEO output (HTML, meta, sitemap) generated at build time, unaffected by how content is authored.
- Give legal docs and FAQ their own routable, indexable pages.

**Non-Goals:**
- No SSR/hybrid rendering, no Astro Server Islands, no PocketBase/Directus/Strapi-style backend. (Discussed and explicitly rejected for this project's scale — see prior conversation; revisit only if a concrete need for sub-minute-fresh or user-generated content shows up, e.g. a real blog or public testimonial submissions.)
- No migration of `FEATURES`/`STEPS`/`IMPACTS`/`NAV_LINKS` — stays in `consts.ts`.
- No redesign of the home page's single-page section layout — new pages (`/faq`, `/privasi`, etc.) are additive.
- No multi-user roles/permissions inside Keystatic — single admin identity via GitHub auth is sufficient at this scale.

## Decisions

**Content Collections + Keystatic over Decap/Tina/Payload/Directus/PocketBase.**
Git stays the single source of truth; Keystatic is a UI layer that commits Markdown/JSON, not a running service. This preserves `output: 'static'` and the existing deploy pipeline exactly. Keystatic was chosen over Decap (historically tied to Netlify identity/git-gateway patterns) and Tina (pulls in its own cloud/backend for live-collab) because it's git-native, has no external service dependency, and maps directly onto Astro Content Collections' zod schemas. Rejected DB-backed options (PocketBase, Directus, Strapi, Payload, Sanity/Contentful) because none of the migrated content is high-frequency/UGC — see proposal's Why.

**One singleton for site-wide settings (`settings/site.json`), three list collections (`faqs`, `programs`, `footer-cols`).**
WA number/socials/stat targets are a single record edited in place (Keystatic "singleton" pattern), not a list — matches how they're used (one value referenced everywhere) rather than forcing them into a one-entry collection.

**Component data access moves from `import { X } from '../consts'` to `getCollection('x')` / `getEntry('settings', 'site')`.**
Both run at build time only (Astro frontmatter, top-level `await`), so output HTML is byte-identical to today's for unchanged data — this is why SEO/perf is unaffected (see proposal Impact). Field access changes shape slightly (`entry.data.q` instead of `faq.q`) since Content Collections wrap authored fields under `.data`.

**Legal/FAQ get real routes, home page keeps inline sections.**
`src/pages/{privasi,syarat,transparansi}.astro` render the existing `legal` collection entries (`getCollection('legal')` + `getEntry`); `src/pages/faq.astro` renders the `faqs` collection. The home page's `Faq.astro` section stays as-is (still useful as an on-page teaser); the dedicated `/faq` page gives search engines and direct links a proper indexable target. No routing change to `index.astro` for existing anchors (`#faq`, `#privasi`, etc. keep working as before) — new pages are purely additive.

**`@astrojs/sitemap` over hand-rolled sitemap generation.**
Official integration, scans build output automatically (including new Content Collection-driven routes), zero runtime cost, no separate CLI/cron step. Requires `site:` to be set in `astro.config.mjs` (currently missing) for absolute URLs.

**Auth: Keystatic Cloud, not a self-hosted GitHub OAuth App.** (Revised during implementation — see below.)
The official `@keystatic/astro` integration always injects `/keystatic` and `/api/keystatic` routes with `prerender: false`, which requires an Astro adapter (`output: 'server'`/hybrid + a running Node process) regardless of storage backend — discovered while wiring task 6, this directly conflicts with the "no architecture change" goal. Two ways to avoid it: (a) run a small Node process on the VPS just for those two routes, or (b) skip the integration's auto-injected routes entirely and mount `<Keystatic config={...} client:load />` manually on a plain page. Option (b) only works without a server if `storage.kind: 'cloud'` is used, since GitHub-storage mode's OAuth token exchange must happen server-side (client secret can't live in the browser) — `makeGenericAPIRouteHandler` explicitly 404s for `'cloud'` storage because Keystatic Cloud handles that exchange on their own infrastructure instead. Given a choice between (1) adding a Node process to the VPS or (2) accepting Keystatic Cloud as a vendor dependency, the user chose (2) to keep `output: 'static'` and the existing rsync-only deploy pipeline completely unchanged. Trade-off accepted: a third-party account/service (keystatic.cloud) is now load-bearing for content editing, reversing the original "no vendor dependency" preference from the initial Keystatic-vs-Tina comparison — accepted because the alternative (Node adapter) was judged a bigger change to the deploy model than a Cloud account is to the vendor footprint.

The manually-mounted admin page is still a static-friendly catch-all route: `src/pages/keystatic/[...params].astro` needs an explicit `getStaticPaths()` returning a single path (Keystatic's router is a client-side SPA), and `deploy/nginx/bagiberbagi.id.conf` needs a `location /keystatic/ { try_files $uri $uri/ /keystatic/index.html; }` fallback so deep-linked sub-routes (e.g. `/keystatic/collection/faqs`) don't 404 on direct load — both are static-hosting-compatible, no server process involved.

## Risks / Trade-offs

- **[Risk]** Admin edits content through Keystatic and commits land directly on `main` (repo convention is direct-to-main, no PR gate) → a bad FAQ/program edit ships as soon as CI passes. **Mitigation**: `bun test`/`astro check` catch schema/type errors, not editorial mistakes; accept this as consistent with the project's existing solo/direct-to-main convention. Revisit (e.g. require review before merge) only if a second editor/admin joins.
- **[Risk]** Content Collection schema (zod) is stricter than the current loosely-typed `consts.ts` exports — migrating could surface hidden inconsistencies in existing data (e.g. `Faq` entries with missing fields). **Mitigation**: schema validation runs at `astro check`/build time, so any mismatch fails CI before deploy, not silently in production.
- **[Risk]** Keystatic Cloud project signup + GitHub repo connection is a manual, outside-the-repo step (not automatable via code change) → implementation can stall waiting on it. **Mitigation**: sequence tasks so Content Collection migration + SEO + new pages can be built and verified locally before the Cloud project exists; `keystatic.config.ts`'s `cloud.project` is left as a `TODO/...` placeholder and is the only piece blocked on it.
- **[Risk]** Vendor dependency: if keystatic.cloud has an outage or changes pricing/terms, content editing (not the live site) is affected. **Mitigation**: git remains the source of truth regardless — Cloud only brokers the write; worst case, edit `src/content/**` files directly and push, same as before Keystatic existed.
- **[Trade-off]** Keeping `FEATURES`/`STEPS`/`IMPACTS`/`NAV_LINKS` out of the CMS means those still require a code change + deploy to edit. Accepted: they're layout-bound, not editorial, and including them would bloat the Keystatic UI with fields that shouldn't be touched without also touching markup/icons.

## Migration Plan

1. Add Content Collection schemas for `settings` (singleton), `faqs`, `programs`, `footer-cols` in `src/content/config.ts`.
2. Author the initial content entries by transcribing current `consts.ts` values 1:1 (no content change, pure format migration) — verify via `bun test` + `astro check` + visual diff of built HTML.
3. Update consuming components (`Header`, `Footer`, `Faq`, `DonationCalculator`, `JoinUs`) to read from collections instead of `consts.ts`; remove migrated exports from `consts.ts`.
4. Add `@astrojs/sitemap`, set `site:` in `astro.config.mjs`, add `public/robots.txt`.
5. Add `src/pages/{privasi,syarat,transparansi,faq}.astro` routes.
6. Add `keystatic.config.ts` (storage `kind: 'cloud'`) + manually-mounted `/keystatic` admin route (`getStaticPaths` + `@astrojs/react` for hydration) + nginx SPA-fallback for `/keystatic/*`; sign up at keystatic.cloud, create a project, connect the GitHub repo, fill in the real `cloud.project` slug.
7. Deploy via existing pipeline; confirm sitemap/robots reachable, new pages render, Keystatic login/edit/commit loop works end-to-end on a throwaway FAQ edit.

Rollback: each step is a small, independently revertible commit (per project's one-concern-per-commit convention); reverting the Keystatic-route commit alone fully removes the admin surface without touching the Content Collection data it edits.

## Open Questions

- `keystatic.config.ts`'s `cloud.project` is a placeholder (`'TODO/bagiberbagi-website'`) until the user creates the project at keystatic.cloud and connects this GitHub repo — needed before the admin route is actually usable.
- Whether `/faq` and `/privasi` etc. get linked from the header/footer nav now, or stay unlinked-but-indexable until Phase 2's broader nav rework (mega-menu, per `plan.md`) lands.
