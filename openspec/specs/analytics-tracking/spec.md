# analytics-tracking Specification

## Purpose
Analytics yang dikelola dari Keystatic dan sadar-consent: injeksi skrip per-provider yang di-gate switchboard, analitik privat cookieless tanpa consent, provider berbasis cookie di balik consent, satu taksonomi event bersama, plus consent banner + Consent Mode v2.

## Requirements

### Requirement: CMS-managed provider toggles

The system SHALL expose an editable `analytics` config in Keystatic where each analytics provider has an independent enable toggle and an ID/key field. A provider's client script SHALL be injected into the page **only when that provider is both enabled and its ID/key is non-empty**. The config SHALL be readable by `BaseLayout` at build time; provider IDs are treated as public client-side values, not secrets.

#### Scenario: Provider enabled with ID
- **WHEN** an editor enables a provider in `/keystatic` and fills its ID, then saves
- **THEN** after the resulting deploy, that provider's script is present on every page

#### Scenario: Provider enabled but ID empty
- **WHEN** a provider is enabled but its ID/key field is blank
- **THEN** the provider's script SHALL NOT be injected, and the build SHALL NOT error

#### Scenario: Provider disabled
- **WHEN** a provider is unchecked
- **THEN** its script SHALL NOT be injected regardless of whether its ID field holds a value

#### Scenario: Default state
- **WHEN** the `analytics` config is first created with no provider enabled
- **THEN** the site SHALL render exactly as before this change (no analytics scripts, no consent banner)

### Requirement: Cookieless private analytics needs no consent

The system SHALL support PostHog as a cookieless provider that, when enabled, loads immediately without requiring visitor consent and without setting cookies.

#### Scenario: PostHog only
- **WHEN** PostHog is the only enabled provider
- **THEN** its script loads on page load, no consent banner is shown, and no cookies are set by analytics

### Requirement: Consent gating for cookie-based providers

Cookie-based providers (GA4, Meta Pixel, Google Tag Manager, Microsoft Clarity) SHALL NOT load or set cookies until the visitor grants consent. The system SHALL implement Google Consent Mode v2 with consent defaulted to **denied**, upgrading to granted only after the visitor accepts.

#### Scenario: Cookie provider before consent
- **WHEN** a cookie-based provider is enabled and the visitor has not yet responded to the consent banner
- **THEN** that provider SHALL NOT set cookies or send identifying hits (Consent Mode default = denied)

#### Scenario: Consent granted
- **WHEN** the visitor accepts the consent banner
- **THEN** enabled cookie-based providers SHALL initialize and begin tracking, and the choice SHALL persist across pages

#### Scenario: Consent declined
- **WHEN** the visitor declines the consent banner
- **THEN** cookie-based providers SHALL remain inactive, while cookieless PostHog (if enabled) SHALL continue to work

### Requirement: Consent banner presence and guard

The system SHALL render a minimal consent banner whenever at least one cookie-based provider is enabled. A dedicated banner toggle MAY exist, but if a cookie provider is enabled while the banner is turned off, the system SHALL surface a warning (build log or admin-facing note) rather than silently shipping cookie tracking without consent.

#### Scenario: Banner auto-shown
- **WHEN** any cookie-based provider is enabled
- **THEN** the consent banner SHALL be present on the site

#### Scenario: Misconfiguration warning
- **WHEN** a cookie-based provider is enabled but the consent banner is disabled
- **THEN** the system SHALL emit a warning identifying the unsafe configuration

### Requirement: Shared event taxonomy

The system SHALL emit a defined set of interaction events through a single client-side event layer that forwards to all active event-capable providers (PostHog and, when enabled, GTM/`dataLayer`). Events SHALL be defined once and reused, not duplicated per provider. The taxonomy SHALL cover, at minimum:
- **Donation intent (primary conversion)**: click on a WhatsApp "Donasi" link, carrying `program`, `pax`, and source-page parameters; and click on "Hitung Donasi".
- **Program interest**: program card click, mega-menu program-item click, program selection in the calculator.
- **Contact**: WhatsApp contact click, email click.
- **Outbound**: clicks leaving to social media (Instagram/TikTok).

The event layer SHALL be a single vanilla-JS module (no UI framework) that attaches to existing markup via `data-*` hooks and degrades to a no-op when no provider is active.

#### Scenario: WhatsApp donation click tracked
- **WHEN** a visitor clicks a WhatsApp "Donasi" link and at least one event-capable provider is active
- **THEN** a donation-intent conversion event fires with the program, pax count, and source page

#### Scenario: No provider active
- **WHEN** no event-capable provider is enabled
- **THEN** the event module loads without error and performs no network activity

#### Scenario: Multiple providers active
- **WHEN** both PostHog and GTM are active
- **THEN** each taxonomy event is delivered to both from a single definition, without double-defining the event

### Requirement: Off-site conversion limitation documented

Because donations are completed off-site in WhatsApp, the system SHALL treat the WhatsApp "Donasi" click as the conversion signal and SHALL document that this measures **intent, not completed donations**. Ad optimization built on this signal optimizes toward clicks, not confirmed donations. Server-side confirmation (Conversions API + manual matching) is explicitly out of scope for this change.

#### Scenario: Conversion signal semantics
- **WHEN** the donation conversion event is configured for an ad provider
- **THEN** it SHALL be based on the WhatsApp click, and the documentation SHALL state that completed-donation tracking is not available in this change

### Requirement: Static architecture preserved

This change SHALL NOT introduce an SSR adapter, backend, or datastore. The site SHALL remain `output: 'static'`. All analytics providers SHALL be client-side scripts, and all configuration SHALL be build-time content read from the CMS.

#### Scenario: Build output unchanged in kind
- **WHEN** the site is built with analytics configured
- **THEN** it SHALL still produce a fully static `dist/` with no server runtime requirement
