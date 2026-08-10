#!/usr/bin/env node
/**
 * Fails when `dist/` carries an image nobody links to.
 *
 * This replaces the check that CLAUDE.md and `.claude/rules/image-pipeline.md`
 * described in prose:
 *
 *     find dist/_astro dist/uploads -iname '*.png' | wc -l   # must print 0
 *
 * That check had two holes, and on 10 August 2026 both were open at once while
 * it kept printing 0.
 *
 * **It only counted PNG.** Jejak sources are jpeg, jpg and png, so 22 of 24
 * photos were never watched. The leak it was written to catch grew to 7.7 MB
 * without the number ever moving.
 *
 * **It asked the wrong question.** Not every raw file in `dist` is a defect:
 * `jejak/[slug].astro` deliberately builds a jpeg poster with `getImage()` for
 * the JSON-LD `thumbnailUrl`, because that is read by search engines rather
 * than browsers. A check keyed on file extension has to either fail on that
 * one or keep a growing exception list.
 *
 * The real defect is narrower and easier to state: **an emitted image that no
 * page references.** That is what a leak is. It costs repo weight, deploy time
 * and rsync bandwidth, and it is invisible to every visitor, which is exactly
 * why nobody notices it.
 *
 * The mechanism that produces one: `import.meta.glob(..., { eager: true })`
 * statically imports every match, and Vite emits an asset for each import. A
 * photo that goes through `<Image>` is replaced by its optimised variants, so
 * the raw file never lands. A photo that is imported but never rendered lands
 * whole. So the moment content stops referencing a file that is still on disk,
 * its full-size original starts shipping.
 *
 * That is not hypothetical either. It is how this check came to be written: the
 * Keystatic admin dropped nine `image:` lines from one jejak entry on save. The
 * photos stayed in the repo, the entry lost its pictures on a published page,
 * and the nine originals began shipping to production as dead weight. One bug,
 * two symptoms, and the guard in place at the time reported success.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const dist = path.join(process.cwd(), 'dist');

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const all = walk(dist);
const IMAGE = /\.(png|jpe?g|webp|avif|gif|svg)$/i;
// Anything a page could link from. JSON-LD lives inside .html, and the sitemaps
// and OG routes are their own files, so plain text search over all of them is
// both sufficient and cheap.
const TEXT = /\.(html|xml|txt|json|js|css|webmanifest)$/i;

const images = all.filter((f) => IMAGE.test(f));
const haystack = all
  .filter((f) => TEXT.test(f))
  .map((f) => readFileSync(f, 'utf8'))
  .join('\n');

const orphans = images
  .filter((f) => !haystack.includes(path.basename(f)))
  .map((f) => ({ file: path.relative(dist, f), bytes: statSync(f).size }))
  .sort((a, b) => b.bytes - a.bytes);

if (orphans.length === 0) {
  console.log(`[assets] ${images.length} images in dist, all referenced.`);
  process.exit(0);
}

const total = orphans.reduce((n, o) => n + o.bytes, 0);
console.error(
  `[assets] ${orphans.length} unreferenced image(s) in dist, ${(total / 1024 / 1024).toFixed(2)} MB of dead weight:\n`
);
for (const o of orphans.slice(0, 20)) {
  console.error(`  ${(o.bytes / 1024).toFixed(0).padStart(7)} KB  ${o.file}`);
}
if (orphans.length > 20) console.error(`  ... and ${orphans.length - 20} more`);
console.error(
  '\nMost likely cause: content stopped pointing at a file that is still on disk,' +
    '\nso the eager glob keeps importing it and Vite keeps emitting the original.' +
    '\nEither restore the reference in the content entry, or delete the file.'
);
process.exit(1);
