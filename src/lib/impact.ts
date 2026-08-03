import type { PintuId } from '../consts';
import type { JejakMetric } from './jejak';

// jejak.ts di-import lazy (dynamic import di dalam fungsi async) supaya
// aggregateMetrics — fungsi murni — bisa diuji unit tanpa menarik `astro:content`
// (yang hanya tersedia dalam runtime Astro, bukan `bun test`).

export interface Impact {
  metrics: { label: string; value: number }[];
  jejakCount: number;
  programCount: number;
}

/**
 * Agregasi metrik lintas jejak: group by label ternormalisasi (trim +
 * lowercase) lalu jumlahkan value. Label asli yang dipertahankan adalah casing
 * pertama yang ditemui, dan urutan hasil mengikuti urutan kemunculan pertama.
 *
 * Fungsi murni — tak menyentuh collection — agar bisa diuji unit.
 */
export function aggregateMetrics(lists: JejakMetric[][]): { label: string; value: number }[] {
  const acc = new Map<string, { label: string; value: number }>();
  for (const list of lists) {
    for (const { label, value } of list) {
      const key = label.trim().toLowerCase();
      const existing = acc.get(key);
      if (existing) {
        existing.value += value;
      } else {
        acc.set(key, { label, value });
      }
    }
  }
  return [...acc.values()];
}

export interface GlobalImpact extends Impact {
  /** Jumlah pintu unik yang sudah punya jejak. */
  pintuCount: number;
}

/**
 * Agregat dampak seluruh situs: sum-by-label lintas SEMUA jejak (semua pintu,
 * semua program). Dasar halaman showcase /jejak.
 */
export async function getGlobalImpact(): Promise<GlobalImpact> {
  const { getJejak } = await import('./jejak');
  const { getPrograms } = await import('./programs');
  const [jejakList, programs] = await Promise.all([getJejak(), getPrograms()]);
  const pintuBySlug = new Map(programs.map((p) => [p.slug, p.pintu]));
  const pintuSet = new Set(
    jejakList.map((j) => pintuBySlug.get(j.program)).filter((p): p is PintuId => Boolean(p))
  );
  return {
    metrics: aggregateMetrics(jejakList.map((j) => j.metrics)),
    jejakCount: jejakList.length,
    programCount: new Set(jejakList.map((j) => j.program)).size,
    pintuCount: pintuSet.size,
  };
}

/** Agregat dampak satu program: sum-by-label + jumlah jejak-nya. */
export async function getProgramImpact(programSlug: string): Promise<Impact> {
  const { getJejakByProgram } = await import('./jejak');
  const jejakList = await getJejakByProgram(programSlug);
  return {
    metrics: aggregateMetrics(jejakList.map((j) => j.metrics)),
    jejakCount: jejakList.length,
    programCount: jejakList.length > 0 ? 1 : 0,
  };
}

/**
 * Agregat dampak satu organisasi: sum-by-label lintas SEMUA jejak yang
 * menyebutnya, apa pun programnya (design.md keputusan #1 — organisasi
 * menempel ke jejak, bukan ke satu program tetap). programCount di sini
 * berarti jumlah program berbeda yang jadi jalur kontribusi organisasi ini,
 * bukan "1 program" seperti di `getProgramImpact`.
 */
export async function getOrganisasiImpact(organisasiSlug: string): Promise<Impact> {
  const { getJejakByOrganisasi } = await import('./jejak');
  const jejakList = await getJejakByOrganisasi(organisasiSlug);
  return {
    metrics: aggregateMetrics(jejakList.map((j) => j.metrics)),
    jejakCount: jejakList.length,
    programCount: new Set(jejakList.map((j) => j.program)).size,
  };
}

/**
 * Agregat dampak satu pintu: sum-by-label lintas semua program di pintu itu.
 * programCount = jumlah program unik yang benar-benar punya jejak di pintu ini.
 */
export async function getPintuImpact(pintuId: PintuId): Promise<Impact> {
  const { getJejakByPintu } = await import('./jejak');
  const jejakList = await getJejakByPintu(pintuId);
  const programs = new Set(jejakList.map((j) => j.program));
  return {
    metrics: aggregateMetrics(jejakList.map((j) => j.metrics)),
    jejakCount: jejakList.length,
    programCount: programs.size,
  };
}
