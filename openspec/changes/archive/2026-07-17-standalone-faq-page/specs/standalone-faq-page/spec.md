## ADDED Requirements

### Requirement: FAQ content exists only on its own page
The homepage SHALL NOT render an embedded FAQ section. `/faq` SHALL remain the sole route rendering FAQ content.

#### Scenario: Homepage has no FAQ section
- **WHEN** the homepage (`/`) renders
- **THEN** no FAQ questions/answers or `#faq` section appear on the page

#### Scenario: /faq still renders full FAQ content
- **WHEN** a user navigates to `/faq`
- **THEN** all FAQ entries render with the existing accordion behavior, unchanged

### Requirement: Nav FAQ link navigates to the standalone page
The header nav's "FAQ" entry SHALL link directly to `/faq`, not to an in-page anchor.

#### Scenario: Clicking FAQ in nav goes to /faq
- **WHEN** a user clicks "FAQ" in the header nav (desktop or mobile)
- **THEN** the browser navigates to `/faq`

### Requirement: Nav supports mixed anchor and page links
The nav rendering SHALL support entries that are in-page anchors (scroll-spied) and entries that are page navigations (not scroll-spied) without special-casing individual entries in the render logic.

#### Scenario: Anchor entries still scroll-spy
- **WHEN** a user scrolls the homepage past a section corresponding to an anchor-type nav entry
- **THEN** that nav entry is highlighted as active, as it is today

#### Scenario: Page-link entries are never marked scroll-spy-active
- **WHEN** the homepage is scrolled through any section
- **THEN** the "FAQ" nav entry (a page link) is never toggled into a scroll-spy "active" state
