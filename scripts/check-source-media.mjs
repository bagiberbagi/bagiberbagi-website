#!/usr/bin/env node
/**
 * Fails when an asset directory carries a file that is not the kind of asset
 * that directory is for. In practice: audio and video.
 *
 * Why this exists as its own check, next to `check-dist-assets.mjs`.
 *
 * On 11 August 2026 three copies of one MP3 were uploaded through Keystatic
 * into the *photo* slots of a jejak gallery. The file was the audio track of a
 * 29-second video, still carrying the MP4 container brands of the clip it came
 * from. `fields.image` accepted all three without a word, because Keystatic
 * does not check what is inside the file it is handed.
 *
 * Nothing downstream reported it either, and that is the part worth stating.
 * The eager glob in `src/lib/jejak.ts` only matches image extensions, so the
 * three never became modules, never reached `dist`, and were therefore
 * invisible to the dist check: an unreferenced *image* is what that one looks
 * for, and this was not an image at all. The build printed three lines saying
 * the photo was skipped and carried on. The gallery quietly rendered three
 * slots short on a published page, and 1.4 MB of audio settled into git
 * history where it cannot be removed.
 *
 * So the two checks watch opposite ends of the same pipeline. The dist one asks
 * whether every emitted image is referenced. This one asks whether every file
 * in the source directories belongs there at all, which is the only place a
 * file that never enters the pipeline can be seen.
 *
 * The rule it enforces is the owner's, stated on 12 August 2026: no video or
 * audio file gets published from this repository. Video is embedded by link
 * (`jejak.video.url`, a Drive or YouTube URL read by `src/lib/video.ts`) with a
 * still image as its poster, and that stays true regardless of this check.
 */
import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const IMAGE = ['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.svg'];

/**
 * One entry per directory that holds editor-uploaded assets, with what may
 * live there. `public/uploads/jejak-reports/` also takes PDF, because
 * `jejak.reportPdf` is a document rather than a picture.
 */
const RULES = [
  { dir: 'src/assets', allow: IMAGE },
  { dir: 'public/uploads', allow: [...IMAGE, '.pdf'] },
];

/** Bookkeeping that is not an asset and never reaches a visitor. */
const IGNORED = new Set(['.md', '.gitkeep']);

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out; // A directory that does not exist yet is not a failure.
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (!e.name.startsWith('.')) out.push(full);
  }
  return out;
}

const offenders = [];
let checked = 0;

for (const { dir, allow } of RULES) {
  for (const file of walk(path.join(process.cwd(), dir))) {
    const ext = path.extname(file).toLowerCase();
    if (IGNORED.has(ext)) continue;
    checked++;
    if (!allow.includes(ext)) {
      offenders.push({ file: path.relative(process.cwd(), file), ext, bytes: statSync(file).size });
    }
  }
}

if (offenders.length === 0) {
  console.log(`[media] ${checked} asset file(s) checked, every one an allowed type.`);
  process.exit(0);
}

console.error(`[media] ${offenders.length} file(s) that do not belong in an asset directory:\n`);
for (const o of offenders.sort((a, b) => b.bytes - a.bytes)) {
  console.error(`  ${(o.bytes / 1024).toFixed(0).padStart(7)} KB  ${o.file}  (${o.ext})`);
}
console.error(
  '\nAudio and video are never published from this repository. A video belongs in' +
    '\n`jejak.video.url` as a Drive or YouTube link, with a still image as its poster.' +
    '\nIf a new document type is genuinely needed, widen the rule in this file rather' +
    '\nthan leaving the file where nothing can see it.'
);
process.exit(1);
