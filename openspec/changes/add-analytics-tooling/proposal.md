## Why

The site currently ships **zero analytics** — there is no way to see traffic, which programs draw interest, or how many visitors reach the point of clicking "Donasi". The team is about to run **paid Meta/Google ads** to drive donations, and cannot measure whether that spend produces donation intent without tracking in place. We need measurement that respects the site's static, privacy-conscious, framework-free architecture and that a non-technical operator can turn providers on/off without touching code.

## What Changes

- Add a **CMS-managed analytics config** (`analytics` Keystatic singleton) where each provider is an independent **checkbox + ID field**. `BaseLayout` injects a provider's script only when it is **checked and its ID is filled**, so providers are fully modular and editor-toggleable from `/keystatic` (save → auto-deploy).
- Add **PostHog** (Layer A — private, cookieless product analytics: funnels, session replay, dashboards) as the always-recommended baseline that needs no consent.
- Add optional **ad-measurement providers** (Layer B): **GA4**, **Meta Pixel**, **Google Tag Manager**, and optional **Microsoft Clarity** — all cookie-based, gated behind consent.
- Add a **minimal consent banner** + Google Consent Mode v2, auto-required whenever any cookie-based provider is enabled. A build/render-time **guard warns** if a cookie provider is on while the banner is off.
- Add a single **vanilla-JS event layer** (one file, no framework) pushing a defined event taxonomy to a shared `dataLayer` (consumed by PostHog + GTM). The primary conversion event is the **WhatsApp "Donasi" click** (with program, pax, source-page params).
- Document (outside the repo/site) the **Looker Studio** report and **UptimeRobot** uptime monitor as companion admin tooling.
- **Known limitation captured in the proposal**: donations complete off-site on WhatsApp, so all tracking sees *intent* (the click), never the completed donation — ads optimize toward "clicked Donasi", not real conversions. A future Conversions-API + manual-match fix is explicitly out of scope here.

Non-goals / explicitly out of scope: any SSR adapter (site stays `output: 'static'`), a backend or datastore, a donor portal/CRM, WhatsApp Conversions API, and setting up the external SaaS accounts themselves (PostHog/GA4/Meta/GTM/Looker/UptimeRobot) — those are operator actions, the code only consumes their IDs.

## Capabilities

### New Capabilities
- `analytics-tracking`: CMS-toggleable, consent-aware analytics — the `analytics` config schema, the conditional per-provider script loader in `BaseLayout`, the shared event taxonomy and vanilla-JS event layer, and the consent banner + Consent Mode gating.

### Modified Capabilities
<!-- None — no existing spec's requirements change. The analytics config is a new editable area, not a modification of content-cms behavior; existing consumers of BaseLayout are unaffected when all providers are off (the default). -->

## Impact

- **New files**: `analytics` Keystatic singleton (`keystatic.config.ts`) + zod schema (`content.config.ts`) + `src/content/analytics/analytics.json`; a conditional loader partial used by `src/layouts/BaseLayout.astro`; one event-tracking script under `src/scripts/`; a consent-banner component + its small script.
- **Touched**: `BaseLayout.astro` (inject provider scripts + consent), the components that own the tracked interactions (`DonationCalculator`, `Header`/mega-menu, `ProgramHighlights`, footer/contact links) — additive `data-*` hooks only, no behavior change.
- **Public-site weight**: third-party scripts (GTM/GA4/Pixel/Clarity) are a conscious compromise on the 0-KB ethos; mitigated by loading them only after consent and only when enabled. PostHog + the event script are small; Umami-style default is "PostHog only, everything else off".
- **Privacy/compliance**: introduces cookies once a Layer-B provider is enabled → consent banner + Consent Mode required (UU PDP + Meta/Google policy). No donor PII is collected by this change. Provider IDs are public client-side keys, safe to store in the repo.
- **Deploy**: toggling a provider is a Keystatic save → commit → existing GitHub Actions deploy (~2 min); no infra changes. UptimeRobot + Looker Studio live outside the repo.
