import { getCollection } from 'astro:content';
import type { PintuId } from '../consts';
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
  cover: string | null;
  gallery: (string | null)[];
  published: boolean;
  href: string;
}

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
      cover: e.data.cover ?? null,
      gallery: e.data.gallery.map((g) => g ?? null),
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
