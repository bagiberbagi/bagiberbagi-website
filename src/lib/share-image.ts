import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';

/**
 * Peta path string -> modul gambar untuk gambar share unggahan editor. Kunci
 * glob ini persis sama dengan `publicPath: '/src/assets/share/'` di
 * keystatic.config.ts. Kalau salah satu sisi diubah, ubah keduanya bersamaan.
 */
const SHARE_IMAGES = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/share/*.{png,jpg,jpeg,webp,avif,gif}',
  { eager: true }
);

/**
 * Peta path string -> modul untuk logo brand, sumber yang sama persis dengan
 * yang di-import Header dan Footer. Itulah alasan logo JSON-LD lewat sini
 * alih-alih menunjuk satu salinan di `public/`: salinan akan tetap menyajikan
 * logo lama setelah berkas aslinya diganti, dan tak ada yang memberi tahu.
 */
const BRAND_LOGOS = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/images/logo/*.{png,jpg,jpeg,webp,avif}',
  { eager: true }
);

/**
 * Lebar logo yang disajikan ke JSON-LD. Berkas sumbernya 2522px dan 167 KB,
 * ukuran yang masuk akal untuk header retina dan boros untuk sebuah field yang
 * cuma diambil crawler sesekali. Google mensyaratkan minimal 112px, jadi 600px
 * memberi ruang lebih dari cukup.
 */
const LOGO_WIDTH = 600;

/**
 * Selesaikan nilai `organization.logo` menjadi URL absolut untuk node
 * Organization di JSON-LD.
 *
 * Keluarannya webp, berbeda dari `resolveShareImage` di bawah yang memaksa
 * JPEG. Bedanya karena konsumennya beda: gambar share diambil pratinjau tautan
 * WhatsApp dan LinkedIn yang dukungan webp-nya tak bisa diandalkan, sementara
 * `logo` dibaca mesin pencari, dan webp ada di daftar format yang diterima
 * Google untuk field ini. Webp juga membawa alfa, yang dibutuhkan logo ini.
 *
 * PNG sempat dipakai dan dibatalkan, bukan karena hasilnya salah melainkan
 * karena efek sampingnya: cek murah pipeline gambar di
 * `.claude/rules/image-pipeline.md` mensyaratkan NOL berkas PNG di
 * `dist/_astro`, dan satu PNG yang sah di situ membuat cek itu tak bisa lagi
 * membedakan keluaran yang disengaja dari PNG mentah yang benar-benar bocor.
 * Invarian yang masih bisa dibaca sekali lihat lebih berharga daripada lindung
 * nilai format yang sudah tidak relevan.
 */
export async function resolveOrgLogo(value: string, site: URL): Promise<string> {
  const mod = BRAND_LOGOS[value];
  if (!mod) {
    // Path di luar glob diteruskan apa adanya, dan itu bentuk yang benar untuk
    // aset tetap di `public/`. Tapi path yang menunjuk ke dalam `src/` dan tak
    // cocok berarti salah ketik atau berkas sudah pindah; diteruskan begitu saja
    // ia jadi URL 404 di dalam JSON-LD, tempat yang tak pernah dilihat siapa pun.
    if (value.startsWith('/src/')) {
      console.warn(`[seo] logo tak ada di pipeline gambar, URL JSON-LD-nya akan 404: ${value}`);
    }
    return new URL(value, site).href;
  }

  const optimized = await getImage({ src: mod.default, width: LOGO_WIDTH, format: 'webp' });
  return new URL(optimized.src, site).href;
}

/** Lebar baku kartu share Open Graph. Gambar unggahan diciutkan ke ukuran ini. */
const OG_WIDTH = 1200;
/** Tinggi yang diasumsikan untuk gambar non-unggahan (rasio 1.91:1). */
const OG_HEIGHT = 630;

export interface ShareImage {
  /** URL absolut, satu-satunya bentuk yang dibaca crawler Open Graph. */
  url: string;
  width: number;
  height: number;
}

/**
 * Selesaikan nilai gambar share menjadi URL absolut siap pakai di meta tag.
 *
 * Nilai field ini campuran, dan memang disengaja:
 *  - path aset tetap di root (`/og-image.png`),
 *  - route OG image hasil generate saat build (`/open-graph/*.png`), yang berupa
 *    route dan bukan berkas sehingga tak akan pernah cocok dengan glob,
 *  - unggahan editor lewat Keystatic ke `src/assets/share/`.
 * Dua yang pertama diteruskan apa adanya; yang terakhir lewat `astro:assets`
 * supaya foto ponsel dua megabyte tak disajikan mentah ke crawler.
 *
 * Keluarannya dipaksa JPEG, bukan webp bawaan `astro:assets` dan bukan pula
 * format aslinya. Alasannya dua. Pertama, gambar ini tak pernah tampil di
 * halaman, cuma diambil crawler sekali, jadi keunggulan ukuran webp tak berarti
 * apa-apa sementara dukungannya di pratinjau tautan (WhatsApp sebagai kanal
 * berbagi utama situs ini, juga LinkedIn) tidak bisa diandalkan; JPEG diterima
 * semua. Kedua, mempertahankan format sumber justru merugikan: menyandikan
 * ulang foto PNG 1,4 MB pada lebar 1200 menghasilkan PNG 2,0 MB, lebih besar
 * dari berkas mentahnya. Alfa diratakan ke putih karena crawler tetap
 * memipihkan transparansi, biasanya jadi hitam.
 */
export async function resolveShareImage(
  value: string | null | undefined,
  site: URL | undefined
): Promise<ShareImage | undefined> {
  if (!value || !site) return undefined;

  const mod = SHARE_IMAGES[value];
  if (!mod) {
    return { url: new URL(value, site).href, width: OG_WIDTH, height: OG_HEIGHT };
  }

  const optimized = await getImage({
    src: mod.default,
    width: OG_WIDTH,
    format: 'jpeg',
    background: '#ffffff',
  });

  return {
    url: new URL(optimized.src, site).href,
    // Dimensi dibaca dari hasil transformasi, bukan dari modul sumbernya, agar
    // og:image:width/height jujur mengikuti gambar yang benar-benar disajikan.
    width: Number(optimized.attributes.width) || OG_WIDTH,
    height: Number(optimized.attributes.height) || OG_HEIGHT,
  };
}
