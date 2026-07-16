## ADDED Requirements

### Requirement: Dedicated Jumat Berkah route
The site SHALL serve a standalone page at `/jumat-berkah` using the existing page skeleton (`BaseLayout` + `Header` + content + `Footer`), consistent with other standalone pages (`/faq`, `/privasi`, `/syarat`).

#### Scenario: Page is reachable and renders the shared chrome
- **WHEN** a user navigates to `/jumat-berkah`
- **THEN** the page renders with the site `Header` and `Footer`, and a page `<title>` reflecting "Jumat Berkah"

### Requirement: Program content and donation call-to-action
The `/jumat-berkah` page SHALL present program-specific description content and a clear donation call-to-action (linking to the WhatsApp donation flow, consistent with `buildWaLink` usage elsewhere in the site).

#### Scenario: CTA is present and functional
- **WHEN** a user views the `/jumat-berkah` page
- **THEN** a donation CTA is visible and its link opens a WhatsApp chat pre-filled for the Jumat Berkah program (mirroring the existing `DonationCalculator` WA link pattern)
