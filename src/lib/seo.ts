/**
 * Resolusi nilai SEO per halaman dari singleton `seo` di Keystatic.
 *
 * Dipakai dua tempat yang harus selalu sepakat: BaseLayout (meta tag +
 * JSON-LD) dan route generator OG image. Sebelumnya keduanya menyimpan
 * judul/deskripsi sendiri-sendiri dan harus disamakan manual.
 */

/**
 * Slug node Organization situs, dipakai bareng setiap konsumen yang perlu
 * merujuknya lewat `@id`: BaseLayout yang membangun node-nya, dan halaman
 * yang merujuknya (mis. `author`/`publisher` pada Article di jejak detail).
 * Ditaruh satu konstanta supaya slug-nya tak bisa berbeda di antara dua
 * pemanggil itu.
 */
export const ORG_SLUG = 'bagiberbagi';

export interface SeoPageEntry {
  path: string;
  title: string;
  description: string;
  image?: string | null;
  breadcrumbName?: string;
  noindex: boolean;
}

export interface SeoSettings {
  siteName: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultImage: string;
  pages: SeoPageEntry[];
}

/** Samakan bentuk path supaya `/faq`, `/faq/`, dan `faq` cocok satu sama lain. */
function normalizePath(path: string): string {
  const withLeading = path.startsWith('/') ? path : `/${path}`;
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
}

/** Entri SEO untuk sebuah pathname, atau undefined kalau halaman belum didaftarkan. */
export function findPageSeo(seo: SeoSettings, pathname: string): SeoPageEntry | undefined {
  const target = normalizePath(pathname);
  return seo.pages.find((page) => normalizePath(page.path) === target);
}

/**
 * Kunci route OG image untuk sebuah path. `/` jadi `home` supaya cocok dengan
 * nama file yang sudah dipakai (`/open-graph/home.png`).
 */
export function ogKeyFromPath(path: string): string {
  const slug = normalizePath(path).replace(/^\/|\/$/g, '');
  return slug === '' ? 'home' : slug;
}
