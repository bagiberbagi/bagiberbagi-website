# Section IDs

- Every top-level `<section>` should carry a clear id, so a section can be jumped to directly (`/#id` or `/route/#id`) when inspecting in devtools or reviewing a page. Ids are lowercase kebab-case **Indonesian**, one or two words, naming what the section *is* to a reader (`kepercayaan`, `dampak`, `bergabung`), never the component's code name (`TrustSection` → `kepercayaan`, not `trust-section`). The same id is deliberately reused for the same concept across different pages — `cara-kerja`, `rekam-jejak`, `bergabung`, `dampak`, `pembuka`, `profil`, `penutup`, `angka` each appear on more than one page — because ids are scoped per HTML document, so this is safe and keeps the vocabulary coherent instead of inventing a new word per page.
- The id sits on the section's **outermost `<section>`**, not an inner wrapper, so `#id` scrolls to the top of the whole band.
- **`scroll-mt-24` is required on every section that isn't the first thing on the page.** The header is `sticky top-0` site-wide (`Header.astro`) and `html { scroll-behavior: smooth }` is set globally (`BaseLayout.astro`), so an anchor without it lands with its heading hidden under the pill nav. A section that genuinely starts the document skips it on purpose: landing on a fragment at document position 0 can't scroll any further up, so the utility has no visible effect there.

  **The exemption is about document position, not about being inside the hero.** It was misread once, hours after being written: `#donasi` sits on the donation card inside `Hero`, so it looked exempt, but at phone widths that card is pushed 464–591px down the page by the hero text above it. There is plenty of room to scroll above it, and a jump from the FAQ block landed with 80–84px of the card under the sticky pill. It carries `scroll-mt-24` now. Before granting the exemption, measure where the element actually sits at 320px, don't reason from which component it lives in.
  - `_variants/PintuS1.astro` (renders `berbagi-[pintu]`) is the one file where you do **not** add the class by hand: it already has `.s1 [id] { scroll-margin-top: calc(var(--header-clear) + 24px) }`, tuned to that page's bespoke pulled-up hero, covering every id inside its `.s1` wrapper automatically.
- **Existing ids are load-bearing. Never rename one without updating every linking site.** Current set, and what points at it:
  - `/#pintu` — `Header.astro`, `_variants/PintuS1.astro` breadcrumb, the `/program` → `/#pintu` redirect in `astro.config.mjs`
  - `/#top` — `Header.astro`, `Footer.astro`
  - `/#donasi` — `Header.astro`, `FaqHome.astro`. Lands on the Hero's donation card, not the Hero section: the card itself carries `id="donasi"` (mirrored on every program page, where `Ajakan.astro` carries the same `id="donasi"` inside `program/[program].astro`'s hero — neither Hero section gets its own id for this reason). **This sentence was aspirational until August 2026 and is now true.** `/program/community-giving/` and `/program/csr-food-program/` rendered a separate "PAKET CUSTOM" card instead of `Ajakan`, so they carried no `#donasi` at all — measured, zero occurrences — and any link to it landed nowhere. Both render `Ajakan` now, in its conversation form, and the pintu pages link straight at `/program/<slug>/#donasi`
  - `#cara-kerja` — `Hero.astro`
  - `#program` — `_variants/PintuS1.astro`. Conditional: the link and the section it targets share the same `hasPrograms` guard, so they always render together or not at all
  - `#ketentuan` — `program/[program].astro`'s donation panel. Conditional on both ends: the link and the section share the same "is the merged terms list non-empty" guard, so the link can never point at a section that wasn't rendered
  - `#dampak`, `#kepercayaan`, `#faq` (the standalone `Faq.astro`), `#konsep`, `#bentuk`, `#rekam-jejak`, `#pintu-lain` — already present before this convention was written down; not linked from elsewhere today, but keep the names stable regardless
- Two pages are deliberately left without additional ids: `jejak/[slug].astro` and the three legal pages (`privasi`/`syarat`/`transparansi` via `LegalLayout.astro`) are each one continuous `<section>` wrapping the whole article, so there's nothing for an id to distinguish it from. The legal pages already have working in-page navigation on their prose `<h2>`s, via Markdoc's auto-generated heading slugs — a separate, older mechanism, untouched by this convention.

## Re-running the anchor check

Extracts every `href="...#slug"` from `src/` + `astro.config.mjs` and every `id="..."` from a `bun run build` output, then reports any href whose target page has no matching id. Relative hrefs (`href="#slug"`, no leading `/`) can't be resolved to a target page from the string alone, so the script keeps a small hand-maintained `RELATIVE_ANCHOR_TARGETS` map of source file → target page(s) for the handful of files that use them (`Hero.astro`, `FaqHome.astro`, `ProgramStage.astro`, `PintuS1.astro`, `Faq.astro`, `LegalLayout.astro`, `program/[program].astro`, plus `SolutionSection.astro`'s SVG-internal `<mpath>` reference, mapped to nothing since it isn't page navigation). A relative href from a file outside that map is reported as `UNMAPPED` rather than silently skipped.

