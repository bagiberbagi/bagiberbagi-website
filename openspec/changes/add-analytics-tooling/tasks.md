## 1. Config + conditional loader (all providers default off)

- [ ] 1.1 Add `analytics` singleton to `keystatic.config.ts`: checkbox + ID/host fields for PostHog (host + project key), GA4 (measurement ID), Meta Pixel (pixel ID), Microsoft Clarity (project ID), Google Tag Manager (container ID), plus a "show consent banner" checkbox. Add field descriptions clarifying IDs are public + example formats.
- [ ] 1.2 Add matching zod schema to `content.config.ts` for the `analytics` collection/singleton (all providers optional, default disabled) and register it in `collections`.
- [ ] 1.3 Create `src/content/analytics/analytics.json` seeded with every provider disabled and empty IDs.
- [ ] 1.4 Add a helper (e.g. `src/lib/analytics.ts`) that reads the config and returns, per provider, `{ enabled, id }` plus derived flags: `anyCookieProvider`, `needsConsentBanner`.
- [ ] 1.5 In `BaseLayout.astro`, read the config and conditionally render each provider's script **only when enabled AND id non-empty**. Verify with all-off config the built HTML is byte-identical to pre-change (no analytics markup, no banner).
- [ ] 1.6 `bunx astro check` + `bun run build` green; register the `analytics` area in the Keystatic sidebar navigation group.

## 2. PostHog (Layer A) + event layer

- [ ] 2.1 Add the PostHog snippet in `BaseLayout` gated by its toggle, configured cookieless (`persistence: 'memory'`, `person_profiles: 'identified_only'`) so it needs no consent.
- [ ] 2.2 Create `src/scripts/analytics.js` — a single vanilla-JS event module that normalizes events and delivers to whichever providers are present (`posthog.capture` and/or `window.dataLayer.push`); no-op when none active.
- [ ] 2.3 Add `data-track` (and param) attributes to tracked elements: WA "Donasi" links (`DonationCalculator.astro`, `[program].astro`), "Hitung Donasi" link, program cards (`ProgramHighlights.astro`), mega-menu items (`Header.astro`), calculator program-select change, footer WA/email/social links.
- [ ] 2.4 Wire the event taxonomy from the spec: donation-intent (program + pax + source), hitung-donasi, program-card-click, mega-menu-click, program-select, contact-wa, contact-email, outbound-social. Confirm the WA-donation event carries program/pax/source.
- [ ] 2.5 Verify in a dev build with a test PostHog key that each interaction fires exactly one event with correct params (Playwright or manual); confirm no double-fire.

## 3. Consent banner + Consent Mode

- [ ] 3.1 Build a minimal consent-banner Astro component using design-system tokens (accept / decline), rendered only when `needsConsentBanner`.
- [ ] 3.2 Add its small vanilla script: store choice in localStorage, expose grant/deny, persist across pages, re-show only until answered.
- [ ] 3.3 Implement Google Consent Mode v2 defaults (all denied) emitted before any cookie tag; upgrade to granted on accept.
- [ ] 3.4 Add the misconfiguration guard: emit a build-log/console warning when a cookie provider is enabled but the banner toggle is off.
- [ ] 3.5 Verify: PostHog-only → no banner, no cookies; enable a cookie provider → banner shows, no cookies before consent, cookies only after accept, still-none after decline.

## 4. Ad-measurement layer (Layer B), consent-gated

- [ ] 4.1 GA4: inject gtag gated by toggle + consent; send the shared events (map donation-intent to a GA4 conversion event name).
- [ ] 4.2 Meta Pixel: inject base code gated by toggle + consent; fire the donation-intent event as the Pixel conversion.
- [ ] 4.3 GTM: inject container gated by toggle + consent; confirm it reads the same `dataLayer` events. Document the "with GTM on, manage GA4/Pixel inside GTM, not as direct tags" convention to avoid double-fire.
- [ ] 4.4 (Optional) Microsoft Clarity: inject gated by toggle + consent.
- [ ] 4.5 Verify each provider loads only after consent, fires the donation conversion, and no provider double-fires when GTM + a direct tag are both on (guard/doc holds).

## 5. Docs & companion tooling (outside the site code)

- [ ] 5.1 README: operator guide — where to toggle providers, that IDs are public, toggle → ~2 min deploy, consent implications, and the off-site (intent-not-completion) conversion limitation.
- [ ] 5.2 Document the Looker Studio report setup (GA4 data source, shareable/export) as the stakeholder-facing dashboard.
- [ ] 5.3 Document UptimeRobot monitor setup (external, ping + alert) as the reliability tool.
- [ ] 5.4 Update `CLAUDE.md` architecture notes: new `analytics` config area, conditional BaseLayout injection, consent gating, static-preserved.

## 6. Verification & close-out

- [ ] 6.1 Full `bunx astro check` + `bun run build` green; site remains `output: 'static'`.
- [ ] 6.2 Confirm default-off posture ships nothing; each provider independently toggleable end-to-end.
- [ ] 6.3 Feature branch, review, merge to `main`, verify deploy; archive this OpenSpec change.
