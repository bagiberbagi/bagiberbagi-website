## ADDED Requirements

### Requirement: Primary nav order
The header nav SHALL render, in order: Home, Program, Tentang Kami, FAQ, with "Donasi Sekarang" as a visually distinct CTA (not a plain nav link). "Cara Kerja" SHALL NOT appear as a top-level nav item.

#### Scenario: Desktop nav renders in the new order
- **WHEN** the header renders on a desktop viewport
- **THEN** the nav links appear left-to-right as Home, Program, Tentang Kami, FAQ, followed by the "Donasi Sekarang" CTA button

#### Scenario: Mobile nav panel matches the same order
- **WHEN** the mobile nav toggle is opened
- **THEN** the panel lists the same items in the same order, ending with the "Donasi Sekarang" CTA

### Requirement: Program mega-menu structure
The "Program" nav item SHALL open a mega-menu with 3 even-width category columns (`bagiberbagimakanan`, `bagiberbagibantuan`, `bagiberbagipendidikan`) plus one promo column, on desktop viewports.

#### Scenario: Mega-menu shows all categories
- **WHEN** the Program mega-menu is open on desktop
- **THEN** all 3 categories are visible as separate, equal-width columns, each with an icon + label header

#### Scenario: Promo column links to the active program
- **WHEN** the Program mega-menu is open
- **THEN** the promo column shows content promoting "Jumat Berkah" and links to `/jumat-berkah`

### Requirement: Program item active/coming-soon state
Within the mega-menu, the "Jumat Berkah" item SHALL be a clickable link to `/jumat-berkah`. The other 6 items SHALL render as non-interactive (non-`<a>`) text with a visible "Segera Hadir" badge/style, matching the existing `disabled` convention used in the `programs` Content Collection.

#### Scenario: Jumat Berkah is clickable
- **WHEN** a user clicks the "Jumat Berkah" item in the mega-menu
- **THEN** the browser navigates to `/jumat-berkah`

#### Scenario: Other items are not clickable
- **WHEN** a user views any of the other 6 program items in the mega-menu
- **THEN** the item shows a "Segera Hadir" badge and is not an anchor/link (no click navigation occurs)

### Requirement: Click-triggered open/close interaction
The mega-menu SHALL open on click of the "Program" nav trigger (not on hover), toggle `aria-expanded` on the trigger, and close when the user clicks outside the menu or presses Escape.

#### Scenario: Opening via click
- **WHEN** a user clicks the "Program" nav trigger while the mega-menu is closed
- **THEN** the mega-menu becomes visible and the trigger's `aria-expanded` attribute becomes `"true"`

#### Scenario: Closing via click-outside
- **WHEN** the mega-menu is open and the user clicks anywhere outside the menu
- **THEN** the mega-menu closes and `aria-expanded` reverts to `"false"`

#### Scenario: Hover alone does not open the menu
- **WHEN** a user hovers over the "Program" nav trigger without clicking
- **THEN** the mega-menu does not open

### Requirement: Mobile accordion behavior
On mobile viewports, the Program mega-menu content SHALL render as an expandable accordion inside the existing mobile nav panel, rather than a hover/flyout dropdown.

#### Scenario: Expanding Program on mobile
- **WHEN** a user taps "Program" inside the open mobile nav panel
- **THEN** the 3 categories and promo content expand inline within the panel (no separate flyout)
