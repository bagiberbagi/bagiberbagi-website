// `astro:content` di-import lazy (dynamic import di dalam fungsi async) supaya
// mergeKetentuan — fungsi murni — bisa diuji unit tanpa menariknya, sama seperti
// aggregateMetrics di impact.ts.

export interface KetentuanItem {
  title: string;
  body: string;
}

/** Butir hasil gabungan, plus dari mana ia datang. */
export interface MergedKetentuan extends KetentuanItem {
  /**
   * `program` = ditulis di entri program itu, tampil TERBUKA di atas.
   * `shared` = dari singleton `ketentuan`, tampil tertutup di bawahnya.
   */
  scope: 'program' | 'shared';
}

/** Judul dibandingkan longgar: spasi tepi dibuang, huruf disamakan, spasi dalam dirapatkan. */
const normalizeTitle = (title: string) => title.trim().toLowerCase().replace(/\s+/g, ' ');

const isFilled = (item: KetentuanItem) => item.title.trim() !== '' && item.body.trim() !== '';

/**
 * Gabungkan ketentuan bersama dengan ketentuan khas satu program.
 *
 * Aturannya: butir program lebih dulu dalam urutannya sendiri, lalu setiap
 * butir bersama yang judulnya tidak diklaim program itu. Jadi program bisa
 * MENAMBAH (judul baru) maupun MENIMPA (judul yang sama) tanpa perlu field id
 * yang harus ditulis tangan — Keystatic tak bisa menawarkan pilihan atas isi
 * array sebuah singleton, dan id yang salah tulis tidak memberi tanda apa pun.
 * Judul yang mirip-tapi-tidak-sama memang memunculkan dua butir sekaligus, dan
 * itu justru langsung kelihatan di halaman, tidak seperti id yang diam.
 *
 * Butir tanpa judul atau tanpa isi dibuang: Keystatic menyimpan baris array
 * yang ditambah lalu dibiarkan kosong, dan baris itu tak layak jadi accordion
 * kosong. Judul kembar di dalam satu blok: yang pertama menang, mengikuti
 * aturan first-wins yang sudah dipakai dedupePhotos di jejak.ts.
 *
 * Fungsi murni — tak menyentuh collection — agar bisa diuji unit.
 */
export function mergeKetentuan(
  shared: KetentuanItem[],
  program: KetentuanItem[]
): MergedKetentuan[] {
  const own: MergedKetentuan[] = [];
  const claimed = new Set<string>();

  for (const item of program) {
    if (!isFilled(item)) continue;
    const key = normalizeTitle(item.title);
    if (claimed.has(key)) continue;
    claimed.add(key);
    own.push({ ...item, scope: 'program' });
  }

  const rest: MergedKetentuan[] = [];
  const seen = new Set(claimed);
  for (const item of shared) {
    if (!isFilled(item)) continue;
    const key = normalizeTitle(item.title);
    if (seen.has(key)) continue;
    seen.add(key);
    rest.push({ ...item, scope: 'shared' });
  }

  return [...own, ...rest];
}

/**
 * Ketentuan yang tampil di satu halaman program: butir program itu digabung
 * dengan butir bersama. Satu-satunya pembaca singleton `ketentuan`, jadi tak
 * ada komponen yang perlu tahu di mana ketentuan bersama disimpan.
 */
export async function getKetentuan(program: KetentuanItem[]): Promise<MergedKetentuan[]> {
  const { getEntry } = await import('astro:content');
  const entry = await getEntry('ketentuan', 'ketentuan');
  return mergeKetentuan(entry?.data.items ?? [], program);
}
