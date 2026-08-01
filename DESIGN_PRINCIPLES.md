# Bagiberbagi Design Principles

> **Version:** 2.0
>
> Replaces `DESIGN_DNA.md` and `DESIGN_LANGUAGE.md`, which said the same thing twice.
>
> This document holds **judgement**: what we are building, what it should feel like, and how to decide.
> `DESIGN_SYSTEM.md` holds **measurements**: tokens, scales, spacing, breakpoints, contrast floors.
>
> Rule of thumb: if a claim can be checked with a number, it belongs in `DESIGN_SYSTEM.md`, not here.
> If it needs judgement, it belongs here. A principle without a matching number in the system file is
> the most common way this document fails in practice.

---

## North Star

Every visitor should leave with one belief:

> **"This is a platform I can trust."**

Priorities, in order:

1. Trust over attention.
2. Understanding over persuasion.
3. Participation over conversion.

Never ask users to act before they understand.

---

## What Bagiberbagi is

- A platform
- An ecosystem
- Community-powered
- Human-centered
- Transparent by design
- Built for long-term impact

## What Bagiberbagi is not

- A fundraising campaign
- A donation landing page
- A charity event
- A CSR microsite
- A government portal

**Brand hierarchy.** Bagiberbagi is the platform. Jumat Berkah is the first running program.
Never swap the two, and never let a program's voice take over a platform-level surface.

---

## Core principles

### Refine, don't reinvent

The current visual direction is considered correct. Improve hierarchy, composition, rhythm,
consistency, and polish. Do not introduce a new visual style.

### Calm over loud

Prefer whitespace, strong typography, photography, and meaningful diagrams.
Avoid decoration, unnecessary gradients, visual noise, and attention-seeking effects.

### Editorial over marketing

Design explains, it does not advertise. Reading a page should feel like reading a thoughtful
story rather than browsing a campaign.

### Human over interface

Interfaces support people. People are never decoration. Photography, stories, and community
always get more visual weight than UI components.

### Remove before adding

Simplify before decorating. Whitespace communicates confidence. Empty space is intentional,
but only when it is composed. Unbalanced empty space reads as an unfinished layout, not as calm.

---

## Resolved tensions

These two conflicts existed in the previous documents and were resolved during the `/new-home`
build. They are settled. Do not relitigate them without changing this section.

### Trust sections vs "no dashboards"

The section anchor table assigns Trust a data-shaped anchor, while the anti-patterns forbid
dashboard-heavy layouts. **Resolution:** a trust section may show evidence, but as *one* continuous
claim, never as a panel of tiles. One chain, one rail, or one timeline that reads as a single
sentence. The moment evidence splits into a grid of independent cards or counters, it has become a
dashboard and is wrong.

### "Refine, don't reinvent" vs the section anchor table

The anchor table assigns each section a visual anchor. Several sections do not currently have that
anchor, so obeying the table means rebuilding them. **Resolution:** "refine, don't reinvent" governs
the **visual language** (color, type, photography, motion, spacing). The anchor table governs
**composition**. Rebuilding a section's composition to give it a proper anchor is refinement.
Introducing a new color, a new typeface, or a new decorative style is reinvention and is forbidden.

---

## Narrative structure

Every page should follow this flow wherever it makes sense:

Problem → Insight → Solution → Evidence → Trust → Vision → Action

Reveal progressively. One primary idea per section. Do not overwhelm.

---

## Composition

### One idea per section

Each section communicates one idea. If a section answers multiple unrelated questions, split it.
A visitor should understand a section's purpose within a few seconds.

### One anchor per section

Every section needs a single visual anchor. Avoid competing focal points.

| Section | Anchor |
|---|---|
| Hero | Headline |
| Problem | Diagram |
| Solution | Process flow |
| Program | Photography |
| Trust | One continuous evidence chain (see resolved tension above) |
| Impact | Story |
| Vision | Timeline |
| CTA | Headline |

Anything that competes with the anchor is either demoted or moved to its own section.

