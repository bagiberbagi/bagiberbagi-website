## ADDED Requirements

### Requirement: Expanding panels stay reachable inside the viewport
Any panel that expands in place SHALL keep every one of its interactive targets reachable at the supported phone sizes (320×568, 390×844, 430×932). A panel inside a `position: sticky` ancestor SHALL NOT rely on page scroll to reveal its lower part, because a sticky ancestor taller than the viewport stays pinned for the whole scroll and its overflow is never exposed.

#### Scenario: Mobile navigation with the programme submenu open
- **WHEN** a visitor on a 390×844 phone opens the mobile menu and then expands "Pintu Berbagi"
- **THEN** every link in the panel, including the final "Donasi Sekarang", SHALL be reachable either directly or by scrolling the panel itself
- **AND** scrolling inside the panel SHALL NOT scroll the page behind it

#### Scenario: Panel that fits needs no scroll affordance
- **WHEN** the mobile menu is open with the submenu collapsed, at 298px tall in an 844px viewport
- **THEN** the panel SHALL render exactly as it did before, with no scrollbar and no height cap taking effect

### Requirement: Standalone controls meet a minimum touch target on phones
An interactive element that is not an inline link inside running prose SHALL present a hit area of at least 44×44 CSS pixels at viewport widths at or below 430px, and SHALL leave at least 8px of clear space to its neighbours. The painted mark may stay smaller than the hit area.

A **stacked list of text links in a secondary region**, such as the footer's four link columns, is exempt from both the 44px height and the 8px clear space. The exemption exists because it was tested and the trade lost: raising four columns of 20+ links to 44px added roughly 120px to the mobile footer on every page, which the owner rejected on sight. This is a deliberate carve-out with a measured cost, not a backlog item.

What the exemption does and does not buy is worth stating, because "they touch" was reported as a defect during this change and it is not one. Measured live at 390px: each link box is **33.7px tall with exactly 0px between neighbours**. Zero gap means the boxes are adjacent, so every tap in the column lands on some link — there is no dead strip. The cost is the opposite of a dead zone: no margin for error, so a tap near a boundary can hit the neighbour. In a footer read as a list and tapped rarely, that is the cheaper failure.

The exempt region SHALL still be a *list of text links*. A control that does something other than navigate, or one that sits alone rather than in a stack, does not inherit this.

#### Scenario: Stacked text links in the footer
- **WHEN** a visitor on a 390px phone reaches the footer link columns
- **THEN** each link MAY stay below 44px tall and MAY sit flush against its neighbours
- **AND** the boxes SHALL remain adjacent rather than overlapping, so that no tap inside a column falls on nothing

#### Scenario: Share row on a programme page
- **WHEN** a visitor on a 390px phone reaches the share row on `/program/<slug>/`
- **THEN** each of the five controls SHALL present a hit area of at least 44×44 CSS pixels with at least 8px between neighbours
- **AND** the row SHALL still fit the content column at 320px without wrapping

#### Scenario: The only control for a component must not be the smallest
- **WHEN** a component hides one navigation affordance below a breakpoint, as `ProgramStage` hides its arrows below 768px
- **THEN** the affordance that remains SHALL meet the 44×44 minimum, because it is the sole control at that width

#### Scenario: A field's visible box is its hit area
- **WHEN** a form control is drawn inside a padded wrapper that reads as the field, as the FAQ search does
- **THEN** the whole visible box SHALL activate the control, not only the inner input box

### Requirement: Every layout shape change references a named breakpoint
A media query or responsive utility that changes the shape of a layout SHALL reference a breakpoint that is named once in the theme, not a repeated raw pixel value. The breakpoint vocabulary is closed the same way the container tier vocabulary is closed: a section may deviate to a different named breakpoint, but SHALL NOT invent a new number.

#### Scenario: A coordinated threshold used by several components
- **WHEN** five components change the homepage from stacked to wide at the same width
- **THEN** that width SHALL exist as a named screen in the theme, and each component SHALL reference the name rather than repeat the number

#### Scenario: Renaming a threshold changes nothing on screen
- **WHEN** raw pixel breakpoints are replaced by their named equivalent
- **THEN** every built HTML file SHALL be byte-identical to the build before the change, once the content hash in the CSS filename is normalised
- **AND** the emitted CSS SHALL differ only by the inert `.container` rule Tailwind emits for every registered screen, which no component in this codebase uses

### Requirement: Page shell widths come from the tier vocabulary
A page shell, a page column, or a sidebar SHALL take its width from a `Container` tier or an `@theme` container token, never from a raw arbitrary utility such as `w-[240px]` or `max-w-[…]`. Local sizing inside a card or a control is not a page shell and is out of scope for this rule.

#### Scenario: Legal page table of contents
- **WHEN** the legal layout sizes its table-of-contents column
- **THEN** the width SHALL come from a named token, and the rendered column SHALL stay at its current 240px

### Requirement: Assets are served at the size they render
An image SHALL be served through `astro:assets` with `widths` and `sizes` that match the slot it renders into, so that no viewport receives a file materially larger than it can display. This applies to design-system chrome such as the logo, and to editor-uploaded logos, not only to photography.

#### Scenario: Site logo in the header
- **WHEN** a visitor on any viewport loads any page
- **THEN** the logo SHALL be served from a `srcset` sized for its 201px header slot and 179px footer slot, and SHALL NOT be served at its full source resolution

#### Scenario: Editor-uploaded organisation logo
- **WHEN** an editor uploads a logo of arbitrary dimensions through Keystatic
- **THEN** the rendered page SHALL serve a variant sized for the 44px or 56px box it appears in, and a missing file SHALL warn at build time and fall back rather than fail the build
