import { getCollection } from 'astro:content';
import type { ImageMetadata } from 'astro';
import type { PintuId } from '../consts';
import { createImageResolver } from './assets';

export interface Program {
  slug: string;
  label: string;
  pintu: PintuId;
  order: number;
  active: boolean;
  /**
   * Foto kartu sorotan hasil unggahan Keystatic, sudah berupa modul gambar dan
   * siap dipakai `<Image>`. null = belum diunggah / berkasnya hilang, konsumen
   * memakai foto bawaan.
   */
  image: ImageMetadata | null;
  summary: string;
  detail: { eyebrow: string; description: string; features: string[] };
  /** Terisi hanya jika program punya halaman detail (aktif + deskripsi terisi). */
  href?: string;
}

/**
 * Peta path string -> modul gambar untuk seluruh foto kartu program. Kunci glob
 * ini persis sama dengan `publicPath: '/src/assets/programs/'` di
 * keystatic.config.ts. Kalau salah satu sisi diubah, ubah keduanya bersamaan.
 * Alasan foto unggahan tinggal di `src/assets/` ada di `lib/assets.ts`.
 */
const PROGRAM_IMAGES = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/programs/*.{png,jpg,jpeg,webp,avif,gif}',
  { eager: true }
);

/**
 * Ubah path dari entri program menjadi modul gambar. Mengembalikan null kalau
 * berkasnya tak ada; kartu beranda sudah punya foto bawaan untuk kasus itu.
 */
export const resolveProgramImage = createImageResolver('program', PROGRAM_IMAGES);

/**
 * Satu sumber kebenaran untuk semua program: kalkulator, kartu beranda,
 * mega-menu, halaman detail, dan OG image semuanya membaca dari sini —
 * bukan lagi dari array terpisah di `consts.ts`.
 */
export async function getPrograms(): Promise<Program[]> {
  const entries = await getCollection('programs');
  return entries
    .map((e) => {
      const hasPage = e.data.active && e.data.detail.description.trim() !== '';
      return {
        slug: e.id,
        ...e.data,
        // Path string diselesaikan di sini sekali saja, jadi seluruh konsumen
        // menerima modul gambar yang siap dioptimasi dan tak ada satu pun yang
        // perlu tahu di folder mana fotonya disimpan.
        image: resolveProgramImage(e.data.image),
        href: hasPage ? `/program/${e.id}/` : undefined,
      };
    })
    .sort((a, b) => a.order - b.order);
}

export async function getProgramsByPintu(pintu: PintuId): Promise<Program[]> {
  return (await getPrograms()).filter((p) => p.pintu === pintu);
}

/** Program yang punya halaman detail sendiri — dasar route dinamis & OG image. */
export async function getProgramPages(): Promise<Program[]> {
  return (await getPrograms()).filter((p) => p.href);
}
