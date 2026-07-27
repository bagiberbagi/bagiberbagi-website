import { getCollection } from 'astro:content';
import type { ImageMetadata } from 'astro';
import type { PintuId } from '../consts';
import { createImageResolver } from './assets';
import { getPrograms } from './programs';

export interface JejakMetric {
  label: string;
  value: number;
}

export interface Jejak {
  slug: string;
  title: string;
  program: string;
  date: string;
  location: string;
  summary: string;
  metrics: JejakMetric[];
  /** Sudah berupa modul gambar, siap dipakai <Image>. null = tak ada / berkas hilang. */
  cover: ImageMetadata | null;
  /** Hanya foto yang berkasnya benar-benar ada; entri kosong/hilang dibuang. */
  gallery: ImageMetadata[];
  published: boolean;
  href: string;
}

/**
 * Peta path string -> modul gambar untuk seluruh foto jejak. Pola glob wajib
 * literal, jadi tiap domain konten memanggil globnya sendiri lalu menyerahkan
 * hasilnya ke `createImageResolver` (lihat `lib/assets.ts` untuk alasan foto
 * unggahan tinggal di `src/assets/`, bukan `public/`).
 *
 * Kunci glob ini persis sama dengan `publicPath: '/src/assets/jejak/'` di
 * keystatic.config.ts. Kalau salah satu sisi diubah, ubah keduanya bersamaan.
 */
const JEJAK_IMAGES = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/jejak/*.{png,jpg,jpeg,webp,avif,gif}',
  { eager: true }
);

/**
 * Ubah path dari frontmatter menjadi modul gambar. Mengembalikan null kalau
 * berkasnya tak ada di `src/assets/jejak/`; konsumen sudah punya placeholder
 * ikon pintu untuk kasus itu.
 */
export const resolveJejakImage = createImageResolver('jejak', JEJAK_IMAGES);

/**
 * Satu sumber kebenaran untuk semua jejak — kartu beranda, halaman rekam jejak
 * per pintu, halaman program, route detail, dan agregasi dampak semuanya
 * membaca dari sini. Konsumen tak boleh memanggil getCollection('jejak')
 * langsung.
 *
 * Hanya jejak `published` yang program-nya masih valid (ada di getPrograms())
 * yang lolos: relasi yatim (program terhapus/di-rename) dikeluarkan agar tak
 * menghasilkan halaman atau angka dampak yatim. Terurut tanggal desc.
 */
export async function getJejak(): Promise<Jejak[]> {
  const [entries, programs] = await Promise.all([getCollection('jejak'), getPrograms()]);
  const validSlugs = new Set(programs.map((p) => p.slug));
  return entries
    .filter((e) => e.data.published && validSlugs.has(e.data.program))
    .map((e) => ({
      slug: e.id,
      ...e.data,
      // Path string diselesaikan di sini sekali saja, jadi seluruh konsumen
      // menerima modul gambar yang siap dioptimasi dan tak ada satu pun yang
      // perlu tahu di folder mana fotonya disimpan.
      cover: resolveJejakImage(e.data.cover),
      gallery: e.data.gallery
        .map((g) => resolveJejakImage(g))
        .filter((img): img is ImageMetadata => img !== null),
      href: `/jejak/${e.id}/`,
    }))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/** Jejak dari satu program tertentu. */
export async function getJejakByProgram(programSlug: string): Promise<Jejak[]> {
  return (await getJejak()).filter((j) => j.program === programSlug);
}

/**
 * Jejak yang program-nya bernaung di pintu tertentu. Muat programs sekali,
 * buat map slug→pintu, lalu saring jejak lewatnya (join di memori, dataset
 * kecil saat build).
 */
export async function getJejakByPintu(pintuId: PintuId): Promise<Jejak[]> {
  const programs = await getPrograms();
  const pintuBySlug = new Map(programs.map((p) => [p.slug, p.pintu]));
  return (await getJejak()).filter((j) => pintuBySlug.get(j.program) === pintuId);
}

/** Jejak yang punya halaman detail — dasar route dinamis & OG image. */
export async function getJejakPages(): Promise<Jejak[]> {
  return getJejak();
}
