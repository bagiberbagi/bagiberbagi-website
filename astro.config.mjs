// @ts-check
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://bagiberbagi.id',
  output: 'static',

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
    react(),
  ],
});