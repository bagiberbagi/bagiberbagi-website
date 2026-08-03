// @ts-check
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

import markdoc from '@astrojs/markdoc';

import seoGraph from '@jdevalk/astro-seo-graph/integration';

import react from '@astrojs/react';

import { readdirSync, readFileSync } from 'node:fs';

/**
 * Peta slug jejak → tanggal kegiatan, dipakai `serialize` sitemap di bawah.
 *
 * Frontmatter dibaca dengan regex alih-alih parser YAML penuh karena yang
 * dibutuhkan cuma satu baris berbentuk tetap (`date: '2026-07-31'`), dan
 * menarik dependensi parser ke dalam berkas konfigurasi demi satu field itu
 * tidak sepadan. Entri yang tanggalnya tak terbaca dilewati begitu saja: URL-nya
 * tetap masuk sitemap, cuma tanpa lastmod, dan itu lebih baik daripada
 * menerbitkan tanggal tebakan.
 */
const jejakDates = (() => {
  const map = new Map();
  try {
    for (const file of readdirSync('src/content/jejak')) {
      if (!file.endsWith('.mdoc')) continue;
      const head = readFileSync(`src/content/jejak/${file}`, 'utf8').split('\n---')[0];
      const date = head.match(/^date:\s*'?(\d{4}-\d{2}-\d{2})'?/m)?.[1];
      if (date) map.set(file.replace(/\.mdoc$/, ''), date);
    }
  } catch {
    // Folder konten belum ada (mis. checkout parsial). Sitemap tetap terbit
    // tanpa lastmod, bukan gagal membangun.
  }
  return map;
})();

// https://astro.build/config
export default defineConfig({
  site: 'https://www.bagiberbagi.id',
  output: 'static',

  // `/program` (tanpa slug) tak punya index. Program dibrowse lewat halaman
  // pintu, jadi URL telanjang diarahkan ke peta pintu di beranda. Path
  // persis saja, tidak mengganggu route dinamis `/program/[program]/`.
  redirects: {
    '/program': '/#pintu',
  },

  // Keystatic Cloud's local-dev auth flow redirects to 127.0.0.1 specifically
  // (not "localhost") — bind the dev server there so that redirect resolves.
  // Matches what @keystatic/astro's own integration does internally.
  server: {
    host: '127.0.0.1',
  },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    sitemap({
      filter: (page) => !page.includes('/keystatic'),
      // `lastmod` cuma dipasang di halaman jejak, dan itu disengaja.
      //
      // Google mengabaikan lastmod yang tidak konsisten atau tidak akurat, jadi
      // mengisinya untuk seluruh halaman dengan waktu build justru membuang
      // sinyalnya: tiap deploy akan menyatakan 22 halaman berubah serentak,
      // padahal yang berubah mungkin satu. Halaman jejak punya tanggal sungguhan
      // di frontmatter-nya, dan entri jejak adalah dokumentasi historis yang
      // praktis tak pernah disunting sesudah terbit, jadi di sanalah tanggalnya
      // bisa dipertanggungjawabkan. Sitemap dengan lastmod parsial itu sah.
      //
      // Dibaca langsung dari disk, bukan lewat `astro:content`: berkas konfigurasi
      // ini dijalankan Node sebelum runtime Astro ada.
      serialize: (item) => {
        const m = item.url.match(/\/jejak\/([^/]+)\/$/);
        if (!m) return item;
        const date = jejakDates.get(m[1]);
        return date ? { ...item, lastmod: date } : item;
      },
      // Sitemap gambar dibangun sendiri di src/pages/sitemap-images.xml.ts:
      // tipe SitemapItem integrasi ini tak punya slot gambar, jadi `serialize`
      // tak bisa menambahkannya. Didaftarkan di sini supaya tetap tergantung di
      // sitemap-index yang sama dan cukup satu URL yang disetor ke Search Console.
      customSitemaps: ['https://www.bagiberbagi.id/sitemap-images.xml'],
    }),
    // Halaman legal (privasi/syarat/transparansi) pakai .mdoc supaya body-nya
    // bisa diedit lewat Keystatic: contentField Keystatic hanya mendukung
    // ekstensi .mdoc. Markdoc tetap menghasilkan `headings` + anchor id lewat
    // content collections API, jadi TOC di LegalLayout tidak berubah.
    markdoc(),
    react(),
    // Hanya lint saat build (peringatan, tidak menggagalkan). IndexNow sengaja
    // belum diaktifkan karena butuh API key. Pembangkit llms.txt bawaan plugin
    // ini juga tidak dipakai: situs menyusunnya sendiri di
    // `src/pages/llms.txt.ts`, supaya isinya lahir dari `PINTU` dan koleksi
    // `programs` alih-alih dari daftar halaman.
    seoGraph({
      validateH1: true,
      validateUniqueMetadata: true,
      validateImageAlt: true,
      // Bawaan plugin memberi deskripsi kelonggaran sampai 200 karakter, jauh
      // di atas titik potong Google (~160), jadi deskripsi kepanjangan lolos
      // tanpa suara. Diketatkan ke 160 supaya build ikut menjaga string yang
      // tak lewat Keystatic (PINTU di consts.ts, prop title/description di
      // halaman .astro) yang tak tersentuh validation admin.
      validateMetadataLength: { description: { max: 160 } },
      validateInternalLinks: true,
    }),
  ],
});