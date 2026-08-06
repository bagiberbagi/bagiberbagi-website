# Calculator settings, and the shape for more calculators

**Recommendation: make the calculator a small Keystatic collection (`calculators`, one YAML file per calculator) that each program points at through a relationship field, so today's four hardcoded values become editable content and a second calculator with the same arithmetic costs one file and no code.**

---

## What changes

### Content model

**New collection `calculators`** (`src/content/calculators/*.yaml`), same shape as `programs`, because each entry needs a stable slug that another entry references, not just a display order:

```ts
// src/content.config.ts
const calculators = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/calculators' }),
  schema: z.object({
    label: z.string(),                       // "Porsi Makan" -> porsi-makan.yaml
    unit: z.string().default('porsi'),       // the noun after the number
    pricePerUnit: z.number().default(0),     // rupiah, integer
    presets: z.array(z.number()).default([]),
    active: z.boolean().default(true),
  }),
});
```

```ts
// keystatic.config.ts
calculators: collection({
  label: 'Kalkulator',
  slugField: 'label',
  path: 'src/content/calculators/*',
  format: { data: 'yaml' },   // must match the *.yaml glob above
  schema: { ... },
}),
```

Two things that bite here and are already documented as having bitten before: the `format: { data: 'yaml' }` and the `pattern: '*.yaml'` must agree or the admin lists zero entries, and `ui.navigation` in `keystatic.config.ts` is an explicit list, so `'calculators'` has to be added to a group (`'Pengaturan Situs'` reads right next to `settings`/`seo`/`analytics`) or the sidebar will not show it.

**Two new fields on the existing `programs` collection**, not a new mechanism:

```ts
calculator: z.string().nullish(),            // fields.relationship into `calculators`
packages: z.array(z.string()).default([]),   // ['Sahur','Takjil','Buka Puasa']
```

`calculator` replaces both slug-string gates in `src/pages/program/[program].astro` at once. Presence of a calculator means the picker; absence means the WhatsApp discussion CTA, which is exactly today's `INQUIRY_PROGRAMS` behaviour for Community Giving and CSR Food Program. `packages` replaces `RAMADHAN_PACKAGES` and the `program.slug === 'ramadhan-berbagi'` test, which is what `.claude/rules/content-model.md` already says should happen.

`getPrograms()` spreads `...e.data`, so both fields land on the `Program` type with no new reader code, only the schema addition.

### Code

- **New `src/lib/calculators.ts`**, following `programs.ts` exactly: `getCalculators()` and `getCalculator(slug)` call `getCollection('calculators')` inside an async function, map `e.id`/`e.data` onto a plain `Calculator` interface, drop inactive entries, return `null` on a miss. Components never call `getCollection` themselves.
- **`calcTotal` gains a price parameter**: `calcTotal(qty: number, pricePerUnit: number)`. It stays a pure function with no `astro:content` import, which is what makes the next point possible.
- **`buildDonationMessage` gains a `unit` parameter.** It currently writes "untuk 6 pax" while the whole UI says "porsi", so this fixes an inconsistency that already exists.
- **`DonationCard.astro`** takes `calculator: Calculator | null` plus `packages: string[]` and derives `price`, `unit`, and the chip values from them. The local `const PRESETS = [6, 12, 20]` and `const price = calcTotal(1)` both disappear.
- **`Hero.astro` and `program/[program].astro`** each resolve the calculator at build time and pass it down. Both already hold a real program object, so nothing new is needed to know which calculator applies.

---

## What the admin screens look like

**Kalkulator (new, under Pengaturan Situs).** A list with one entry, "Porsi Makan". Opening it shows: Nama Kalkulator, Satuan (`porsi`), Harga per satuan (`25000`), Preset jumlah (a drag-orderable list: 6, 12, 20), Aktif. Changing 25000 to 27000 changes the price line, every chip subtitle, and the WhatsApp total, on the next build.

**Program (existing screen, two new fields).** Below Ringkasan: a "Kalkulator" dropdown listing the calculator entries, with the description saying plainly that leaving it empty makes the page show a WhatsApp discussion button instead of a porsi picker. And "Paket", a drag-orderable list of text, empty for Jumat Berkah, three items for Ramadhan Berbagi.

