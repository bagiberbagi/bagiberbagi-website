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

## 4. The shared block only says what `/syarat` already says

The seed content in `src/content/ketentuan/ketentuan.json` is a rewrite of `/syarat` into
second-person operational voice. Every one of its seven items traces to a clause already published
there. Nothing in it is new.

This is a rule about how the file was written, not a constraint the code enforces — the owner can
put anything in it. It exists because the seed was written by an agent, and an agent writing
"pesanan ditutup H-2" from plausibility rather than from fact would publish a false operational
promise in the owner's name. Anything that read as an improvement but was not in `/syarat` went to
`KETENTUAN.md` as a proposal instead.

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
day the first one changes. So the seed says the donation "sudah termasuk pengantaran dan
dokumentasi" without naming the amount, and says nothing at all about the cut-off or the area.

The last two also carry a subtler problem, and it is the reason a terms sentence cannot simply be
derived from them either: `nextAgenda` describes the **next agenda**, not a standing rule. "Kamis
18.00" is this week's cut-off and "Bogor" is this week's location. Turning either into "pesanan
ditutup setiap Kamis 18.00" or "area penyaluran Bogor" is an inference from a single week's value,
and only the owner can say whether the inference holds. `KETENTUAN.md` asks it that way.

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

Reading width is the `prose` tier (672), not the page's `standard` (1024). These are paragraphs to
be read, and the tier vocabulary already has a name for that.

## Open question

**Does the donation panel's `note` prop now duplicate a term?** The panel prints "Sudah termasuk
pengantaran dan dokumentasi foto serta video penyaluran" as a note under the button, and shared
item 2 says the same thing at more length. Two statements of one fact, eleven hundred pixels
apart, is the shape decision 4 warns about. It is left alone here because the note is what makes
the button honest on its own, and removing it to avoid a duplicate would weaken the more important
of the two surfaces. Worth revisiting once the owner has written the per-programme terms, since the
answer depends on how much the programme block ends up saying.
