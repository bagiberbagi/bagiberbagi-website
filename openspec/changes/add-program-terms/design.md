# Design

Six decisions. The owner picked the first three from a menu before any of this was written; the
rest follow from them.

## 1. Operational terms, not a second legal document

**Decided by the owner.** The section states what a participant needs to know to take part, and
`/syarat` remains the only place the platform declares obligations. The section closes with a line
pointing there.

The rejected alternative was a full per-programme terms document. It fails on maintenance, and it
fails in a way nobody notices for months: `/syarat` says confirmed donations are in principle
non-refundable, and the day one programme page says something softer, the site contradicts itself
about money in two published places. Four active programmes means four opportunities.

The consequence to accept: this section cannot contradict `/syarat` either. Hence decision 4.

## 2. Two layers, shared plus per-programme

**Decided by the owner.** A shared block carries the transaction frame; each programme adds what
only it can say.

Why two and not three: a per-pintu layer was considered, following the `aksi` precedent of six
per-pintu singletons. It was dropped because the thing that varies does not vary per pintu. Within
`food` alone, Jumat Berkah has a fixed per-portion price and a weekly schedule while CSR Food
Program has neither, and the honest split is programme-level. A per-pintu layer would have meant
six files, five of them empty, sitting between the two layers that do the work.

Why not per-programme only: four active programmes would mean four copies of the same seven
sentences about payment and cancellation, drifting apart one edit at a time.

**The shared layer is empty as of 11 August 2026, and the argument above survives it.** The owner
asked for anything that could live on `/syarat` to be moved there, which took all nine items with
it (see decision 4). The four-copies problem it was built to prevent does not come back, because
those sentences are not on the programme pages at all now, in one copy or four. What the layer is
still for is the case neither `/syarat` nor a single programme owns: an operational rule spanning
programmes, such as every programme pausing over a long holiday. Empty, it renders nothing.

## 3. Merge by title, programme wins, programme items first

**Decided by the owner** in the shape "menambah atau menimpa". The mechanism:

```
own    = programme items, empty ones dropped, first wins on duplicate title
rest   = shared items whose title no programme item claims
result = [...own, ...rest]
```

Titles are compared normalised: trimmed, lowercased, internal whitespace collapsed. An editor
overrides a shared term by typing its heading again on the programme, which is the only override
affordance available — Keystatic cannot offer a picker over a singleton's array items, and a
hand-typed `id` field would be a second thing to get wrong with no feedback when it is wrong.

The failure mode is a near-miss title, which renders both items instead of one. That is visible on
the page immediately, unlike a silent no-op, which is why title matching was preferred over an id.

Programme items come first because they are what the visitor came for; the shared frame reads as
reference material and belongs under it. This also means an override moves the term up into the
programme's own block, which is correct: a programme that had to override a shared term has
something specific to say about it.

## 4. Anything `/syarat` can say lives only on `/syarat`

**Revised 11 August 2026 by the owner**, and the revision is the point of the decision now, so the
original is kept underneath it rather than deleted.

*"Aku tidak ingin ada redundant konten di ketentuan program dan syarat, yg sekiranya bisa masuk ke
syarat maka bisa dipindah saja kesana. Jadi untuk ketentuan yg ada di program akan tetap
relevan."*

Every shared item was a `/syarat` clause rewritten in second person, so the test "could this live
on `/syarat`" caught all nine. Two of them had only just been written and were already on `/syarat`
by then; the other seven needed two sentences added there before they could be dropped, because a
move that loses wording is a deletion wearing a different name:

| what was only in the shared block | where it went on `/syarat` |
|---|---|
| the confirmed amount already covers delivery and documentation | Penggunaan Dana, as its own line |
| ask for a donation receipt early so its format can be prepared | Donasi, appended to the receipt clause |

Everything else was already covered clause for clause, verified item by item before the file was
emptied.

**What the original decision said, and why it was reasonable.** The seed was a rewrite of `/syarat`
into second-person operational voice, seven items, each traceable to a published clause, nothing
new. It was a rule about how the file was written rather than a constraint the code enforces,
because the seed was written by an agent, and an agent writing "pesanan ditutup H-2" from
plausibility rather than fact would publish a false operational promise in the owner's name.
Anything that read as an improvement but was not in `/syarat` went to `KETENTUAN.md` as a proposal
instead.

**Why it did not hold.** The intended value was register: the same obligation, in the words of
someone about to donate, at the moment of deciding. What it produced was the same sentence
published twice, and the owner read the duplication before the register. The half of the rule that
still holds is the half that matters, that an agent must not invent operational facts; what changed
is where a true one goes when it is not programme-specific, which is `/syarat` and nowhere else.

