/**
 * Schema.org pieces yang dibangun dari content collection.
 *
 * Dipisah dari komponen yang merender-nya supaya halaman bisa menyuntikkan
 * piece ini ke `@graph` milik BaseLayout lewat prop `extraSchema` — satu
 * `<script type="application/ld+json">` per halaman, bukan satu per komponen.
 */

interface FaqEntry {
  data: { q: string; a: string };
}

/** FAQPage piece dari entri collection `faqs`. */
export function buildFaqPageSchema(faqs: readonly FaqEntry[], pageUrl: string) {
  return {
    '@type': 'FAQPage',
    '@id': `${pageUrl}#faq`,
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.data.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.data.a,
      },
    })),
  };
}
