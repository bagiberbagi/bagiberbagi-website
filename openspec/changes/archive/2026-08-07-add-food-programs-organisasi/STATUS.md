# Status at archive, 7 August 2026

Shipped and live. `organisasi` exists as a lateral entity, three food programmes were added, and
`46Cyclist` is a real institutional donor with one attributed jejak and a working impact
dashboard at `/organisasi/46cyclist/`.

All 28 tasks are ticked. Two of them were ticked at archive rather than during the work, and both
deserve their reasoning on the record rather than a silent checkbox.

## The two late ticks

**1.6, config agreement.** Verified mechanically. `content.config.ts:220` globs `*.yaml` under
`src/content/organisasi`, `keystatic.config.ts:672-673` writes there with `format: { data: 'yaml' }`.
They agree, so the failure mode this repo has actually suffered — admin lists zero entries while
the site renders fine — cannot occur here.

**9.4, admin round-trip.** Discharged by production. The evidence is better than a test fixture
would have been: the logo a human uploaded through the form arrived at 1079×979 and 66 KB, which
is precisely what exposed the `public/uploads` mistake and triggered Track B of
`fix-mobile-ergonomics`. It now serves as an `astro:assets` webp with a `srcset` into a 72px box.

## Still open, and only the owner can close it

**Look at the Keystatic form once.** Not the behaviour, which is proven above, but the shape of
the form while it is being filled: field order, labels, whether the two new jejak fields read
clearly. `storage: cloud` needs a real GitHub session, so no build process can see it.

## One task's text went stale and was left alone

**1.4** says the logo uploads to `public/uploads/organisasi`. That was true when it was written
and is false now — Track B moved it to `src/assets/organisasi/` and through the image pipeline.
The text stays as written because a task list records what was decided at the time; the correction
lives in 1.6 where a reader will meet it.

## Handed forward

`specs/program-donation-cta/spec.md` was rewritten before archiving, because two of its
requirements had gone false since they were drafted:

- It described a "Donasi Sekarang" button and a fixed default quantity. Both are gone: the CTA
  reads "Donasi lewat WhatsApp" and no quantity is preselected, on the owner's instruction.
- It claimed the page "SHALL require the visitor to select one package before the donation link
  is built". That was never true. **Verified live: `Sahur` carries `aria-pressed="true"`**, so a
  visitor who taps straight through sends `Ramadhan Berbagi (Paket Sahur)` without choosing it.

That second one is a live inconsistency, not just a stale sentence: quantity has no default by
design while package silently does, in the same card. Carried into `add-aksi-mechanism` as **Q2b**
with three options, since packages become editable data there.