The cost, accepted knowingly: a programme with nothing of its own to say renders no terms section
at all. Community Giving and CSR Food Program are in that state today, and their donation panels
drop the `#ketentuan` link with it, since link and section share one guard.

The same discipline explains what is *not* seeded: no minimum, no order deadline, no coverage
area, no lead time. Those are the useful parts, and none of them can be derived from anything
already on the site.

**No value that has a single source elsewhere is restated here.** Three of them sit directly above
this section, printed by the same donation panel:

| value | its one source |
|---|---|
| per-portion price | `aksi` mechanism, `mechanism.value.pricePerUnit` |
| order cut-off ("tutup Kamis 18.00") | `settings.site.nextAgenda.cutoff` |
| distribution location ("Bogor") | `settings.site.nextAgenda.location` |

Writing any of them into a terms sentence would create a second copy that goes stale silently the
day the first one changes.

The last two also carry a subtler problem: `nextAgenda` describes the **next agenda**, not a
standing rule. "Kamis 18.00" is this week's cut-off and "Bogor" is this week's location. Turning
either into "pesanan ditutup setiap Kamis 18.00" or "area penyaluran Bogor" is an inference from a
single week's value, so `KETENTUAN.md` put it to the owner as a question rather than guessing.

**The owner answered on 11 August 2026, and the answer was "neither is a rule".** So Jumat Berkah's
terms say orders need a day's head start without naming an hour, and ask the visitor to name their
location rather than naming a service area. Both sentences are shorter than the versions that
guessed, and unlike them they cannot be made false by next week's agenda.

## 5. Native `<details>`, no script

The owner asked for an accordion. The repo has one, `src/scripts/faq.js`, shared by `Faq` and
`FaqHome`, which toggles a `hidden` class on click.

This section uses `<details>`/`<summary>` instead, and the reason is not preference. With
scripting off, the JS accordion renders headings whose bodies can never be opened. For FAQ that is
a degradation; for terms that a participant is told to read before donating, it is the section
failing at the one job it has. `<details>` opens with no JS, is keyboard-operable for free, prints
open, and is searchable by the browser's own find-in-page in current Chrome.

The cost is that the chevron rotation and spacing are re-implemented in Tailwind (`group-open:`)
rather than reused, and that the default disclosure triangle has to be suppressed in two places
(`list-none` plus `::-webkit-details-marker`). Cheap, and it removes a script from the page rather
than adding one.

Programme items get `open`, shared items do not. The specific terms are the ones a participant
must not miss; the frame is reference. This also gives the section a sensible resting shape: a
short open block, then a list of closed headings.

## 6. Where the section sits, and how it is separated

Between Cara Kerja and Rekam Jejak. Before it, the visitor knows what the programme is and how it
runs; after it comes the evidence that it ran. The terms sit at the point where a decision is
being made rather than after the proof.

Both neighbours are conditional (`steps.length > 0`, `jejak.length > 0`), so the section cannot
rely on either for contrast. The page alternates `bg-white` / `bg-gray-50`, and any fixed choice
collides with one neighbour or the other depending on what rendered. It takes `bg-white` plus
`border-t border-border`, so the boundary is drawn by the section itself and holds whatever sits
above it.

**The section uses the page's own tier, `standard` (1024), and caps the reading measure per
paragraph instead.** It shipped as `prose` (672) first, on the argument that these are paragraphs to
be read and the tier vocabulary has a name for that. The owner rejected it on sight: *"sizing nya
aja yg kurang cocok, jadi tidak seragam dg halaman nya."*

They were right, and measuring says why precisely. Every other section on the page is 1024 with its
content starting at x=168; the eyebrow, heading, and body sizes were already identical across all
five sections. So width was the **only** thing that differed, which makes it read not as a
comfortable reading column but as one section that got its size wrong.

The fix separates the two jobs the tier had been doing at once:

| job | who does it now |
|---|---|
| line up with the rest of the page | `Container` at `standard`, rows spanning the full 944 |
| keep the line length readable | `max-w-text` on each paragraph, so the measure is still 672 |

This is not a new pattern. `rekam-jejak`, the section directly beneath, does exactly this with its
own lead paragraph. The frame is what makes a page look uniform; the measure is what makes prose
readable, and the two never had to be the same number.

## The open question, closed

**Did the donation panel's `note` prop duplicate a term?** The panel prints "Sudah termasuk
pengantaran dan dokumentasi foto serta video penyaluran" under the button, and the shared block's
second item said the same thing at more length. The question was parked until the per-programme
terms existed, since the answer depended on what they turned out to say.

They say nothing about what a donation covers, and the shared block is empty, so the note is the
only place on the page carrying that fact. It stays, unchanged. The sentence it echoes now lives on
`/syarat` under Penggunaan Dana, which is a different surface for a different reader rather than a
second copy on the same screen.
