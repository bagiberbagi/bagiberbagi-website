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

export interface ProgramStageIntro {
  kicker: string;
  title: string;
  lead: string;
  /** Ekor kalimat pil penutup; nama programnya ditambahkan komponen di depannya. */
  statement: string;
}

/**
 * Teks slide pertama "Panggung Bergilir". Slide itu membawa narasi seksinya,
 * bukan narasi satu program, jadi teksnya duduk di singleton `home` alih-alih
 * di entri program mana pun. Semua field boleh kosong: komponen melewatkan
 * baris yang kosong dan slide pertama jatuh ke data programnya sendiri.
 */
export async function getProgramStageIntro(): Promise<ProgramStageIntro> {
  const entry = await getEntry('home', 'home');
  const intro = entry?.data.programStage;
  return {
    kicker: intro?.kicker ?? '',
    title: intro?.title ?? '',
    lead: intro?.lead ?? '',
    statement: intro?.statement ?? '',
  };
}
