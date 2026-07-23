import { getEntry } from 'astro:content';
import { OGImageRoute } from 'astro-og-canvas';
import { ogKeyFromPath } from '../../lib/seo';
import { getProgramPages } from '../../lib/programs';
import { getJejakPages } from '../../lib/jejak';

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

const aboutEntry = await getEntry('about', 'about');

const manualPages: Record<string, { title: string; description: string }> = Object.fromEntries([
  ...seoEntry.data.pages.map((page) => [
    ogKeyFromPath(page.path),
    { title: page.title, description: page.description },
  ]),
  // /tentang/ SEO-nya menempel di entri kontennya sendiri, jadi tidak ikut
  // terbawa daftar terpusat di atas.
  ...(aboutEntry
    ? [
        [
          'tentang',
          {
            title: aboutEntry.data.seo?.title || `${aboutEntry.data.hero.title} — bagiberbagi.id`,
            description: aboutEntry.data.seo?.description || aboutEntry.data.hero.paragraphs[0],
          },
        ],
      ]
    : []),
]);

/**
 * Cuma program yang punya halaman sendiri (aktif + Detail terisi) yang
 * dibikinin OG image — kalau tidak, PNG-nya jadi yatim. Sumbernya sama dengan
 * route dinamis `[program].astro`, jadi begitu editor mengaktifkan program di
 * Keystatic, share image-nya ikut ter-generate tanpa mengubah file ini.
 */
const programPages = Object.fromEntries(
  (await getProgramPages())
    .filter((program) => !(`program/${program.slug}` in manualPages))
    .map((program) => [
      `program/${program.slug}`,
      {
        title: `${program.label} — bagiberbagi.id`,
        description: program.summary,
      },
    ])
);

/**
 * Tiap halaman detail jejak (`/jejak/{slug}/`) kebagian share image sendiri,
 * di-namespace `jejak/{slug}` supaya route-nya `/open-graph/jejak/{slug}.png`
 * dan tak bentrok dengan slug program. Sumbernya `getJejakPages()` — sama
 * dengan route dinamis `[slug].astro` — jadi begitu editor menerbitkan jejak
 * baru di Keystatic, OG image-nya ikut ter-generate tanpa mengubah file ini.
 * Judul = `title` display jejak, deskripsi = `summary`.
 */
const jejakPages = Object.fromEntries(
  (await getJejakPages()).map((jejak) => [
    `jejak/${jejak.slug}`,
    {
      title: `${jejak.title} — bagiberbagi.id`,
      description: jejak.summary,
    },
  ])
);

export const { getStaticPaths, GET } = await OGImageRoute({
  pages: { ...programPages, ...jejakPages, ...manualPages },
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
