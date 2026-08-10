# Program Terms

## Status

**Built, and the content half is two programmes in.** Jumat Berkah carries three terms and Ramadhan
Berbagi two; Community Giving and CSR Food Program are still waiting on facts only the owner has,
so they render no terms section at all. `KETENTUAN.md` holds what was decided and the four
questions left.

The shared block was seeded with seven items and is now **deliberately empty**: on 11 August 2026
the owner ruled out saying anything on a programme page that could be said on `/syarat`, which took
all nine items with it. Two of them carried wording that existed nowhere else and were moved there
rather than dropped. See decision 4 in `design.md`.

## Why

A visitor on a programme page can find out what the programme *is* and can tap a button that
opens WhatsApp. What they cannot find out is what they are agreeing to: whether there is a
minimum, when an order has to arrive to make this Friday's distribution, which area the food
reaches, what the report will look like, what happens if the distribution is cancelled after they
have paid.

The site is not silent on those points. `/syarat` covers all of them, and covers them well. But
it covers them for the platform as a whole, in the register of a legal document, three clicks and
one context switch away from the button. Nobody reads a terms-of-service page before tapping a
WhatsApp button, and the parts that vary per programme are exactly the parts `/syarat` cannot
state: it says *"jenis laporan dapat berbeda pada setiap program"* and *"waktu pelaksanaan dapat
berubah"*, which is honest and, at the point of deciding, useless.

So the gap is not a missing document. It is a missing **layer**: programme-specific operational
terms, on the programme page, next to the ask.

## What changes

The programme page gains a `#ketentuan` section between Cara Kerja and Rekam Jejak, and the
donation panel gains one line pointing at it.

Its content comes from two places merged into one list:

- a **per-programme block**, `detail.ketentuan` on the programme entry, holding what only that
  programme can say, which is the layer the change exists for
- a **shared block**, one `ketentuan` singleton, for an operational rule spanning every programme
  that is nonetheless not a `/syarat` obligation. Empty today, and expected to stay that way

The merge is by title: a programme item whose title matches a shared item replaces it, anything
else is appended. Programme items render open, shared items render closed, and the whole thing is
native `<details>`, so it carries no JavaScript and works with scripting off.

## Scope

One section, one singleton, one field, one reader. Deliberately **not** in scope:

- **A per-programme legal document.** Rejected outright, and this is the load-bearing decision of
  the change. Two documents on one site stating obligations about the same transaction will
  eventually contradict each other, and a contradiction is worse for a participant than an
  absence. `/syarat` stays the only place obligations are declared; this section states
  operational facts and links there.
- **The pintu landing pages.** They list programmes rather than asking for a donation, so the
  terms have no ask to sit next to. If they gain a donation panel later, they can mount the same
  component.
- **A consent checkbox.** Participation completes inside WhatsApp, on a static site with no form
  post. A checkbox here would record nothing and imply that it did.
