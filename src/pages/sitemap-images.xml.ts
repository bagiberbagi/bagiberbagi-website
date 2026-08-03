import type { APIRoute } from 'astro';
import { getImage } from 'astro:assets';
import { getJejak, getJejakMedia } from '../lib/jejak';

/**
 * Sitemap gambar, terpisah dari sitemap halaman.
 *
 * Kenapa berkas sendiri dan bukan menumpang @astrojs/sitemap: tipe `SitemapItem`
 * integrasi itu adalah `Pick<..., 'url' | 'lastmod' | 'changefreq' | 'priority' |
 * 'links'>`, jadi `serialize` tak punya tempat menaruh gambar sama sekali.
 * Opsi `namespaces.image` yang tersedia cuma mengumumkan namespace di XML tanpa
 * pernah mengisinya, dan itulah kenapa sitemap situs ini selama ini
 * mendeklarasikan namespace gambar dengan nol entri di dalamnya. Berkas ini
 * didaftarkan lewat `customSitemaps` di astro.config.mjs, jadi tetap tergantung
 * di sitemap-index yang sama.
 *
 * Rumah kanonik sebuah foto adalah halaman detail jejaknya, bukan /jejak/.
 * Galeri gabungan di /jejak/ memajang foto yang sama, tapi mendaftarkannya di
 * dua halaman cuma membuat Google memilih sendiri mana yang mau ditampilkan.
 *
 * URL-nya dibuat dengan parameter getImage yang persis sama dengan pemakaian di
 * halaman (webp, quality 80), sehingga menunjuk berkas yang benar-benar ada di
 * sana. getImage deterministik, jadi parameter sama menghasilkan berkas sama,
 * bukan varian kembar yang menggandakan isi dist.
 *
 * Cuma `image:loc` yang ditulis. Google menghentikan pembacaan `image:caption`,
 * `image:title`, `image:geo_location`, dan `image:license` pada Mei 2022, jadi
 * menuliskannya cuma menambah berkas tanpa menambah arti. Caption tetap hidup
 * di tempat yang memang dibaca, yaitu ImageObject di halaman dan figcaption
 * lightbox.
 */
const escapeXml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error('`site` wajib diisi di astro.config untuk membangun sitemap gambar.');

  const jejak = await getJejak();

  const entries = await Promise.all(
    jejak.map(async (j) => {
      // getJejakMedia dipakai bersama halaman detail, jadi daftar ini persis
      // foto yang di sana bisa diperbesar. Cover yang dipakai sebagai poster
      // video sengaja tak masuk: di halaman ia dirender dengan lebar poster,
      // jadi mendaftarkannya di sini akan membuat berkas kembar sekaligus
      // menunjuk URL yang tak ada di halaman mana pun. Foto itu tetap bisa
      // ditemukan crawler lewat <img> biasa, yang kini ber-alt.
      const { clickable } = getJejakMedia(j);
      const locs = await Promise.all(
        clickable.map(async (p) => {
          const img = await getImage({ src: p.img, format: 'webp', quality: 80 });
          return new URL(img.src, site).href;
        })
      );
      return { page: new URL(j.href, site).href, locs };
    })
  );

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...entries
      .filter((e) => e.locs.length > 0)
      .map((e) =>
        [
          '  <url>',
          `    <loc>${escapeXml(e.page)}</loc>`,
          ...e.locs.map((l) => `    <image:image><image:loc>${escapeXml(l)}</image:loc></image:image>`),
          '  </url>',
        ].join('\n')
      ),
    '</urlset>',
    '',
  ].join('\n');

  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
