import { getCollection, getEntry } from 'astro:content';
import { OGImageRoute } from 'astro-og-canvas';
import { ogKeyFromPath } from '../../lib/seo';

/**
 * OG image di-generate saat build (bukan file statis yang didesain manual),
 * supaya halaman program yang baru — entry-nya lahir dari collection
 * `programs` di Keystatic — otomatis kebagian share image tanpa perlu
 * bikin gambar baru tiap kali.
 */

/**
 * Judul/deskripsi dibaca dari singleton `seo` yang sama dengan yang dipakai
 * BaseLayout, jadi teks di gambar share selalu sama dengan meta tag-nya —
 * dulu keduanya disimpan terpisah dan harus disamakan manual.
 */
const seoEntry = await getEntry('seo', 'seo');
if (!seoEntry) throw new Error('seo/seo entry not found');

const manualPages: Record<string, { title: string; description: string }> = Object.fromEntries(
  seoEntry.data.pages.map((page) => [
    ogKeyFromPath(page.path),
    { title: page.title, description: page.description },
  ])
);

/**
 * Cuma program yang punya halaman sendiri yang dibikinin OG image — kalau
 * tidak, PNG-nya jadi yatim (tidak pernah direferensikan meta tag mana pun).
 * Route dideteksi dari file `src/pages/*.astro`, jadi begitu halaman program
 * baru dibuat, OG image-nya ikut ter-generate tanpa mengubah file ini.
 */
const pageRoutes = new Set(
  Object.keys(import.meta.glob('../*.astro')).map((path) =>
    path.replace('../', '').replace('.astro', '')
  )
);

const programs = await getCollection('programs');
const programPages = Object.fromEntries(
  programs
    .map((entry) => [entry.id.replace(/^\d+-/, ''), entry.data] as const)
    .filter(([slug]) => pageRoutes.has(slug) && !(slug in manualPages))
    .map(([slug, data]) => [
      slug,
      {
        title: `${data.label} — bagiberbagi.id`,
        description: `Program ${data.label} dari bagiberbagi.id — berbagi makanan bersama UMKM lokal, tersalurkan dan terdokumentasi.`,
      },
    ])
);

export const { getStaticPaths, GET } = await OGImageRoute({
  pages: { ...programPages, ...manualPages },
  getImageOptions: (_path, page: { title: string; description: string }) => ({
    title: page.title,
    description: page.description,
    logo: {
      path: './src/assets/images/logo/logo-horizontal-color.png',
      size: [420],
    },
    // Terang seperti situsnya: putih → brand-orangeTint, garis brand-orange.
    bgGradient: [
      [255, 255, 255],
      [253, 238, 225],
    ],
    border: { color: [194, 84, 0], width: 20, side: 'inline-start' },
    padding: 60,
    fonts: [
      './node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-800-normal.woff',
      './node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-400-normal.woff',
    ],
    font: {
      title: {
        families: ['Plus Jakarta Sans'],
        weight: 'ExtraBold',
        color: [15, 23, 42],
        size: 62,
      },
      description: {
        families: ['Plus Jakarta Sans'],
        weight: 'Normal',
        color: [80, 93, 111],
        size: 30,
        lineHeight: 1.4,
      },
    },
  }),
});
