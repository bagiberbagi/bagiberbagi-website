export interface Feature {
  icon: 'food' | 'map' | 'camera' | 'repeat' | 'heart';
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

// Pembeda level PLATFORM (kenapa bagiberbagi), bukan fitur satu program. Berlaku
// untuk penyaluran apa pun, jadi tetap relevan saat program selain Jumat Berkah
// aktif. Hindari kata khusus makanan/Jumat di sini.
export const FEATURES: Feature[] = [
  { icon: 'map', bg: BRAND_ORANGE_TINT, color: BRAND_ORANGE, title: 'Tepat sasaran', desc: 'Penerima terdata dan dipetakan bareng komunitas, bukan tebak-tebakan.' },
  { icon: 'camera', bg: BRAND_BLUE_TINT, color: BRAND_BLUE, title: 'Terbukti, bukan janji', desc: 'Foto dan video dari lapangan kembali ke kamu maksimal H+1 tiap penyaluran.' },
  { icon: 'heart', bg: BRAND_ORANGE_TINT, color: BRAND_ORANGE, title: 'Terkurasi dan layak', desc: 'Kami kurasi mitra penyalur dan kelayakannya, jadi bantuan benar-benar tepat sampai.' },
  { icon: 'repeat', bg: BRAND_BLUE_TINT, color: BRAND_BLUE, title: 'Berjalan konsisten', desc: 'Terjadwal dan rutin, bukan kampanye sekali jalan.' },
];

export interface Step {
  n: string;
  title: string;
  desc: string;
}

export const STEPS: Step[] = [
  { n: '01', title: 'Pilih Program', desc: 'Pilih program dan jumlah pax sesuai kebutuhan kamu.' },
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
  { icon: 'heart', title: 'Mustahik', desc: 'Makanan bergizi hadir terjadwal tiap Jumat. Bukan sekadar kenyang, tapi kepastian buat jamaah, petugas kebersihan, dan anak panti.' },
  { icon: 'chef', title: 'UMKM Kuliner', desc: 'Dapur kecil dapat order pasti tiap minggu dengan bayaran tepat waktu. Usaha keluarga terus jalan.' },
  { icon: 'walk', title: 'Agen Lapangan', desc: 'Warga sekitar yang mengantar dapat penghasilan tambahan rutin tiap Jumat. Kerja bermakna di lingkungan sendiri.' },
  { icon: 'box', title: 'Pekerja Pendukung', desc: 'Dokumentasi, kurir, sampai penyedia kemasan lokal ikut bergerak. Lapangan kerja baru dari satu tradisi berbagi.' },
];


// Tanpa link "Home" — logo di navbar yang jadi jalan pulang ke beranda.
//
// Urutannya mengikuti alur kepercayaan donatur: apa yang bisa diberi (pintu) →
// bukti kami menjalankan (jejak & dampak) → siapa kami → sisa keraguan (FAQ).
// "Cara Kerja" sengaja tidak di sini: isinya seksi beranda, dan versi yang
// sebenarnya berguna beda per program (lihat halaman program). Jalan masuknya
// tetap ada lewat tautan sekunder di Hero.
export const NAV_LINKS = [
  // href entri ini cuma fallback: Header merender `program` sebagai tombol
  // mega-menu, bukan tautan, jadi nilainya tak pernah jadi tujuan klik.
  { id: 'program', label: 'Pintu Berbagi', href: '/#pintu' },
  // "Jejak & Dampak" menuju showcase global /jejak/ (angka dampak agregat +
  // feed kegiatan + galeri). Dulu sementara ke home #dampak sebelum showcase ada.
  { id: 'dampak', label: 'Jejak & Dampak', href: '/jejak/' },
  { id: 'tentang', label: 'Tentang Kami', href: '/tentang/' },
  { id: 'faq', label: 'FAQ', href: '/faq/' },
];

// Data program kini tinggal di collection `programs` (Keystatic) — lihat
// `src/lib/programs.ts`. Yang tersisa di sini murni presentasional: label,
// ikon, & warna tiap pintu, yang tidak dikelola editor.
export type IconName =
  | 'food' | 'map' | 'camera' | 'repeat' | 'heart' | 'chef' | 'walk' | 'box'
  | 'time' | 'space' | 'money' | 'impact';

// Lima "Pintu Berbagi" — jalan masuk berkontribusi sumber daya. Sebuah program
// menempel pada satu pintu lewat field `pintu`-nya (lihat programs.ts).
// (Dampak/impact BUKAN pintu — ia lapisan hasil, tampil lewat ImpactSection.)
//
// Satu-satunya sumber daftar pintu. Semua tempat lain menurunkan darinya:
// `PintuId` (tipe), enum zod di content.config.ts, dan opsi select Keystatic.
// Tambah/hapus pintu cukup di sini + entri PINTU di bawah — jangan tulis ulang
// daftar id di tempat lain.
export const PINTU_IDS = ['food', 'goods', 'time', 'space', 'money'] as const;
export type PintuId = (typeof PINTU_IDS)[number];

export interface Pintu {
  id: PintuId;
  // Slug URL berbahasa Indonesia untuk rute /berbagi/[slug] (id internal tetap
  // Inggris karena dipakai taksonomi program). Jaga URL konsisten satu bahasa.
  slug: string;
  label: string;
  english: string;
  icon: IconName;
  // tagline = kalimat hero /berbagi/[slug] + teks mega-menu (ringkas, enak dibaca).
  // blurb = versi ketat khusus kartu homepage "Arah Kami" (padat, sejajar).
  // seoDescription = meta description /berbagi/[slug] (>=70 char, padat kata kunci).
  tagline: string;
  blurb: string;
  seoDescription: string;
  // Warna identitas pintu (aksen, bukan full-page). Dipakai halaman /berbagi/[slug]
  // via CSS var --cat. color=aksen, tint=latar lembut, deep=hover/tekan.
  color: string;
  colorTint: string;
  colorDeep: string;
}

export const PINTU: Pintu[] = [
  { id: 'food', slug: 'makanan', label: 'Berbagi Makanan', english: 'Food Sharing', icon: 'food', tagline: 'Makanan bergizi dari mitra kami sampai ke tangan yang membutuhkan.', blurb: 'Makanan bergizi ke yang membutuhkan.', seoDescription: 'Donasi makanan bergizi lewat bagiberbagi.id: dari dapur UMKM lokal ke keluarga prasejahtera dan warga yang membutuhkan, dengan bukti foto & video maksimal H+1.', color: '#F4791D', colorTint: '#FDEEE1', colorDeep: '#C25D0F' },
  { id: 'goods', slug: 'barang', label: 'Berbagi Barang', english: 'Goods Sharing', icon: 'box', tagline: 'Pakaian, buku, dan perlengkapan layak pakai berpindah ke yang memerlukan.', blurb: 'Barang layak pakai berpindah tangan.', seoDescription: 'Berbagi barang lewat bagiberbagi.id: pakaian, buku, dan perlengkapan layak pakai disalurkan ke warga serta komunitas yang membutuhkan secara transparan dan terdokumentasi.', color: '#7C4DDA', colorTint: '#ECE6FB', colorDeep: '#5E33B0' },
  { id: 'time', slug: 'waktu', label: 'Berbagi Waktu', english: 'Time Sharing', icon: 'time', tagline: 'Relawan membagikan keahlian, dari mengajar sampai konsultasi.', blurb: 'Relawan berbagi keahlian & tenaga.', seoDescription: 'Berbagi waktu bersama bagiberbagi.id: relawan membagikan keahlian dan tenaga — mengajar, konsultasi, hingga pendampingan — untuk kegiatan sosial di berbagai kota.', color: '#E0447B', colorTint: '#FBE4EE', colorDeep: '#B22C5C' },
  { id: 'space', slug: 'ruang', label: 'Berbagi Ruang', english: 'Space Sharing', icon: 'space', tagline: 'Ruang pertemuan, aula, gudang, dan kendaraan untuk kegiatan sosial.', blurb: 'Ruang & kendaraan untuk kegiatan sosial.', seoDescription: 'Berbagi ruang lewat bagiberbagi.id: aula, gudang, ruang pertemuan, dan kendaraan tersedia untuk mendukung kegiatan sosial serta penyaluran bantuan di komunitas.', color: '#0EA5C4', colorTint: '#DBF2F8', colorDeep: '#0B7E97' },
  { id: 'money', slug: 'dana', label: 'Berbagi Dana', english: 'Money Sharing', icon: 'money', tagline: 'Zakat, CSR, dan donasi kami salurkan tepat sasaran.', blurb: 'Zakat, CSR, donasi tepat sasaran.', seoDescription: 'Berbagi dana bersama bagiberbagi.id: zakat, sedekah, CSR, dan donasi disalurkan tepat sasaran secara transparan untuk program bantuan makanan dan sosial di Indonesia.', color: '#16A34A', colorTint: '#DCF3E4', colorDeep: '#10803A' },
];

// Label yang ditampilkan ke pengunjung untuk keseluruhan pintu.
export const PINTU_LABEL = 'Pintu Berbagi';

// Konten konseptual halaman /berbagi/[slug] — untuk sekarang statis di sini
// (kandidat pindah ke Keystatic nanti). Tiap blok opsional: yang kosong tidak
// dirender, jadi pintu tanpa konten tampil lean tapi tetap rapi. v1 baru
// Makanan yang diisi penuh.
export interface CategoryStat { value: string; label: string }
export interface CategoryStep { title: string; desc: string }
export interface CategoryFaqItem { q: string; a: string }
export interface CategoryContent {
  stats?: CategoryStat[];
  contribute?: CategoryStep[];
  howItWorks?: CategoryStep[];
  forWhom?: string[];
  env?: { headline: string; stats: CategoryStat[] };
  faq?: CategoryFaqItem[];
  ctaTitle?: string;
  ctaText?: string;
}

export const CATEGORY_CONTENT: Partial<Record<PintuId, CategoryContent>> = {
  food: {
    stats: [
      { value: '12.400', label: 'porsi tersalurkan' },
      { value: '38', label: 'titik penyaluran' },
      { value: '1.900', label: 'penerima manfaat' },
      { value: '52', label: 'pekan berjalan' },
    ],
    contribute: [
      { title: 'Donasi paket', desc: 'Donasi program aktif — kami salurkan dan kirim laporannya.' },
      { title: 'Salurkan surplus', desc: 'Punya surplus makanan layak? Kami jemput dan salurkan tepat sasaran.' },
      { title: 'Jadi mitra dapur', desc: 'UMKM kuliner bergabung memasak untuk penyaluran mingguan.' },
    ],
    howItWorks: [
      { title: 'Order / Jemput', desc: 'Donasi masuk atau surplus dijemput.' },
      { title: 'Kurasi Higiene', desc: 'Mitra dapur menyiapkan standar laik.' },
      { title: 'Penyaluran', desc: 'Diantar ke titik penerima terdata.' },
      { title: 'Laporan H+1', desc: 'Foto & video dikirim ke donatur.' },
    ],
    forWhom: ['Panti asuhan', 'Fakir miskin', 'Petugas kebersihan', 'Komunitas prasejahtera', 'Warga terdampak'],
    env: {
      headline: 'Makanan berlebih terselamatkan, bukan jadi sampah.',
      stats: [
        { value: '8,2 t', label: 'makanan terselamatkan' },
        { value: '3,1 t', label: 'emisi CO₂ dihindari' },
      ],
    },
    faq: [
      { q: 'Bagaimana kebersihan & kelayakan makanan dijamin?', a: 'Makanan dimasak mitra dapur terkurasi dengan standar laik higiene, dicek sebelum penyaluran, dan tak pernah menyimpan yang basi atau kedaluwarsa.' },
      { q: 'Ke mana saja makanan disalurkan?', a: 'Ke titik penerima yang sudah terdata dan dipetakan — panti, warga prasejahtera, hingga petugas kebersihan — merata, tidak menumpuk di satu tempat.' },
      { q: 'Bisakah saya berdonasi rutin setiap pekan?', a: 'Bisa. Hubungi kami via WhatsApp, tim membantu mengatur donasi rutin dan jumlah pax sesuai kebutuhan kamu.' },
    ],
    ctaTitle: 'Punya surplus makanan atau ingin jadi mitra penyalur?',
    ctaText: 'Tim kami bantu salurkan ke titik yang tepat. Donasi per program ada di halaman masing-masing.',
  },
};

// Bentuk data yang dikonsumsi ProgramMenuCategory.astro — dirakit di Header
// dari PINTU + collection.
export interface ProgramMenuCategoryData {
  label: string;
  icon: IconName;
  href: string;
  // Warna identitas pintu — dipakai mega-menu (ikon + aksen hover) via --cat.
  color: string;
  colorTint: string;
  tagline: string;
  items: { label: string; desc: string; active: boolean; href?: string }[];
}