One honest limitation: both states of the Kalkulator dropdown are legitimate (empty means inquiry), so nothing can validate it. If the owner clears it by accident on Jumat Berkah, that page silently becomes inquiry-only. The field description is the only guard. A free-text id would have the same failure plus typos, which is why it is a relationship picker.

---

## How the browser script gets its numbers with no runtime server

The mechanism already exists and only gets wider. `DonationCard.astro` writes the resolved values onto the card node at build time, and `src/scripts/donation-card.js` reads them back from `.dataset`:

```
data-price={calculator.pricePerUnit}    ->  parseInt(card.dataset.price, 10)
data-unit={calculator.unit}             ->  card.dataset.unit
```

Presets do not need an attribute: the chips are server-rendered from the same resolved calculator, and the script already reads each chip's own `data-porsi`.

One real cleanup rides along. `donation-card.js` already imports `formatRupiah`, `buildWaLink`, and `buildDonationMessage` from `../lib/format`, verified in the file, so importing `calcTotal` costs nothing. Today the script re-implements the arithmetic inline as `porsi * price` instead of calling it. Once `calcTotal` takes the price as a parameter, server and client call the identical function and the second, drifting implementation goes away.

The no-JS path is untouched: `openMessage` and `initialWaLink` are still built on the server from the same resolved calculator, so the WhatsApp href ships fully formed exactly as it does now.

**The one thing that is not cheap: the word "porsi" is hardcoded in about a dozen visible strings**, and a `unit` field that does not reach them is worse than no field, because it looks configurable and is not. Verified sites: `DonationCard.astro` lines 180, 185, 215, 217, 230, 233, 244, 251, 254, 255 (progress copy and its aria-label, picker title, price line, chip group label, chip text, stepper aria-labels, stepper unit), plus `donation-card.js:114` (`Donasi ${porsi} Porsi`, which needs a capitalised form or a copy change to lowercase), plus the message template in `format.ts`.

Two of those (`180`, `185`) belong to the agenda progress bar, whose own schema fields in the `settings` singleton are literally named `targetPorsi` and `collectedPorsi`. That block is a Jumat Berkah artifact and does not generalise. Leave it porsi-named and out of scope; thread `unit` through the picker only.

---

## Migration, without breaking the live donation path

Two commits, and the live site does not change behaviour until the second one.

**First commit, content only.** Add the `calculators` collection to both configs, write `src/content/calculators/porsi-makan.yaml` with today's live values (`unit: porsi`, `pricePerUnit: 25000`, `presets: [6, 12, 20]`), add the `calculator` and `packages` fields to the `programs` schema with empty defaults so all nine existing program YAML files stay valid untouched, then fill them in: `jumat-berkah` and `ramadhan-berbagi` point at `porsi-makan`, `ramadhan-berbagi` also gets its three packages, `community-giving` and `csr-food-program` are left empty. Nothing reads these fields yet, so the built site is byte-identical.

