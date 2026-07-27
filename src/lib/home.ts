import { getEntry } from 'astro:content';
import { getPrograms, type Program } from './programs';

export interface ProgramSection {
  eyebrow: string;
  title: string;
  /** Program yang disorot, sudah seurutan daftar di Keystatic. */
  programs: Program[];
}

/**
 * Bagian "Program Aktif" di beranda. Penempatan (mana yang disorot + urutannya)
 * datang dari singleton `home`, isinya tetap dari koleksi `programs` — jadi tak
 * ada data program yang terduplikasi ke setelan beranda.
 *
 * Daftar di `home` menyimpan slug, bukan program itu sendiri, jadi rujukannya
 * bisa basi: program dihapus atau slug-nya berganti nama meninggalkan slug yang
 * tak menunjuk apa-apa, dan Keystatic tidak memperingatkan. Slug kosong/basi
 * dibuang di sini, duplikat dibuang juga, supaya beranda tetap tampil wajar.
 */
export async function getProgramSection(): Promise<ProgramSection> {
  const entry = await getEntry('home', 'home');
  const section = entry?.data.programSection;
  const bySlug = new Map((await getPrograms()).map((p) => [p.slug, p]));

  const seen = new Set<string>();
  const programs = (section?.items ?? []).flatMap((slug) => {
    if (!slug || seen.has(slug)) return [];
    seen.add(slug);
    const program = bySlug.get(slug);
    return program ? [program] : [];
  });

  return {
    eyebrow: section?.eyebrow ?? 'PROGRAM AKTIF',
    title: section?.title ?? '',
    programs,
  };
}
