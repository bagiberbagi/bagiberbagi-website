import { getCollection } from 'astro:content';
import type { PillarId } from '../consts';

export interface Program {
  slug: string;
  label: string;
  pillar: PillarId;
  order: number;
  active: boolean;
  summary: string;
  detail: { eyebrow: string; description: string; features: string[] };
  /** Terisi hanya jika program punya halaman detail (aktif + deskripsi terisi). */
  href?: string;
}

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
      return { slug: e.id, ...e.data, href: hasPage ? `/${e.id}/` : undefined };
    })
    .sort((a, b) => a.order - b.order);
}

export async function getProgramsByPillar(pillar: PillarId): Promise<Program[]> {
  return (await getPrograms()).filter((p) => p.pillar === pillar);
}

/** Program yang punya halaman detail sendiri — dasar route dinamis & OG image. */
export async function getProgramPages(): Promise<Program[]> {
  return (await getPrograms()).filter((p) => p.href);
}
