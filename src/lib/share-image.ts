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