**Second commit, the switch.** `calcTotal` and `buildDonationMessage` change signature, `format.test.ts` updates its two assertions to pass the price explicitly (the test's own title, "the fixed per-pax price of 25000", stops being true and should say the multiplication is correct instead), `DonationCard.astro` takes the new props, the two callers resolve the calculator, `donation-card.js` reads `data-unit` and imports `calcTotal`, and `INQUIRY_PROGRAMS`, `RAMADHAN_PACKAGES`, and `PRESETS` are deleted.

Two loose ends that must be handled in that second commit:

- **`Hero.astro` picks `programs.find((p) => p.active)`** off an order-sorted list, which today is Jumat Berkah, and renders the picker unconditionally. Once a program can legitimately have no calculator, the hero has to pick the first active program that has one, or hide its picker. One line either way, but it cannot be left implicit.
- **`src/scripts/calculator.js` and `_parked/DonationCalculator.astro`** import `calcTotal` and are dead (nothing live imports them). They will not compile against the new signature. Delete them, or update them in the same commit so the breakage is not mistaken for a regression later.

---

## What a second calculator actually costs

| what the second calculator is | cost |
|---|---|
| same arithmetic, different unit or price (sembako at Rp 150.000 per paket, a tree at Rp 50.000 per pohon) | one new YAML file, point a program at it in Keystatic. Zero code, once `unit` is threaded. |
| same arithmetic, but one program needs its own price | a second YAML file. The price duplicates across files, not across code, and a price edit is two field edits rather than a schema change. |
| different arithmetic (tiered pricing, a recurring pledge, hours with no fixed price, booking a date range) | a new schema field to discriminate, a new render branch in `DonationCard.astro`, a matching branch in `donation-card.js`, and realistically a second component rather than more branches inside the current one. Content cannot buy this. |

The gate is not the calculator, it is the program: a calculator only shows up where an active program with a detail page points at it. Today only the `food` pintu has any.

---

## What I grafted from the runner-up designs, and why

**Taken in:**

1. **`packages` lives on `programs`, not on the calculator entry.** Putting it on the calculator would force Ramadhan Berbagi to have its own calculator file duplicating the same Rp 25.000, so a price change would become two edits that can drift apart. Packages are a program fact.
2. **The reference is a `fields.relationship`, not a free-text string.** This is the repo's own precedent (`jejak.program`, `jejak.organisasi`, `home.programSection.items`). A typed id would fail silently by downgrading a program to inquiry mode with nothing in the admin saying so.
3. **`calcTotal` parameterised, and `donation-card.js` importing it.** Verified that the script already imports from `lib/format`, so this deletes a real duplicate implementation rather than adding a layer on top of it. Worth doing even if the rest is deferred.
4. **The `unit` warning, costed rather than waved through.** One of the reviews caught that a `unitLabel` field wired into the schema but not into the copy is a setting that lies. The dozen sites above are the actual price of making it true.

**Left out:**

5. **A pintu-level default with a per-program override.** It puts two "leave blank to inherit" conventions in one form (null for numbers, empty array for presets) and two places to look for one number. A collection plus a relationship already gives sharing without inheritance: three food programs pointing at one calculator entry is the same reuse with one place to edit.
6. **A `default: true` flag naming the homepage calculator.** Verified unnecessary. `Hero.astro` resolves a real program already, so per-program resolution covers the homepage, and a boolean nobody can constrain to "at most one" is a silent-wrong-pick waiting to happen.
7. **A separate `calculatorMode` enum next to the relationship.** Two fields that can contradict each other (mode says calculator, no calculator attached). Presence and absence of one field says the same thing and cannot disagree with itself.

---

## The "community calculator": what is grounded and what is a guess

**Grounded in the repo:**

- `community-giving.yaml` exists, pintu `food`, active, order 3. It has no calculator today: it is one of the two entries hardcoded into `INQUIRY_PROGRAMS`, so its CTA is a WhatsApp discussion link. Whatever "calculator community" means, it starts by contradicting a decision that was made on purpose.
- `organisasi` is the repo's entity for institutions that give routinely, with `getOrganisasiImpact` summing across programs. It is the closest structural match to anything "community", and it is lateral to the pintu hierarchy, not inside it.
- `PINTU_IDS` caps the taxonomy at exactly six: food, goods, time, space, money, tree.

**Guesses that need the owner's answer before anyone writes schema:**

- That "calculator community" means the Community Giving program getting a picker, rather than an organisasi-facing tool or a family of per-pintu calculators. All three readings fit what he said.
- That its arithmetic is quantity times a fixed price. If Community Giving is priced per event by conversation, which is presumably why it was made inquiry-only, a fixed-price calculator is the wrong shape and the design above does not stretch to cover it.
- That each pintu implies a unit (goods = item, time = jam, space = ruang, tree = pohon). `PINTU` in `consts.ts` carries only slug, label, icon, tagline, blurb, and colours. There is no unit field anywhere. Those units are read off tagline prose, which is a reasonable reading and still a reading.

---

## Open questions, ranked

1. **What does the community calculator count, and does it have a fixed price per unit?** Everything else depends on this, and the honest tension is that Community Giving was deliberately made inquiry-only, so a fixed-price picker would reverse that decision rather than extend it.
2. **Is Rp 25.000 per porsi uniform across every food program, forever?** If Ramadhan or CSR will ever price differently, that is a second calculator entry (cheap) or a per-program price override (a schema change). Worth knowing before the first file is written.
3. **Will any calculator ever use a unit other than "porsi"?** If yes, the dozen hardcoded strings get threaded now and `unit` is a real setting. If no, drop `unit` from this round and keep the copy in code, where it is honest.