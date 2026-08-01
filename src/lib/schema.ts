/**
 * Schema.org pieces yang dibangun dari content collection.
 *
 * Dipisah dari komponen yang merender-nya supaya halaman bisa menyuntikkan
 * piece ini ke `@graph` milik BaseLayout lewat prop `extraSchema` — satu
 * `<script type="application/ld+json">` per halaman, bukan satu per komponen.
 */

interface FaqItem {
  q: string;
  a: string;
}

/**
 * VideoObject piece untuk halaman jejak yang punya video dokumentasi.
 *
 * Ini satu-satunya bagian schema di situs ini yang bisa menghasilkan hasil kaya
 * di pencarian: Google menampilkan thumbnail video di samping tautan halaman.
 * Syaratnya video itu bisa dijangkau crawler, jadi selama videonya dititip di
 * Google Drive markup ini benar tapi kemungkinan besar belum dipakai; ia mulai
 * berbuah begitu videonya pindah ke penyedia yang memang mengizinkan crawling.
 *
 * `contentLocation` ikut di sini, bukan berdiri sendiri, karena Place yang tak
 * menempel pada apa pun tak menjelaskan hubungannya dengan halaman.
 */
export function buildJejakVideoSchema(input: {
  pageUrl: string;
  name: string;
  description: string;
  /** Tanggal kegiatan (ISO YYYY-MM-DD); dipakai sebagai uploadDate. */
  date: string;
  /** URL absolut gambar poster. */
  thumbnailUrl?: string;
  /** Salah satu diisi: embedUrl untuk pemutar pihak ketiga, contentUrl untuk berkas. */
  embedUrl?: string;
  contentUrl?: string;
  places?: { label: string; lat: number; lng: number }[];
}) {
  const { pageUrl, name, description, date, thumbnailUrl, embedUrl, contentUrl, places = [] } = input;
  return {
    '@type': 'VideoObject',
    '@id': `${pageUrl}#video`,
    name,
    description,
    uploadDate: date,
    mainEntityOfPage: pageUrl,
    ...(thumbnailUrl ? { thumbnailUrl: [thumbnailUrl] } : {}),
    ...(embedUrl ? { embedUrl } : {}),
    ...(contentUrl ? { contentUrl } : {}),
    ...(places.length > 0 ? { contentLocation: places.map((p) => placePiece(pageUrl, p)) } : {}),
  };
}

/**
 * Place piece untuk jejak yang punya titik peta tapi tak punya video. Saat
 * videonya ada, tempatnya sudah menempel di VideoObject dan fungsi ini tak
 * dipakai, supaya satu titik tak muncul dua kali di graph yang sama.
 */
export function buildJejakPlacesSchema(
  pageUrl: string,
  places: { label: string; lat: number; lng: number }[]
) {
  return places.map((p) => placePiece(pageUrl, p));
}

function placePiece(pageUrl: string, place: { label: string; lat: number; lng: number }) {
  return {
    '@type': 'Place',
    // Koordinat dipakai sebagai kunci, bukan urutan dalam daftar: urutan bisa
    // ditukar editor lewat drag, dan id yang berubah-ubah memutus rujukan.
    '@id': `${pageUrl}#place-${place.lat},${place.lng}`,
    name: place.label,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: place.lat,
      longitude: place.lng,
    },
  };
}

/** FAQPage piece dari daftar pertanyaan di singleton `faq`. */
export function buildFaqPageSchema(faqs: readonly FaqItem[], pageUrl: string) {
  return {
    '@type': 'FAQPage',
    '@id': `${pageUrl}#faq`,
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
  };
}
