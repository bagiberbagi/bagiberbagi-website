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
// `src/lib/programs.ts`. Yang tersisa di sini murni presentasional: label &
// ikon tiap kategori mega-menu, yang tidak dikelola editor.
export type IconName = 'food' | 'map' | 'camera' | 'repeat' | 'heart' | 'chef' | 'walk' | 'box';

export type ProgramCategoryId = 'makanan' | 'bantuan' | 'pendidikan';

export interface ProgramCategory {
  id: ProgramCategoryId;
  label: string;
  icon: IconName;
}

export const PROGRAM_CATEGORIES: ProgramCategory[] = [
  { id: 'makanan', label: '#bagiberbagimakanan', icon: 'food' },
  { id: 'bantuan', label: '#bagiberbagibantuan', icon: 'box' },
  { id: 'pendidikan', label: '#bagiberbagipendidikan', icon: 'walk' },
];

// Bentuk data yang dikonsumsi ProgramMenuCategory.astro — dirakit di Header
// dari PROGRAM_CATEGORIES + collection.
export interface ProgramMenuCategoryData {
  label: string;
  icon: IconName;
  items: { label: string; desc: string; active: boolean; href?: string }[];
}
