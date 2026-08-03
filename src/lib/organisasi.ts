import { getCollection } from 'astro:content';

export interface Organisasi {
  slug: string;
  label: string;
  /**
   * Path string dari unggahan Keystatic (`public/uploads/organisasi/...`),
   * disajikan apa adanya sebagai `<img>` — logo kecil, tidak lewat pipeline
   * astro:assets seperti foto kartu program. null = belum diunggah / dikosongkan.
   */
  logo: string | null;
  summary: string;
  detail: { description: string; since: string; instagram?: string; website?: string };
  active: boolean;
  /** Terisi hanya jika organisasi punya halaman detail (aktif + deskripsi terisi). */
  href?: string;
}

/**
 * Satu sumber kebenaran untuk semua organisasi (donor institusional): daftar
 * `/organisasi/`, halaman detail, dan `getJejakByOrganisasi`/`getOrganisasiImpact`
 * semuanya membaca dari sini, meniru pola `getPrograms` di `programs.ts`.
 * Tanpa field `order` (tidak ada di schema); daftar diurutkan alfabet.
 */
export async function getOrganisasi(): Promise<Organisasi[]> {
  const entries = await getCollection('organisasi');
  return entries
    .map((e) => {
      const hasPage = e.data.active && e.data.detail.description.trim() !== '';
      return {
        slug: e.id,
        ...e.data,
        logo: e.data.logo ?? null,
        href: hasPage ? `/organisasi/${e.id}/` : undefined,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label, 'id'));
}

/** Organisasi yang punya halaman detail sendiri — dasar route dinamis & OG image. */
export async function getOrganisasiPages(): Promise<Organisasi[]> {
  return (await getOrganisasi()).filter((o) => o.href);
}
