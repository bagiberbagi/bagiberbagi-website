## ADDED Requirements

### Requirement: An invitation to become a partner states what the partnership is

Any surface that invites a UMKM to become a kitchen partner SHALL lead to an explanation of the commitment before it leads to a conversation. An invitation whose only description is a phrase or a single sentence, ending directly in a WhatsApp thread, SHALL NOT be the only path available.

Today three surfaces do exactly that — `PICKS.dapur` in `ClosingSection.astro` ("dapur saya"), the `Jadi mitra dapur` aksi in `src/content/aksi/food.json`, and `CATEGORY_CONTENT.food.ctaTitle` in `src/consts.ts` — and all three open the same message. The reader decides on one sentence and learns the terms by asking, one at a time, after committing to the conversation.

The explanation SHALL be a page, not an FAQ entry. An FAQ answers questions a reader already knows to ask, and the gap here is that a UMKM does not yet know which questions exist.

#### Scenario: A UMKM reaches an invitation to partner
- **WHEN** a visitor activates any surface inviting them to become a kitchen partner
- **THEN** they SHALL arrive at the explanation page rather than directly at WhatsApp

#### Scenario: The explanation page still ends in a conversation
- **WHEN** a visitor finishes reading the explanation page
- **THEN** the page SHALL offer one WhatsApp control carrying the same message the other entry points use, and SHALL NOT present a form, because the site has no server to receive one

### Requirement: The commitment is stated as a sequence, split by how often it recurs

The page SHALL present what happens as an ordered sequence from first contact to food going out, and SHALL separate the steps that happen once when joining from the steps that repeat every distribution.

The split is the substance of the requirement, not its formatting. "What do I have to do once" and "what do I have to do every week" are different commitments, and a flat list hides which is which.

Step numbers SHALL be derived from position at render time and SHALL NOT be stored, so inserting a step never requires renumbering the ones after it.

#### Scenario: The sequence is filled
- **WHEN** the sequence holds three or more steps with descriptions
- **THEN** the page SHALL render them in order, grouped into the joining phase and the recurring cycle, each numbered from its position

#### Scenario: The sequence is nearly empty
- **WHEN** fewer than three steps carry a description
- **THEN** the sequence section SHALL NOT render at all
- **AND** the page SHALL NOT substitute a shorter sequence in its place, because a two-step sequence is the WhatsApp button that already exists elsewhere wearing a heading

### Requirement: Unknown terms render as absence, never as placeholder text

Where a fact about the partnership is not yet decided, the page SHALL render nothing in its place. Bracketed placeholders, sample durations, and illustrative amounts SHALL NOT appear in editable content.

A placeholder that reaches the CMS reaches production. The failure mode is specific: a payment term or a turnaround time invented to fill a gap is read by a UMKM as a commitment, and the site would be making a promise nobody agreed to.

#### Scenario: A step with no stated duration
- **WHEN** a step's duration field is empty
- **THEN** the step SHALL render with no timing line at all, and SHALL NOT render a bracket, an ellipsis, or a sample figure

#### Scenario: A requirement group with no items
- **WHEN** either requirement group holds no items
- **THEN** that group's heading SHALL NOT render

#### Scenario: The payment step is undecided
- **WHEN** it has not been established whether or how a partner is paid
- **THEN** the page SHALL omit the payment step entirely rather than describe a payment term, and the omission SHALL be resolved by the owner rather than by inference from any figure already in the repository

### Requirement: The page does not restate service-wide obligations

The page SHALL cover only what is specific to being a kitchen partner, and SHALL link to `/syarat` for obligations that apply to everyone using the service.

This follows the discipline `Ketentuan.astro` already holds: one obligation has one home, and a clause restated in two places becomes two clauses that drift.

#### Scenario: A service-wide obligation is relevant
- **WHEN** an obligation applies to every user of the service, not only to partners
- **THEN** the page SHALL point at `/syarat` rather than repeat the clause

### Requirement: The partner WhatsApp message has one source

The message that opens a kitchen-partner conversation SHALL be declared once and read by every surface that uses it.

It is declared twice today, at `ClosingSection.astro:54` and `src/content/aksi/food.json:40`, identical and mutually unaware. Adding a third mount without resolving that makes an edit desynchronise three surfaces instead of two.

#### Scenario: The message is edited
- **WHEN** an editor changes the kitchen-partner message
- **THEN** every surface offering that conversation SHALL send the changed message, with no surface left carrying the old wording
