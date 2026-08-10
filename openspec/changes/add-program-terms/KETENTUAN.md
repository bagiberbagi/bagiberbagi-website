# The terms — what was answered, what shipped, and what is still missing

**Status 11 August 2026: the shared layer is empty and every service-wide obligation lives on
`/syarat` alone. The programme layer holds Jumat Berkah's three terms and Ramadhan's two.**

This file was written a day earlier as a draft for content nobody had approved yet. Most of it has
since been answered, so it is now a record of what was decided and a shortlist of what is still
open. The drafts that were superseded are gone; the questions they were waiting on are kept,
because the answers are what shaped the sentences that shipped.

---

## 1. The rule that changed, and what it did to this file

The original rule, `design.md` decision 4:

> The shared block only says what `/syarat` already says.

The owner's revision, which replaced it:

> *"Aku tidak ingin ada redundant konten di ketentuan program dan syarat, yg sekiranya bisa masuk
> ke syarat maka bisa dipindah saja kesana. Jadi untuk ketentuan yg ada di program akan tetap
> relevan."*

The first rule made every shared item a restatement, which is exactly what the second rule
forbids, so all nine went. Seven were already covered clause for clause on `/syarat`. Two carried
wording that existed nowhere else and were **moved rather than dropped**, since a move that loses
a sentence is a deletion under another name:

| what only the shared block said | where it lives now |
|---|---|
| the confirmed amount already covers delivery and documentation | `/syarat` → Penggunaan Dana |
| ask for a receipt early so its format can be prepared | `/syarat` → Donasi, on the receipt clause |

What the programme layer holds from now on: **only what one programme can say and `/syarat`
cannot.** A cut-off, an area, a package's contents, a lead time. If a sentence would be true of
every programme, it belongs on `/syarat`.

---

## 2. Four clauses proposed, approved, and published in both places

These were withheld on 10 August because `/syarat` did not say them, and an agent publishing an
operational promise in the owner's name from plausibility alone is how a site starts lying. The
owner approved all four on 11 August, so each is now a `/syarat` clause.

| clause | what it commits us to |
|---|---|
| payment instructions only ever come from the official conversation | the anti-fraud line, and the most protective sentence in the set |
| a schedule change is told to the donor, through the same conversation | `/syarat` previously allowed the schedule to move while promising nobody would be told |
| a redirected donation is announced before it happens | `/syarat` promised transparency while staying silent on timing |
| a donation receipt can be requested | previously not published anywhere |

One drafting change worth keeping: the anti-fraud line was proposed as *"kami tidak pernah meminta
pembayaran ke rekening pribadi"*, and shipped with the weight on **where the request came from**
rather than on whose name the account carries. If the receiving account is ever in a person's name,
the original phrasing contradicts our own practice while the shipped one stays true.

A fifth candidate, *"donasi bersifat sekali jalan, donasi rutin belum tersedia"*, was left where it
already lives, in the FAQ. Copying it would have made a second editable copy of one sentence, and
the FAQ is where a visitor already goes looking.

---

## 3. What shipped per programme

**Jumat Berkah**, three terms. Two of them are shaped by a question whose answer was "that is not a
rule":

| question | answer | what the term says because of it |
|---|---|---|
| is "Kamis 18.00" a standing rule? | no, it is this week's deadline | orders need a day's head start; the exact deadline is named in the conversation |
| is "Bogor" a service area? | no, it is the nearest agenda's location | names no city, asks the visitor to name theirs |
| is there an order minimum? | no | says so outright, one portion included |

Removing a number was the useful outcome twice over. Both values sit in `settings.site.nextAgenda`,
which describes the *next* agenda, so either sentence would have turned one week's logistics into a
published promise.

**Ramadhan Berbagi**, two terms: the programme runs only during Ramadhan, and its three packages
share one per-portion price. That second one also settles Q2 carried out of `add-aksi-mechanism`:
`packages: string[]` is the right shape and stays.

---

## 4. Still open, and only the owner can answer

Community Giving and CSR Food Program have nothing of their own yet, so **neither page renders a
terms section at all** right now, and their donation panels carry no `#ketentuan` link. That is the
guard working as designed, not a defect, but it is also the reason these four questions are worth
answering.

| programme | question | why it matters |
|---|---|---|
| Jumat Berkah | what is in one portion? | the page claims "sehat bergizi dari UMKM terkurasi", which is about quality, not contents. Nothing on the site answers it |
| Ramadhan Berbagi | what is in each of the three packages? | Takjil and Buka Puasa are different meals and the site never says how |
| Community Giving | how far ahead should a group get in touch, and is there a minimum? | a group picking a date needs to know whether to ask two weeks out or two days |
| CSR Food Program | which documents can actually be issued, and is there a minimum budget? | the most consequential one here. A company cannot release budget without something on paper, and promising "dokumentasi" that turns out to mean photographs will fail at whoever approves it. `/transparansi` may be the natural home for the general answer |

---

## 5. How to write these in

No code is involved. In `/keystatic` → Program → the programme → Detail halaman → Ketentuan
program, one row per item, judul plus isi. The row order is the order on the page. Programme items
render open.

The shared layer (Konten Situs → Ketentuan Program) stays empty unless a rule turns up that spans
every programme *and* is not a `/syarat` obligation, such as all programmes pausing over a long
holiday. Typing an obligation there instead of on `/syarat` recreates the duplication this file
records the removal of.

To override a shared term for one programme, if one ever exists again, **type its judul again
exactly** on the programme and write the programme's own version. A judul that nearly matches
produces two items instead of one, which is visible on the page rather than silent.
