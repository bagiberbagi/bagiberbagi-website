## Context

bagiberbagi.id is an Astro `output: 'static'` site (no adapter, no backend), content-managed through Keystatic Cloud, deployed to a VPS via GitHub Actions with Cloudflare in front. It deliberately ships ~0 KB of framework JS on the public side. Donations happen off-site: every "Donasi" CTA is a `wa.me` link that hands the visitor to WhatsApp. There is currently no analytics of any kind. The team is starting paid Meta/Google ads and needs to measure donation intent, understand program interest, and share readable reports — without breaking the static/privacy-conscious architecture, and with a non-technical operator able to turn providers on and off.

## Goals / Non-Goals

**Goals:**
- One CMS-managed switchboard: each provider is a checkbox + ID field an editor controls from `/keystatic`.
- A private, cookieless baseline (PostHog) that answers product questions (funnels, replay) with no consent friction.
- Optional, consent-gated ad-measurement layer (GA4, Meta Pixel, GTM, Clarity) for paid campaigns.
- A single event taxonomy defined once and fanned out to all active providers.
- Keep the site fully static; keep the public JS footprint minimal and gated.

**Non-Goals:**
- No SSR adapter, backend, datastore, donor portal, or CRM.
- No WhatsApp Conversions API / server-side confirmation of completed donations.
- No creation of the external SaaS accounts (PostHog/GA4/Meta/GTM/Looker/UptimeRobot) — those are operator tasks; the code only consumes their IDs.
- UptimeRobot and Looker Studio are companion tooling documented, not code in this repo.

## Decisions

### D1: Config lives in a Keystatic `analytics` singleton, not env vars
Toggles and IDs are editor-facing, so they belong in the CMS alongside the rest of the site's config (`settings`, `seo`). Each provider = `checkbox` + `text` (ID). `BaseLayout` reads it with the existing `getEntry` pattern and conditionally renders scripts. **Why not env/`.env`:** env changes need a developer + CI edit; the whole point is a non-technical toggle. **Why safe in the repo:** analytics IDs (GA4 `G-…`, Pixel ID, PostHog project key, GTM `GTM-…`, Clarity ID) are public client-side identifiers that already appear in page source — they are not secrets. Consequence of static output: a toggle is a Keystatic save → commit → deploy (~2 min), not instant; acceptable and documented.

### D2: PostHog as Layer A (cookieless), not Umami/Plausible/GA-only
PostHog Cloud's free tier (≈1M events/mo, session replay) covers this scale and answers "many decisions" (funnels show where visitors drop between viewing a program and clicking Donasi; replay shows why). Configured cookieless (`persistence: 'memory'`, `person_profiles: 'identified_only'`) so it needs no consent and reflects **all** visitors — unlike GA4 which only sees consented users. **Alternatives:** Umami (simple but free cloud tier is ~10k events/mo, weak funnels; self-host adds VPS ops), Plausible/Fathom (paid), Cloudflare Web Analytics (free but no custom events). PostHog wins on free-tier depth for the stated priorities.

### D3: Direct provider tags by default; GTM is just another optional provider
Each provider gets its own conditional script in `BaseLayout`, keyed off its checkbox — the simplest mental model for "toggle in admin". GTM is offered as an alternative container for teams that prefer managing tags in Google's UI. **Guard against double-firing:** the config/docs state that if GTM is enabled, GA4 and Meta Pixel should be managed *inside* GTM rather than also enabled as direct tags. The event layer pushes to `window.dataLayer` regardless, so GTM consumes the same events.

### D4: Consent Mode v2 + minimal banner, cookie scripts default-denied
Enabling any cookie provider introduces cookies → consent is required (UU PDP + Meta/Google policy). Implement Google Consent Mode v2 with defaults set to **denied** before any tag loads; cookie providers initialize only after the visitor accepts. The banner is a small Astro component + tiny vanilla script storing the choice (localStorage). The banner auto-renders when any cookie provider is enabled. A misconfiguration guard (build log / admin note) fires if a cookie provider is on while the banner is off, so we never silently ship non-consented tracking. PostHog (cookieless) is exempt and loads immediately.

### D5: Single vanilla-JS event layer via `dataLayer`
One module under `src/scripts/` attaches to existing markup through additive `data-track` / `data-*` attributes on the elements that already exist (WA links in `DonationCalculator` and `[program].astro`, mega-menu items in `Header`, program cards in `ProgramHighlights`, footer contact/social links). It builds a normalized event and delivers it to whichever providers are present (`posthog.capture` and/or `window.dataLayer.push`). Defined once; no per-provider duplication; no-op when nothing is active. This preserves the no-framework convention (same pattern as the other `src/scripts/*.js` modules).

### D6: WhatsApp click is the conversion signal (intent, not completion)
Since the donation finalizes in WhatsApp, the closest measurable conversion is the `wa.me` "Donasi" click, enriched with `program`, `pax`, `source`. This is what feeds ad providers. The limitation — ads optimize toward clicks, not confirmed donations — is documented in the proposal, spec, and README so the marketing side sets expectations. Real-conversion tracking is a future change (Conversions API + manual match) once a donor portal exists.

## Risks / Trade-offs

- **Off-site conversion blindness** → Document clearly; treat WA click as intent; revisit with CAPI when a portal exists. Watch for high click / low actual-donation ratio in ad reports.
- **0-KB ethos erosion from third-party scripts** → Cookie providers load only after consent and only when enabled; default posture is "PostHog only". PostHog + event script are light.
- **Consent misconfiguration shipping cookies without a banner** → Build/render guard (D4) turns this into a visible warning, not a silent leak.
- **GTM + direct-tag double-firing** → Convention documented (D3): with GTM on, manage GA4/Pixel inside GTM, not as direct tags.
- **Static toggle latency** → On/off is not instant (rebuild ~2 min); acceptable for config changes, documented for the operator.
- **PostHog free-tier limits** → Far above current scale; monitor event volume; degrade gracefully (it simply caps) rather than breaking the site.
- **Provider ID typo** → Script still injects but no data flows; low blast radius, no build break. Optional light format hint in the field description.

## Migration Plan

Phased, each independently deployable and reversible by unchecking a box:
1. Config + loader: `analytics` singleton (Keystatic + zod) + conditional injection in `BaseLayout`, all providers default off → site unchanged.
2. PostHog + the vanilla event layer + `data-*` hooks on tracked elements.
3. Consent banner + Consent Mode + misconfiguration guard.
4. Ad layer: GA4 / Meta Pixel / GTM wired to the same events, consent-gated.
5. Docs: Looker Studio report + README operator guide.
6. Docs: UptimeRobot monitor.

**Rollback:** any provider is disabled by unchecking it in Keystatic (save → deploy). The whole feature is inert when all providers are off, so a full rollback is "uncheck everything" or revert the branch before merge.

## Open Questions

- Consent banner copy/design — reuse existing design-system tokens; final wording to be confirmed with the team (non-blocking; a sensible default ships).
- Whether to also expose an outbound-social-click toggle or always-on — default always-on (cheap, cookieless via PostHog); revisit if noisy.
- Exact PostHog region/host (EU vs US cloud) — operator decision at account setup; stored in the config's host field.