### Rhythm

Pages alternate visual weight. Do not run two adjacent sections at the same weight with the same
layout.

```
Heavy → Light → Medium → Heavy → Medium → Light → Heavy → Light → Medium → Minimal
```

Alternate section types too: editorial, photography, process, story, statistics, timeline,
minimal CTA.

### Balance

Whitespace must be composed, not leftover. Concretely:

- A block of text must never leave 40 percent or more of the container empty beside it with
  nothing in it. Either make it a two-column composition where both columns carry content, or
  narrow the container so the text reads as a deliberate prose column.
- A visual element must be proportionate to the field it occupies. A small diagram floating in a
  full-width band is a defect, not restraint.
- Section heads align left. The only exception is a minimal closing CTA, which may center.

The numbers behind these rules (container widths, padding, gap ceilings) live in
`DESIGN_SYSTEM.md` under **Layout & spacing**. Follow them; they are what keep sections consistent
when different people build them.

### Section transitions

Pages should feel continuous. Transitions may use whitespace, image overlap, background change, or
subtle motion. Avoid abrupt visual breaks and sections that feel isolated.

---

## Photography

Documentary, never promotional.

**Prefer:** real people, authentic moments, natural expressions, eye-level perspective, natural
light, collaboration, community.

**Avoid:** generic stock photos, staged group photos, exaggerated emotion, poverty exploitation,
artificial posing, event-documentation style.

Always preserve dignity. A scrim over a photo should be only as strong as legibility requires, and
should never darken faces more than necessary.

---

## Illustration and diagrams

Illustrations exist to improve understanding.

**Prefer:** diagrams, process visualization, ecosystem maps, simple line graphics, minimal icons.

**Avoid:** mascots, decorative artwork, cartoon styles, illustration-heavy layouts.

Icons support comprehension and never replace copy. Use them consistently and sparingly.
No emoji in product UI; use SVG icons (`Icon.astro`). Emoji are acceptable only as placeholders in
a draft and must be replaced before the code is final.

---

## Motion

Motion clarifies. It never decorates.

**Prefer:** fade, reveal, slide, flow, timeline progression, count-up, connection lines, gentle
parallax.

**Avoid:** bounce, shake, spin, rotation, decorative animation, motion without purpose.

Every animation must respect `prefers-reduced-motion`, and the reduced state must show the full
content immediately, never a blank section. Durations and easing live in `DESIGN_SYSTEM.md`.

---

## Color and typography

The palette is stable. Do not introduce new brand colors without a clear product need.

- Orange → action
- Blue → trust
- Neutral → reading and structure

Color creates hierarchy, never decoration. Typography is the primary communication layer: graphics
support type, they do not replace it.

Values, scales, and the contrast floor are in `DESIGN_SYSTEM.md`.

---

## Copy and language

These rules apply to every visitor-facing string, including CMS content.

- **Indonesian, written in full sentences.** Clipped, telegraphic phrasing is not our voice.
  Shorten by cutting ideas, not by cutting words out of a sentence.
- **Never use em dash or en dash** (— and –). Use a comma, a period, or a conjunction.
- **No AI slop.** No "unlock", "seamless", "empower", "journey" used as filler, no three-adjective
  stacks, no sentences that could describe any organization.
- **No manufactured urgency.** No countdowns, no scarcity framing, no guilt.
- **Honest scope.** Do not claim licenses, legal status, or partnerships we do not have. A program
  that has not started is described as not started.
- **Numbers carry context.** See the next section.

---

## Numbers and metrics

Transparent metrics are a signature of this product, and statistics without context are an
anti-pattern. Both are true. The rule that reconciles them:

1. **Never lead with numbers.** A section that reports impact opens with a story, a person, or a
   date, and the numbers follow as support.
2. **Every number is traceable to real data.** Figures come from the content collections
   (`getGlobalImpact`, `getProgramImpact`, jejak entries). Inventing a plausible number is
   forbidden, even as a placeholder, because placeholders ship.
