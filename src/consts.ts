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

export interface MakananProgram {
  label: string;
  desc: string;
  active: boolean;
  href?: string;
}

export const MAKANAN_PROGRAMS: MakananProgram[] = [
  { label: 'Jumat Berkah', desc: 'Berbagi makanan setiap Jumat untuk masyarakat yang membutuhkan.', active: true, href: '/jumat-berkah' },
  { label: 'Ramadhan Berkah', desc: 'Berbagi kebahagiaan Ramadhan melalui makanan dan santunan berkah.', active: false },
  { label: 'Berbagi Makanan Harian', desc: 'Menyalurkan makanan layak setiap hari bagi yang membutuhkan.', active: false },
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

export const NAV_SECTION_IDS = ['program', 'tentang'] as const;

export const NAV_LINKS = [
  { id: 'home', label: 'Home', href: '/#top' },
  { id: 'program', label: 'Program', href: '/#program' },
  { id: 'tentang', label: 'Tentang Kami', href: '/#tentang' },
  { id: 'faq', label: 'FAQ', href: '/faq' },
];

export interface ProgramMenuItem {
  label: string;
  desc: string;
  active: boolean;
  href?: string;
}

export interface ProgramMenuCategory {
  id: string;
  label: string;
  icon: 'food' | 'map' | 'camera' | 'repeat' | 'heart' | 'chef' | 'walk' | 'box';
  items: ProgramMenuItem[];
}

export const PROGRAM_MENU: ProgramMenuCategory[] = [
  {
    id: 'bagiberbagimakanan',
    label: '#bagiberbagimakanan',
    icon: 'food',
    items: [
      { label: 'Jumat Berkah', desc: 'Berbagi paket makanan setiap Jumat bagi masyarakat yang membutuhkan secara langsung.', active: true, href: '/jumat-berkah' },
      { label: 'Ramadhan Berkah', desc: 'Menyalurkan hidangan berbuka, sahur, dan santunan selama bulan Ramadan penuh berkah.', active: false },
      { label: 'Berbagi Makanan Harian', desc: 'Menyediakan makanan bergizi setiap hari bagi masyarakat yang membutuhkan bantuan.', active: false },
    ],
  },
  {
    id: 'bagiberbagibantuan',
    label: '#bagiberbagibantuan',
    icon: 'box',
    items: [
      { label: 'Berbagi Sembako', desc: 'Menyalurkan paket sembako bagi keluarga yang membutuhkan.', active: false },
      { label: 'Berbagi Bantuan Bencana', desc: 'Memberikan bantuan darurat bagi korban bencana terdampak.', active: false },
    ],
  },
  {
    id: 'bagiberbagipendidikan',
    label: '#bagiberbagipendidikan',
    icon: 'walk',
    items: [
      { label: 'Berbagi Beasiswa', desc: 'Membantu pendidikan melalui dukungan biaya belajar.', active: false },
      { label: 'Berbagi Buku & Alat Sekolah', desc: 'Menyalurkan perlengkapan belajar untuk pelajar membutuhkan.', active: false },
    ],
  },
];
