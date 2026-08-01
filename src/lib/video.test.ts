// src/lib/video.test.ts
import { test, expect } from 'bun:test';
import { parseVideoUrl } from './video';

const DRIVE_FILE = '1kTXfcdfYe7Ld6nwG8uLwM0bp-jD7VcIh';

test('parseVideoUrl returns null for empty, whitespace, and missing input', () => {
  expect(parseVideoUrl('')).toBeNull();
  expect(parseVideoUrl('   ')).toBeNull();
  expect(parseVideoUrl(null)).toBeNull();
  expect(parseVideoUrl(undefined)).toBeNull();
});

test('parseVideoUrl reads every YouTube link shape people actually paste', () => {
  const shapes = [
    'https://youtu.be/dQw4w9WgXcQ',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://m.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://www.youtube.com/shorts/dQw4w9WgXcQ',
    'https://www.youtube.com/live/dQw4w9WgXcQ',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
  ];
  for (const url of shapes) {
    const parsed = parseVideoUrl(url);
    if (parsed?.kind !== 'embed') throw new Error(`expected an embed for ${url}`);
    expect(parsed.provider).toBe('youtube');
    expect(parsed.embedUrl).toContain('embed/dQw4w9WgXcQ');
  }
});

test('parseVideoUrl ignores timestamp, playlist, and share params around the id', () => {
  const parsed = parseVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s&list=PLabc&si=xyz');
  expect(parsed?.kind === 'embed' && parsed.embedUrl).toContain('embed/dQw4w9WgXcQ');
});

test('parseVideoUrl embeds YouTube through the nocookie domain and autoplays on demand', () => {
  const parsed = parseVideoUrl('https://youtu.be/dQw4w9WgXcQ');
  if (parsed?.kind !== 'embed') throw new Error('expected an embed source');
  expect(parsed.embedUrl).toContain('youtube-nocookie.com/embed/dQw4w9WgXcQ');
  expect(parsed.watchUrl).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  expect(parsed.autoplay).toBe(true);
});

test('parseVideoUrl turns every Drive single-file shape into the same preview embed', () => {
  const shapes = [
    `https://drive.google.com/file/d/${DRIVE_FILE}/view?usp=sharing`,
    `https://drive.google.com/file/d/${DRIVE_FILE}/preview`,
    `https://drive.google.com/file/d/${DRIVE_FILE}`,
    `https://drive.google.com/open?id=${DRIVE_FILE}`,
    `https://drive.google.com/uc?export=download&id=${DRIVE_FILE}`,
  ];
  for (const url of shapes) {
    const parsed = parseVideoUrl(url);
    if (parsed?.kind !== 'embed') throw new Error(`expected an embed for ${url}`);
    expect(parsed.provider).toBe('drive');
    expect(parsed.embedUrl).toBe(`https://drive.google.com/file/d/${DRIVE_FILE}/preview`);
    // Drive tak punya parameter autoplay, jadi halaman tak boleh menjanjikannya.
    expect(parsed.autoplay).toBe(false);
  }
});

test('parseVideoUrl reads Vimeo in both its share and player shapes', () => {
  for (const url of ['https://vimeo.com/76979871', 'https://player.vimeo.com/video/76979871']) {
    const parsed = parseVideoUrl(url);
    if (parsed?.kind !== 'embed') throw new Error(`expected an embed for ${url}`);
    expect(parsed.provider).toBe('vimeo');
    expect(parsed.embedUrl).toContain('player.vimeo.com/video/76979871');
  }
});

test('parseVideoUrl survives a link pasted without its scheme', () => {
  expect(parseVideoUrl('youtu.be/dQw4w9WgXcQ')?.kind).toBe('embed');
  expect(parseVideoUrl(`drive.google.com/file/d/${DRIVE_FILE}/preview`)?.kind).toBe('embed');
});

test('parseVideoUrl strips wrapping and trailing punctuation copied along with the link', () => {
  expect(parseVideoUrl('  <https://youtu.be/dQw4w9WgXcQ>  ')?.kind).toBe('embed');
  expect(parseVideoUrl('"https://youtu.be/dQw4w9WgXcQ",')?.kind).toBe('embed');
  expect(parseVideoUrl('https://youtu.be/dQw4w9WgXcQ.')?.kind).toBe('embed');
});

test('parseVideoUrl accepts a self-hosted file by relative path or absolute url', () => {
  expect(parseVideoUrl('/uploads/jejak/klip.mp4')).toEqual({ kind: 'file', src: '/uploads/jejak/klip.mp4' });
  expect(parseVideoUrl('/uploads/jejak/klip.WEBM')).toEqual({ kind: 'file', src: '/uploads/jejak/klip.WEBM' });
  expect(parseVideoUrl('https://cdn.example.com/a/b.mp4')).toEqual({
    kind: 'file',
    src: 'https://cdn.example.com/a/b.mp4',
  });
});

test('parseVideoUrl degrades a Drive FOLDER to an outgoing link instead of dropping it', () => {
  const parsed = parseVideoUrl('https://drive.google.com/drive/folders/15FX1pcOkLNOH2cfgcBLHjM3qPyUzmlxn?usp=drive_link');
  if (parsed?.kind !== 'link') throw new Error('expected an outgoing link');
  expect(parsed.label).toBe('Google Drive');
  expect(parsed.href).toContain('/drive/folders/');
});

test('parseVideoUrl degrades platforms that cannot be embedded to a named link', () => {
  expect(parseVideoUrl('https://www.instagram.com/reel/Cabc123/')).toEqual({
    kind: 'link',
    href: 'https://www.instagram.com/reel/Cabc123/',
    label: 'Instagram',
  });
  expect(parseVideoUrl('https://www.tiktok.com/@akun/video/123')?.kind === 'link').toBe(true);
  // Yang tak ada di tabel label memakai hostname-nya sendiri.
  expect(parseVideoUrl('https://contoh.id/video-kami')).toEqual({
    kind: 'link',
    href: 'https://contoh.id/video-kami',
    label: 'contoh.id',
  });
});

test('parseVideoUrl still returns null for text that is not an address at all', () => {
  expect(parseVideoUrl('bukan url sama sekali')).toBeNull();
  expect(parseVideoUrl('bukanurl')).toBeNull();
  expect(parseVideoUrl('/uploads/jejak/foto.png')).toBeNull();
});

test('parseVideoUrl rejects a YouTube id that is not 11 url-safe characters', () => {
  // Bukan video, tapi alamatnya benar, jadi turun jadi tautan dan bukan null.
  expect(parseVideoUrl('https://youtu.be/short')?.kind).toBe('link');
  expect(parseVideoUrl('https://www.youtube.com/watch?v=way-too-long')?.kind).toBe('link');
});
