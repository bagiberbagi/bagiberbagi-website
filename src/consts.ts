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
  { icon: 'repeat', bg: BRAND_BLUE_TINT, color: BRAND_BLUE, title: 'Bisa berlangganan', desc: 'Aktifkan donasi berlangganan yang berjalan otomatis tanpa perlu diingat-ingat.' },
];

export interface Step {
  n: string;
  title: string;
  desc: string;
}

export const STEPS: Step[] = [
  { n: '01', title: 'Pilih Program', desc: 'Pilih jumlah pax, sekali jalan atau langganan mingguan.' },
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

export const NAV_SECTION_IDS = ['cara-kerja', 'program', 'faq', 'tentang'] as const;

export const NAV_LINKS = [
  { id: 'cara-kerja', label: 'Cara Kerja' },
  { id: 'program', label: 'Program' },
  { id: 'faq', label: 'FAQ' },
  { id: 'tentang', label: 'Tentang Kami' },
];
