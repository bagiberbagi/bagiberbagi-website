## ADDED Requirements

### Requirement: Sitemap is generated automatically at build time
The site SHALL generate an XML sitemap covering all built routes (including routes rendered from Content Collections) via the `@astrojs/sitemap` integration, with no manual sitemap maintenance or separate tooling.

#### Scenario: New page appears in sitemap without extra work
- **WHEN** a new page is added under `src/pages/` (or a new Content Collection entry produces a new route) and the site is built
- **THEN** the generated `dist/sitemap-index.xml`/`sitemap-0.xml` SHALL include that route's absolute URL without any manual sitemap edit

### Requirement: Canonical site URL is configured
`astro.config.mjs` SHALL declare a `site` value (`https://bagiberbagi.id`) so that sitemap entries and any canonical URLs are absolute rather than relative.

#### Scenario: Build without a site URL is misconfigured
- **WHEN** `site` is unset in `astro.config.mjs`
- **THEN** this SHALL be treated as a configuration defect to fix before this change is considered complete, since sitemap URLs would otherwise be incorrect or relative

### Requirement: robots.txt references the sitemap
The site SHALL serve a `public/robots.txt` that allows crawling and points to the sitemap index URL.

#### Scenario: Crawler discovers the sitemap
- **WHEN** a search engine crawler requests `/robots.txt`
- **THEN** the response SHALL include a `Sitemap:` directive pointing at the deployed sitemap index URL
