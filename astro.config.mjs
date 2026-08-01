// @ts-check
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

import markdoc from '@astrojs/markdoc';

import seoGraph from '@jdevalk/astro-seo-graph/integration';

import react from '@astrojs/react';

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
    }),
    // Halaman legal (privasi/syarat/transparansi) pakai .mdoc supaya body-nya
    // bisa diedit lewat Keystatic: contentField Keystatic hanya mendukung
    // ekstensi .mdoc. Markdoc tetap menghasilkan `headings` + anchor id lewat
    // content collections API, jadi TOC di LegalLayout tidak berubah.
    markdoc(),
    react(),
    // Hanya lint saat build (peringatan, tidak menggagalkan). IndexNow dan
    // llms.txt sengaja belum diaktifkan: yang pertama butuh API key, yang kedua
    // baru berguna kalau situs punya konten artikel.
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