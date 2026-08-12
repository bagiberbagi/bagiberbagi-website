import type { APIRoute } from 'astro';
import { PINTU, PINTU_LABEL, pintuPath } from '../consts';
import { getPrograms } from '../lib/programs';

/**
 * llms.txt, disusun dari data alih-alih ditulis tangan.
 *
 * Versi manualnya basi persis seperti yang bisa diduga: ia menyebut "Lima Pintu
 * Berbagi" setelah pintu keenam terbit, dan menautkan `/jumat-berkah/` yang
 * sudah 404 sejak halaman program pindah ke `/program/<slug>/`. Selama isinya
 * disalin dengan tangan, taksonomi berikutnya yang berubah akan membuatnya basi
 * lagi tanpa ada yang menyadarinya.
 *
 * Sekarang pintu datang dari `PINTU` di consts.ts, satu-satunya sumber taksonomi
 * (lihat routing-taxonomy.md), dan daftar program datang dari koleksi `programs`.
 * Menambah pintu atau mengaktifkan program otomatis muncul di sini.
 *
 * Yang TETAP ditulis tangan cuma prosa pembuka dan penutup: kalimat itu
 * menjelaskan lembaganya, bukan strukturnya, dan tak ada field mana pun yang
 * bisa menurunkannya.
 *
 * Catatan yang perlu diketahui sebelum menghabiskan waktu di berkas ini:
 * robots.txt terbit memuat blok terkelola Cloudflare yang melarang GPTBot,
 * ClaudeBot, CCBot, Google-Extended, dan meta-externalagent. Sebagian besar
 * pembaca yang dituju berkas ini karena itu tidak bisa mengambilnya. Yang masih
 * bisa: Googlebot, PerplexityBot, dan OAI-SearchBot.
 */
export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error('`site` wajib diisi di astro.config untuk membangun llms.txt.');

  const abs = (path: string) => new URL(path, site).href;
  const programs = await getPrograms();

  // Cuma program yang benar-benar punya halaman. Menyebut program tanpa halaman
  // memberi pembaca nama yang tak bisa ditelusuri ke mana pun.
  const routed = programs.filter((p) => p.href);

  const lines = [
    '# bagiberbagi.id',
    '',
    '> Gerakan dan platform donasi makanan di Indonesia. Menyalurkan paket makanan bergizi dari dapur UMKM lokal ke warga yang membutuhkan, dengan bukti foto & video maksimal H+1.',
    '',
    '## Tentang',
    'bagiberbagi.id (NGO) menghubungkan donatur, relawan, mitra dapur UMKM, komunitas, dan perusahaan (program CSR) untuk berbagi secara transparan dan terdokumentasi. Berawal dari program Jumat Berkah dan Ramadhan Berkah.',
    '',
    // Tanpa menyebut jumlah. Justru angka itulah yang membuat versi manualnya
    // salah ("Lima Pintu Berbagi" setelah pintu keenam terbit), dan daftarnya
    // sendiri sudah memberi tahu pembaca ada berapa.
    `## ${PINTU_LABEL}`,
    ...PINTU.map((p) => `- ${p.label}: ${p.tagline} ${abs(pintuPath(p.slug))}`),
    '',
    '## Program',
    ...routed.map((p) => `- ${p.label}: ${p.summary} ${abs(p.href!)}`),
    '',
    '## Halaman Utama',
    `- Beranda: ${abs('/')}`,
    `- Jejak & Dampak: ${abs('/jejak/')}`,
    `- Organisasi: ${abs('/organisasi/')}`,
    `- Tentang Kami: ${abs('/tentang/')}`,
    `- FAQ: ${abs('/faq/')}`,
    `- Transparansi: ${abs('/transparansi/')}`,
    '',
    '## Kontak',
    'Donasi dan kerja sama diproses via WhatsApp. Media sosial: Instagram & TikTok @bagiberbagiid.',
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
