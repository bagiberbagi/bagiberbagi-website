## MODIFIED Requirements

### Requirement: Centralized color tokens on shared surfaces

Shared surfaces SHALL take their colors from centralized tokens rather than raw hex.

**Bespoke scoped-style pages** are exempt: a page with a one-off visual treatment
(`src/pages/peduli/[pintu].astro` scoped `<style>`, and the hero pintu-accent map in
`Hero.astro`) MAY carry raw hex, because it is a single-page treatment, not a shared surface. The
**six**-door pintu identity colors themselves are centralized in the `src/consts.ts` `PINTU` array
(`color`/`colorTint`/`colorDeep`) and reach markup through the `--cat` CSS variable, so no
consumer hardcodes a pintu color.

Two corrections are folded in here. The route is `src/pages/peduli/[pintu].astro`; the path
recorded previously (`src/pages/berbagi/[category].astro`) named neither the current directory nor
the current parameter. And the door count was recorded as five while `PINTU_IDS` has held six
throughout — the count has now changed meaning as well as staying six, since the ids are purposes
rather than forms of contribution.

Because a programme may now declare several pintu, **a surface that displays a programme SHALL
take its accent from that programme's `pintuUtama`**, not from the first entry in its pintu list.
Without this rule the same programme card renders in different colors depending on which page
assembled it, and the identity color stops identifying anything.

#### Scenario: A shared surface needs a pintu accent
- **WHEN** a shared component renders an element tinted by pintu identity
- **THEN** it SHALL read the color from the `PINTU` array through `--cat`, and SHALL NOT inline a
  hex value

#### Scenario: A programme serving several pintu is displayed
- **WHEN** a programme declaring more than one pintu is rendered as a card
- **THEN** its accent SHALL derive from `pintuUtama`, so the same programme carries one color
  wherever it appears