3. **Every number carries a sentence of context.** What period, what source, how many recorded
   activities it was computed from.
4. **If honest data yields only two numbers, show two.** Padding a row to look fuller is the
   dishonesty this rule exists to prevent.

---

## Participation before donation

Donation is one form of participation. The platform also enables people to share food, goods,
time, space, and funds, and to build communities. Design for participation, not only for the
donate button.

---

## Editor-managed content

Programs, jejak, FAQ, footer, SEO, and legal text are edited in Keystatic, not in code. The person
uploading a photo or writing a summary is making a design decision.

- Photography rules above apply to uploads. A staged group photo does not become acceptable because
  it arrived through the CMS.
- Copy rules above apply to CMS fields, including summaries and FAQ answers.
- Never write a number into a CMS field that the impact aggregation could compute instead.

If a section's design depends on the shape of CMS content (length of a summary, presence of a
cover image), the component must render correctly when that content is missing.

---

## Design for growth

Programs will evolve, communities will grow, features will expand. Prefer scalable patterns over
page-specific solutions. A section that displays "the active program" should not break when there
are two.

---

## Anti-patterns

Avoid:

- Donation-first messaging
- Dashboard-heavy pages
- Dense card grids, and turning every piece of content into a card
- Decorative graphics and illustration-heavy layouts
- Fake urgency, countdown timers, manipulative copy
- Excessive animation
- Statistics without context
- Inconsistent spacing and alignment
- Trend-driven UI
- Visual clutter

When in doubt, simplify.

---

## Decision filter

Before introducing any new section, component, animation, or interaction:

1. Does it strengthen trust?
2. Does it improve clarity?
3. Does it support the story?
4. Does it reinforce Bagiberbagi as a platform?
5. Can the same outcome be achieved more simply?

If most answers are **no**, don't build it.

---

## Review checklist

Before approving a design, verify all of these. The first four are judgement, the rest are checkable
and should be checked, not eyeballed.

- [ ] Does it improve clarity and strengthen trust?
- [ ] Does it reduce visual noise?
- [ ] Does it preserve the existing identity?
- [ ] Does each section have exactly one anchor and one idea?
- [ ] Section heads align left (except a minimal closing CTA)?
- [ ] No empty region of 40 percent or more of the container beside a text block?
- [ ] Spacing matches the scale in `DESIGN_SYSTEM.md`, with no internal gap above the ceiling?
- [ ] Every animation has a `prefers-reduced-motion` path that shows full content?
- [ ] Text contrast meets the floor in `DESIGN_SYSTEM.md`?
- [ ] Layout verified at 390, 768, 1024, and 1440, with no horizontal overflow?
- [ ] Every number traceable to real data, with context, and not leading its section?
- [ ] No em dash, no en dash, no emoji in UI?

---

## Success criteria

A successful experience makes users think:

- "I understand this."
- "I trust this."
- "I believe this can grow."
- "I want to participate."

Never:

- "I feel guilty."
- "I feel pressured."
- "I don't know where to start."

Users should remember the experience, not the interface.

---

## References

These products set the standard of craft we aim for. They are not a style to copy, and they pull in
different directions on purpose.

- **Structural clarity:** Linear, Stripe
- **Editorial calm:** Apple, Patagonia
- **Warmth and human presence:** Airbnb

When two references conflict, structural clarity wins on functional surfaces (process, program,
trust), editorial calm wins on narrative surfaces (problem, why, vision), and warmth wins wherever
people appear.

---

## Ownership and change

- **Owner:** the repository maintainer. In a solo project this is whoever merges to `main`.
- **This document beats habit, and code beats this document only after the document is updated.**
  If an implementation needs to break a rule here, change the rule in the same branch and say why,
  or don't break it.
- Changes should be rare and intentional, because they redefine the experience rather than the
  interface. Record the reason in the commit body.
- When a principle here gains a measurable form, add the number to `DESIGN_SYSTEM.md` in the same
  change and link to it from here.
