export const WA_NUMBER = '+6282233996648';
export const WA_NUMBER_DISPLAY = '+62 822-3399-6648';

export const SOCIALS = {
  instagram: 'bagiberbagiid',
  tiktok: 'bagiberbagiid',
  email: 'bagiberbagi.official@gmail.com',
};

export const STAT_LABELS = [
  'Total Dana Tersalurkan',
  'Donatur Terdaftar',
  'Orang Telah Berbagi',
  'Area Distribusi',
];

export const STAT_TARGETS = {
  dana: 8.5,
  donatur: 42,
  berbagi: 210,
  area: 5,
};

export interface ProgramOption {
  label: string;
  disabled: boolean;
}

export const PROGRAMS: ProgramOption[] = [
  { label: 'Jumat Berkah', disabled: false },
  { label: 'Paket Makanan Sehat', disabled: true },
  { label: 'Bantuan UMKM Kuliner', disabled: true },
  { label: 'Dukungan Relawan Lapangan', disabled: true },
];

export interface Feature {
  icon: 'food' | 'map' | 'camera' | 'repeat';
  bg: string;
  color: string;
  title: string;
  desc: string;
}

export const FEATURES: Feature[] = [
  { icon: 'food', bg: '#FDEEE1', color: '#F4791D', title: 'Makanan sehat & higienis', desc: 'Menu bergizi lengkap dimasak UMKM kuliner terkurasi dengan standar laik higiene.' },
  { icon: 'map', bg: '#E3EAFB', color: '#1D46B9', title: 'Penerima terdata, bukan tebak-tebakan', desc: 'Titik penyaluran dipetakan dengan seksama, merata, tidak menumpuk di satu tempat.' },
  { icon: 'camera', bg: '#FDEEE1', color: '#F4791D', title: 'Bukti nyata setiap pekan', desc: 'Foto dan video geotagged dari lapangan dikirim ke donatur maksimal H+1 setelah distribusi.' },
  { icon: 'repeat', bg: '#E3EAFB', color: '#1D46B9', title: 'Bisa berlangganan', desc: 'Aktifkan donasi berlangganan yang berjalan otomatis tanpa perlu diingat-ingat.' },
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

export interface Faq {
  q: string;
  a: string;
}

export const FAQS: Faq[] = [
  { q: 'Bagaimana cara memastikan donasi saya benar-benar disalurkan?', a: 'Setiap penyaluran didokumentasikan dengan foto & video geotagged yang dikirim ke donatur maksimal H+1 setelah distribusi.' },
  { q: 'Bisakah saya memilih program atau jumlah pax secara spesifik?', a: 'Bisa. Pilih program yang tersedia dan atur jumlah pax sesuai kebutuhan langsung dari kalkulator donasi di atas.' },
  { q: 'Apakah bisa donasi rutin setiap minggu?', a: 'Bisa, aktifkan donasi berlangganan yang berjalan otomatis tanpa perlu diingat-ingat setiap minggunya.' },
  { q: 'Bagaimana proses pembayarannya?', a: 'Setelah memilih program, Anda akan diarahkan ke tim kami via WhatsApp untuk menyelesaikan detail dan metode pembayaran.' },
];

export interface FooterLink {
  label: string;
  href: string;
  target?: '_self' | '_blank';
}

export interface FooterCol {
  title: string;
  links: FooterLink[];
}

export const FOOTER_COLS: FooterCol[] = [
  { title: 'Program', links: [
    { label: 'Donasi', href: '#donasi' },
    { label: 'CSR Enterprise', href: '#tentang' },
    { label: 'UMKM Partner', href: '#tentang' },
  ] },
  { title: 'Perusahaan', links: [
    { label: 'Tentang Kami', href: '#tentang' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Panduan', href: '#cara-kerja' },
  ] },
  { title: 'Legal & Kontak', links: [
    { label: 'Kebijakan Privasi', href: '#privasi' },
    { label: 'Syarat & Ketentuan', href: '#syarat' },
    { label: 'Kontak', href: `https://wa.me/${WA_NUMBER.replace('+', '')}`, target: '_blank' },
  ] },
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
