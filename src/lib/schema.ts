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
 * `contentLocation` merujuk Place lewat `@id`, bukan menyalin node-nya: piece
 * Place-nya selalu diterbitkan top-level oleh `buildJejakPlacesSchema` (yang
 * dipanggil halaman tanpa syarat, ada video atau tidak), jadi yang di sini
 * menunjuk node yang sama dengan yang ditunjuk `Article.contentLocation`,
 * bukan salinan kedua yang tak ikut masuk graph.
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
    ...(places.length > 0
      ? { contentLocation: places.map((p) => ({ '@id': jejakPlaceId(pageUrl, p) })) }
      : {}),
  };
}

/**
 * ImageObject piece per foto jejak.
 *
 * Foto lapangan adalah bukti yang jadi seluruh argumen situs ini, tapi sebelum
 * ini tak satu pun disebut di graph: halaman jejak mendeklarasikan videonya
 * lengkap sampai koordinat, sementara foto-fotonya cuma ada sebagai <img>.
 * Menyebutnya eksplisit memberi tahu mesin pencari foto mana yang milik
 * halaman ini, dan `caption` memberi keterangan yang tak bisa disimpulkan dari
 * berkasnya.
 *
 * `contentUrl` menunjuk berkas versi besar yang sama dengan yang dibuka
 * lightbox, bukan thumbnail: keduanya memang ada di halaman, dan yang besar
 * itulah yang berguna kalau seseorang menemukannya lewat Google Images.
 *
 * `caption` cuma disertakan kalau editor benar-benar menulisnya. Alt turunan
 * judul sengaja tak dipakai sebagai caption, karena caption menjanjikan
 * keterangan sungguhan dan alt cadangan bukan itu.
 */
export function buildJejakImagesSchema(
  pageUrl: string,
  photos: { contentUrl: string; alt: string; caption: string | null }[]
) {
  return photos.map((p, i) => ({
    '@type': 'ImageObject',
    '@id': `${pageUrl}#image-${i + 1}`,
    contentUrl: p.contentUrl,
    representativeOfPage: i === 0,
    description: p.alt,
    ...(p.caption ? { caption: p.caption } : {}),
  }));
}

/**
 * Place piece untuk titik peta sebuah jejak, selalu diterbitkan top-level di
 * `@graph` halaman. Dipanggil tanpa syarat, ada video atau tidak:
 * `contentLocation` milik `buildJejakVideoSchema` maupun
 * `buildJejakArticleSchema` sama-sama merujuknya lewat `@id` alih-alih
 * menyalinnya, jadi satu koordinat menghasilkan tepat satu node Place berapa
 * pun piece yang menunjuknya.
 */
export function buildJejakPlacesSchema(
  pageUrl: string,
  places: { label: string; lat: number; lng: number }[]
) {
  return places.map((p) => placePiece(pageUrl, p));
}

// Koordinat dipakai sebagai kunci, bukan urutan dalam daftar: urutan bisa
// ditukar editor lewat drag, dan id yang berubah-ubah memutus rujukan.
//
// Diekspor supaya pemanggil yang cuma perlu *merujuk* Place-nya (mis.
// `Article.contentLocation`) bisa menyusun `@id` yang persis sama tanpa
// menduplikasi node yang dibangun `buildJejakPlacesSchema`.
export function jejakPlaceId(pageUrl: string, place: { lat: number; lng: number }) {
  return `${pageUrl}#place-${place.lat},${place.lng}`;
}

function placePiece(pageUrl: string, place: { label: string; lat: number; lng: number }) {
  return {
    '@type': 'Place',
    '@id': jejakPlaceId(pageUrl, place),
    name: place.label,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: place.lat,
      longitude: place.lng,
    },
  };
}

// Google mengabaikan headline yang lewat 110 karakter. `jejak.title` itu teks
// bebas tanpa batas panjang di Keystatic, jadi pemotongan ini pengaman, bukan
// jalur yang memang diharapkan sering terpakai.
const HEADLINE_MAX = 110;

/**
 * Article piece untuk halaman jejak: dokumentasi kegiatan penyaluran yang
 * bertanggal, berlokasi, berfoto, dan punya badan tulisan. Itu persis yang
 * dimodelkan Article.
 *
 * `author` dan `publisher` sama-sama merujuk node Organization situs lewat
 * `@id`, bukan menyalinnya: jejak tak punya field penulis perorangan (relasi
 * `organisasi`-nya atribusi lateral, bukan klaim kepengarangan), dan yang
 * benar-benar menerbitkan laporan ini bagiberbagi sendiri. `dateModified`
 * juga sengaja tak diisi: schema jejak tak punya field-nya, dan menebaknya
 * berarti menerbitkan fakta yang tidak ada.
 */
export function buildJejakArticleSchema(input: {
  pageUrl: string;
  headline: string;
  description: string;
  /**
   * Tanggal kegiatan (ISO YYYY-MM-DD), dipakai sebagai `datePublished` karena
   * schema jejak tak punya field tanggal terbit tersendiri. Ini cuma sepadan
   * selama jejak diterbitkan berdekatan dengan kegiatannya, dan berhenti
   * akurat begitu ada kegiatan lama yang diisikan jauh belakangan.
   */
  datePublished: string;
  /** `@id` piece ImageObject yang dirujuk, kalau jejaknya punya cover. */
  image?: string;
  /** `@id` node Organization situs, dirujuk untuk `author` sekaligus `publisher`. */
  publisherOrgId: string;
  places?: { lat: number; lng: number }[];
}) {
  const { pageUrl, headline, description, datePublished, image, publisherOrgId, places = [] } = input;
  const cappedHeadline =
    headline.length > HEADLINE_MAX ? `${headline.slice(0, HEADLINE_MAX - 1).trimEnd()}…` : headline;
  return {
    '@type': 'Article',
    '@id': `${pageUrl}#article`,
    headline: cappedHeadline,
    description,
    datePublished,
    inLanguage: 'id-ID',
    mainEntityOfPage: pageUrl,
    isPartOf: { '@id': pageUrl },
    author: { '@id': publisherOrgId },
    publisher: { '@id': publisherOrgId },
    // Merujuk node ImageObject lewat `@id`, bukan menyalin URL-nya: URL itu
    // sudah ada di node tadi, berikut caption/description yang tak dibawa
    // Article, dan schema.org menandai `image` sebagai `@type: @id`, jadi URL
    // telanjang di sini akan mengembang jadi node kedua tanpa tipe untuk file
    // yang sama.
    ...(image ? { image: [{ '@id': image }] } : {}),
    ...(places.length > 0
      ? { contentLocation: places.map((p) => ({ '@id': jejakPlaceId(pageUrl, p) })) }
      : {}),
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