Save as a scratch file and run `bun run build` first:

```js
#!/usr/bin/env node
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';

const root = process.argv[2] || process.cwd();
const distDir = path.join(root, 'dist');

const RELATIVE_ANCHOR_TARGETS = {
  'Hero.astro': ['index.html'],
  'FaqHome.astro': ['index.html'],
  'ProgramStage.astro': ['index.html'],
  'SolutionSection.astro': [], // <mpath href="#solRiver"> is SVG-internal, not page nav
  'PintuS1.astro': ['berbagi-makanan/index.html', 'berbagi-barang/index.html', 'berbagi-waktu/index.html', 'berbagi-ruang/index.html', 'berbagi-dana/index.html', 'berbagi-pohon/index.html'],
  'Faq.astro': ['faq/index.html'],
  'LegalLayout.astro': ['privasi/index.html', 'syarat/index.html', 'transparansi/index.html'],
  // Grows when a programme is activated in Keystatic — it's one source file
  // generating N pages, and the map only takes literal paths. A programme added
  // here but not built shows up as MISSING-PAGE, which is the right failure.
  '[program].astro': ['program/jumat-berkah/index.html', 'program/ramadhan-berbagi/index.html', 'program/community-giving/index.html', 'program/csr-food-program/index.html'],
};

function walk(dir, exts, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name.startsWith('.')) continue;
      walk(full, exts, out);
    } else if (exts.some((e) => entry.name.endsWith(e))) {
      out.push(full);
    }
  }
  return out;
}

function resolveAbsolute(hrefPath) {
  let p = hrefPath.replace(/^\//, '').replace(/\/$/, '');
  return p === '' ? 'index.html' : `${p}/index.html`;
}

const srcFiles = walk(path.join(root, 'src'), ['.astro', '.ts', '.js']);
const configFile = path.join(root, 'astro.config.mjs');
const anchors = [];

for (const file of srcFiles) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((lineText, i) => {
    if (lineText.includes('<mpath')) return;
    const re = /href=(?:\{`([^`]*#[^`]+)`\}|"([^"]*#[^"]+)")/g;
    let m;
    while ((m = re.exec(lineText))) {
      anchors.push({ file: path.relative(root, file), line: i + 1, href: m[1] ?? m[2] });
    }
  });
}
{
  const text = readFileSync(configFile, 'utf8');
  const re = /'\/[a-zA-Z0-9/_-]*':\s*'([^']*#[^']+)'/g;
  let m;
  while ((m = re.exec(text))) {
    anchors.push({ file: path.relative(root, configFile), line: 0, href: m[1] });
  }
}

let ok = 0, broken = 0, unmapped = 0;

for (const a of anchors) {
  const hashIdx = a.href.indexOf('#');
  const pathPart = a.href.slice(0, hashIdx);
  const slug = a.href.slice(hashIdx + 1);
  if (slug.includes('${')) {
    console.log(`DYNAMIC  ${a.file}:${a.line}  href="${a.href}"  (verify by reading the component)`);
    continue;
  }

  let targets;
  if (pathPart.startsWith('/')) {
    targets = [resolveAbsolute(pathPart)];
  } else {
    targets = RELATIVE_ANCHOR_TARGETS[path.basename(a.file)];
    if (targets === undefined) {
      console.log(`UNMAPPED ${a.file}:${a.line}  href="${a.href}"  (add this file to RELATIVE_ANCHOR_TARGETS)`);
      unmapped++;
      continue;
    }
    if (targets.length === 0) continue;
  }

  for (const target of targets) {
    const distPath = path.join(distDir, target);
    if (!existsSync(distPath)) {
      console.log(`MISSING-PAGE ${a.file}:${a.line}  href="${a.href}"  -> dist/${target} does not exist`);
      broken++;
      continue;
    }
    const html = readFileSync(distPath, 'utf8');
    // The href may live inside a conditional branch (e.g. PintuS1's "#program"),
    // so skip pages where it was never actually rendered — nothing to break there.
    if (!html.includes(`href="${a.href}"`)) continue;
    const idRe = new RegExp(`\\sid=["']${slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`);
    if (idRe.test(html)) ok++;
    else {
      console.log(`BROKEN   ${a.file}:${a.line}  href="${a.href}"  -> rendered on dist/${target} but no id="${slug}" there`);
      broken++;
    }
  }
}

console.log(`\n${ok} ok, ${broken} broken, ${unmapped} unmapped anchor(s) checked.`);
process.exit(broken > 0 || unmapped > 0 ? 1 : 0);
```

Five anchors always print as `DYNAMIC` (their slug is a JS expression, not a literal string) and were verified by reading the component instead: `Faq.astro`'s per-category TOC links its own `id={g.slug}` rows, `ProgramStage.astro`'s arrow/tick links its own `id={slide.domId}` articles, and `LegalLayout.astro`'s TOC links Markdoc's auto-generated `<h2>` slugs.
