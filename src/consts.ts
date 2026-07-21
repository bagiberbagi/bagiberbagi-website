export interface Feature {
  icon: 'food' | 'map' | 'camera' | 'repeat';
  bg: string;
  color: string;
  title: string;
  desc: string;
}

// Mirror tailwind.config.mjs brand tokens — Icon's `color`/`bg` are literal SVG/style
// values (not Tailwind classes), so they can't reference the theme directly.
const BRAND_ORANGE = '#F4791D';
const BRAND_ORANGE_TINT = '#FDEEE1';
const BRAND_BLUE = '#1D46B9';
const BRAND_BLUE_TINT = '#E3EAFB';

export const FEATURES: Feature[] = [
  { icon: 'food', bg: BRAND_ORANGE_TINT, color: BRAND_ORANGE, title: 'Makanan sehat & higienis', desc: 'Menu bergizi lengkap dimasak UMKM kuliner terkurasi dengan standar laik higiene.' },
  { icon: 'map', bg: BRAND_BLUE_TINT, color: BRAND_BLUE, title: 'Penerima terdata, bukan tebak-tebakan', desc: 'Titik penyaluran dipetakan dengan seksama, merata, tidak menumpuk di satu tempat.' },
  { icon: 'camera', bg: BRAND_ORANGE_TINT, color: BRAND_ORANGE, title: 'Bukti nyata setiap pekan', desc: 'Foto dan video geotagged dari lapangan dikirim ke donatur maksimal H+1 setelah distribusi.' },
  { icon: 'repeat', bg: BRAND_BLUE_TINT, color: BRAND_BLUE, title: 'Mudah diulang kapan saja', desc: 'Donasi rutin lewat WhatsApp, tim kami bantu proses dan atur jumlah pax sesuai kebutuhan Anda.' },
];

export interface Step {
  n: string;
  title: string;
  desc: string;
}

export const STEPS: Step[] = [
  { n: '01', title: 'Pilih Program', desc: 'Pilih program dan jumlah pax sesuai kebutuhan Anda.' },
  { n: '02', title: 'Lakukan Pembayaran', desc: 'Lakukan pembayaran dengan aman melalui mekanisme pada platform.' },
  { n: '03', title: 'Mitra Menjalankan', desc: 'Order diteruskan ke UMKM partner dengan standar higienitas.' },
  { n: '04', title: 'Penyaluran', desc: 'Panti asuhan, petugas kebersihan dan fakir miskin sesuai pemetaan.' },
  { n: '05', title: 'Laporan Transparan', desc: 'Foto & video penyaluran dikirim maksimal H+1.' },
];

export interface Impact {
  icon: 'heart' | 'chef' | 'walk' | 'box';
  title: string;
  desc: string;
}

export const IMPACTS: Impact[] = [
  { icon: 'heart', title: 'Penerima Manfaat', desc: 'Makanan sehat bergizi hadir terjadwal — kepastian dan martabat bagi yang membutuhkan.' },
  { icon: 'chef', title: 'UMKM Kuliner', desc: 'Dapur kecil mendapat order pasti mingguan, omzet yang membantu usaha keluarga.' },
  { icon: 'walk', title: 'Relawan Lapangan', desc: 'Warga memperoleh penghasilan rutin dalam setiap proses penyaluran lingkungannya sendiri.' },
  { icon: 'box', title: 'Pekerja Pendukung', desc: 'Dokumentasi & kurir ikut bergerak. Lapangan kerja baru lahir dari satu tradisi.' },
];

export const ACTIVITIES = [
  'Transparan di setiap penyaluran',
  'Didukung UMKM lokal terkurasi',
  'Bukti foto & video maksimal H+1',
];

export const NAV_LINKS = [
  { id: 'home', label: 'Home', href: '/#top' },
  { id: 'program', label: 'Program', href: '/#program' },
  { id: 'tentang', label: 'Tentang Kami', href: '/tentang/' },
  { id: 'faq', label: 'FAQ', href: '/faq/' },
];

// Data program kini tinggal di collection `programs` (Keystatic) — lihat
// `src/lib/programs.ts`. Yang tersisa di sini murni presentasional: label,
// ikon, & status tiap pilar, yang tidak dikelola editor.
export type IconName =
  | 'food' | 'map' | 'camera' | 'repeat' | 'heart' | 'chef' | 'walk' | 'box'
  | 'time' | 'space' | 'money' | 'impact';

// Enam pilar "berbagi sumber daya" — kerangka besar situs, sumber daya yang
// kami pegang dan salurkan. Sebuah program menempel pada satu pilar lewat
// field `pillar`-nya (lihat programs.ts).
export type PillarId = 'food' | 'goods' | 'time' | 'space' | 'money' | 'impact';

export interface Pillar {
  id: PillarId;
  label: string;
  english: string;
  icon: IconName;
  tagline: string;
}

export const PILLARS: Pillar[] = [
  { id: 'food', label: 'Berbagi Makanan', english: 'Food Sharing', icon: 'food', tagline: 'Makanan bergizi dari mitra kami sampai ke tangan yang membutuhkan.' },
  { id: 'goods', label: 'Berbagi Barang', english: 'Goods Sharing', icon: 'box', tagline: 'Pakaian, buku, dan perlengkapan layak pakai berpindah ke yang memerlukan.' },
  { id: 'time', label: 'Berbagi Waktu', english: 'Time Sharing', icon: 'time', tagline: 'Relawan membagikan keahlian, dari mengajar sampai konsultasi.' },
  { id: 'space', label: 'Berbagi Ruang', english: 'Space Sharing', icon: 'space', tagline: 'Ruang pertemuan, aula, gudang, dan kendaraan untuk kegiatan sosial.' },
  { id: 'money', label: 'Berbagi Dana', english: 'Money Sharing', icon: 'money', tagline: 'Zakat, CSR, dan donasi kami salurkan tepat sasaran.' },
  { id: 'impact', label: 'Dampak Terukur', english: 'Impact Sharing', icon: 'impact', tagline: 'Setiap kontribusi terukur, dari porsi tersalurkan sampai keluarga terbantu.' },
];

// Kategori program yang tampil di mega-menu. Impact dikecualikan — ia lapisan
// hasil/ukuran, bukan channel resource yang menampung program. Secara teknis
// disebut "kategori program"; label yang ditampilkan ke pengunjung di bawah.
export const PROGRAM_CATEGORIES = PILLARS.filter((p) => p.id !== 'impact');
export const PROGRAM_CATEGORIES_LABEL = 'Pintu Berbagi';

// Bentuk data yang dikonsumsi ProgramMenuCategory.astro — dirakit di Header
// dari PILLARS (yang punya program) + collection.
export interface ProgramMenuCategoryData {
  label: string;
  icon: IconName;
  // Tujuan klik kategori. Sementara ke #program (halaman kategori khusus belum ada).
  href: string;
  tagline: string;
  items: { label: string; desc: string; active: boolean; href?: string }[];
}
