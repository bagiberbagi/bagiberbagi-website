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
  | 'time' | 'space' | 'money' | 'tree' | 'impact' | 'book' | 'shield';

// "Pintu Berbagi" — sumbunya PERUNTUKAN: apa yang berubah bagi penerima, bukan
// apa yang diserahkan pemberi. Bentuk sumbangan (makanan, barang, waktu, ruang,
// dana) hidup di koleksi `aksi` beserta mekanismenya, bukan di sini.
//
// Sebuah program boleh menempel pada BEBERAPA pintu (`pintu`), dengan satu
// `pintuUtama` yang memikul kartu, remah roti, dan seluruh angkanya — lihat
// programs.ts. Metrik disaring lewat pintuUtama saja; kalau lewat keanggotaan,
// satu jejak 500 porsi terhitung sekali di tiap pintu yang diklaim programnya.
//
// Id INGGRIS, slug Indonesia (aturan di interface Pintu di bawah). `food`
// sengaja dipertahankan dari taksonomi lama: dalam Inggris ia mencakup
// ketahanan pangan, dan mempertahankannya membuat pintu tersibuk berpindah
// tanpa menyentuh satu berkas konten pun.
//
// Satu-satunya sumber daftar pintu. Semua tempat lain menurunkan darinya:
// `PintuId` (tipe), enum zod di content.config.ts, dan opsi select Keystatic.
// Tambah/hapus pintu cukup di sini + entri PINTU di bawah — jangan tulis ulang
// daftar id di tempat lain.
export const PINTU_IDS = [
  'food',
  'education',
  'health',
  'empowerment',
  'humanitarian',
  'environment',
] as const;
export type PintuId = (typeof PINTU_IDS)[number];

export interface Pintu {
  id: PintuId;
  // Slug URL berbahasa Indonesia untuk rute /peduli/[slug] (id internal tetap
  // Inggris karena dipakai taksonomi program). Jaga URL konsisten satu bahasa.
  slug: string;
  label: string;
  english: string;
  icon: IconName;
  // tagline = kalimat hero /peduli/[slug] + teks mega-menu (ringkas, enak dibaca).
  // blurb = versi ketat khusus kartu homepage "Arah Kami" (padat, sejajar).
  // seoDescription = meta description /peduli/[slug] (70-160 char, padat kata
  // kunci). Batas atas 160 mengikuti titik potong Google; lebih dari itu ekor
  // kalimatnya tak pernah tampil. Sama dengan batas field SEO di Keystatic.
  tagline: string;
  blurb: string;
  seoDescription: string;
  // Warna identitas pintu (aksen, bukan full-page). Dipakai halaman /peduli/[slug]
  // via CSS var --cat. color=aksen, tint=latar lembut, deep=hover/tekan.
  color: string;
  colorTint: string;
  colorDeep: string;
}

// Label = kata benda telanjang. Payungnya (PINTU_LABEL) yang memikul kata
// "berbagi", jadi remah rotinya berbunyi "Pintu Berbagi › Pangan › Jumat
// Berkah" tanpa mengulang kata yang sama tiga tingkat.
//
// Warna: keenam trio diwarisi utuh dari taksonomi lama, tak ada yang baru
// dibuat. Pemasangannya mengikuti makna yang sudah melekat — biru untuk
// pendidikan, teal untuk kesehatan, ungu untuk usaha.
export const PINTU: Pintu[] = [
  { id: 'food', slug: 'pangan', label: 'Pangan', english: 'Food Security', icon: 'food', tagline: 'Makanan bergizi dari dapur warga sampai ke meja yang menantinya, setiap pekan.', blurb: 'Makanan bergizi, rutin dan terdokumentasi.', seoDescription: 'Bantuan pangan lewat bagiberbagi.id: paket makanan bergizi dan sembako dari dapur UMKM lokal untuk keluarga prasejahtera, dengan bukti penyaluran H+1.', color: '#C4701C', colorTint: '#FDEEE1', colorDeep: '#A05C17' },
  { id: 'education', slug: 'pendidikan', label: 'Pendidikan', english: 'Education', icon: 'book', tagline: 'Biaya, buku, dan perlengkapan supaya tidak ada anak yang berhenti belajar.', blurb: 'Biaya dan perlengkapan agar belajar tak putus.', seoDescription: 'Donasi pendidikan lewat bagiberbagi.id: beasiswa, buku, dan perlengkapan sekolah untuk pelajar yang terancam berhenti karena biaya.', color: '#1478D0', colorTint: '#DBF2F8', colorDeep: '#126DBD' },
  { id: 'health', slug: 'kesehatan', label: 'Kesehatan', english: 'Health', icon: 'heart', tagline: 'Pemeriksaan, pengobatan, dan alat kesehatan bagi yang selama ini menundanya.', blurb: 'Layanan dan alat kesehatan yang terjangkau.', seoDescription: 'Donasi kesehatan lewat bagiberbagi.id: pemeriksaan, biaya pengobatan, dan alat kesehatan untuk warga yang menunda berobat karena keterbatasan biaya.', color: '#12A472', colorTint: '#DCF3E4', colorDeep: '#0D7B55' },
  { id: 'empowerment', slug: 'pemberdayaan', label: 'Pemberdayaan', english: 'Economic Empowerment', icon: 'money', tagline: 'Dapur dan usaha kecil warga tumbuh lewat order yang pasti dan alat yang memadai.', blurb: 'Usaha kecil warga tumbuh dan mandiri.', seoDescription: 'Pemberdayaan ekonomi & UMKM bersama bagiberbagi.id: order rutin untuk dapur warga, modal dan peralatan usaha, serta pelatihan agar penghasilan berlanjut.', color: '#7C4DDA', colorTint: '#ECE6FB', colorDeep: '#5E33B0' },
  { id: 'humanitarian', slug: 'kemanusiaan', label: 'Kemanusiaan', english: 'Humanitarian & Disaster', icon: 'shield', tagline: 'Bantuan yang datang cepat saat bencana, dan tetap tinggal saat pemulihan.', blurb: 'Respons cepat saat darurat dan pemulihan.', seoDescription: 'Bantuan kemanusiaan & bencana lewat bagiberbagi.id: respons cepat kebutuhan dasar saat gempa, banjir, dan kebakaran, hingga pemulihan keluarga terdampak.', color: '#DF2AA3', colorTint: '#FBE4EE', colorDeep: '#C11D8A' },
  // Hijau daun, bukan hijau emerald: Kesehatan memakai #12A472 (condong teal), dan
  // dua hijau dengan rona berdekatan terbaca sebagai satu pintu yang sama di peta
  // beranda. Pasangan ini diwarisi apa adanya dari Dana/Pohon, yang sudah disetel
  // untuk persoalan yang sama persis.
  { id: 'environment', slug: 'lingkungan', label: 'Lingkungan', english: 'Environment', icon: 'tree', tagline: 'Pohon yang meneduhkan, sungai yang bersih, dan sampah yang kembali berguna.', blurb: 'Lingkungan yang lebih sehat dan tahan lama.', seoDescription: 'Peduli lingkungan bersama bagiberbagi.id: penghijauan, bersih sungai, dan pengelolaan sampah komunitas untuk kota yang lebih teduh dan berkelanjutan.', color: '#4C9C2E', colorTint: '#EDF4DB', colorDeep: '#3D7C25' },
];

// Label yang ditampilkan ke pengunjung untuk keseluruhan pintu.
export const PINTU_LABEL = 'Pintu Berbagi';

/**
 * Satu-satunya tempat bentuk URL halaman pintu ditulis.
 *
 * Sebelum ini sembilan berkas masing-masing merakit `/berbagi-${slug}/`
 * sendiri, jadi memindahkan rutenya berarti menyunting sembilan tempat dan
 * berharap tak ada yang terlewat. Sekarang pemindahan berikutnya cukup di sini.
 *
 * Kata "peduli" di jalur sengaja TIDAK sama dengan label di antarmuka, yang
 * berbunyi "Pintu Berbagi". Itu keputusan sadar, bukan kelalaian: tak ada satu
 * awalan Indonesia pun yang enak dibaca untuk keenam peruntukan sekaligus
 * ("donasi lingkungan" janggal, "peduli pangan" kaku), jadi frasa yang paling
 * dicari dipindahkan ke title/h1 tiap halaman dan jalurnya dibiarkan netral.
 * Jangan "rapikan" ini jadi seragam tanpa membaca routing-taxonomy.md dulu.
 */
export const pintuPath = (slug: string) => `/peduli/${slug}/`;

// Konten konseptual halaman /peduli/[slug] — untuk sekarang statis di sini
// (kandidat pindah ke Keystatic nanti). Tiap blok opsional: yang kosong tidak
// dirender, jadi pintu tanpa konten tampil lean tapi tetap rapi. Yang terisi
// penuh baru Pangan; Lingkungan mewarisi cerita dari bekas pintu Pohon.
export interface CategoryStat { value: string; label: string }
export interface CategoryStep { title: string; desc: string }
export interface CategoryFaqItem { q: string; a: string }
export interface CategoryStory { headline: string; paragraphs: string[]; closing?: string }
export interface CategoryContent {
  // Cerita pembuka pintu, dirender tepat di bawah hero. Isinya alasan pintu ini
  // ada, bukan cara ikut: yang terakhir itu urusan program. `closing` dipisah
  // karena kalimat penutupnya dipakai sebagai kutipan, bukan paragraf biasa.
  story?: CategoryStory;
  stats?: CategoryStat[];
  howItWorks?: CategoryStep[];
  forWhom?: string[];
  env?: { headline: string; stats: CategoryStat[] };
  faq?: CategoryFaqItem[];
  ctaTitle?: string;
  ctaText?: string;
}

export const CATEGORY_CONTENT: Partial<Record<PintuId, CategoryContent>> = {
  food: {
    story: {
      headline: 'Sepiring makanan yang datang tepat waktu adalah tanda bahwa seseorang masih diingat, jauh melampaui sekadar mengisi perut yang lapar.',
      paragraphs: [
        'Setiap hari, ada makanan berlebih yang nyaris terbuang, ada keluarga yang menahan lapar sampai malam, dan ada petugas kebersihan yang bekerja tanpa sempat makan, padahal kini siapa pun dapat menjadi penghubung yang mempertemukan semuanya.',
        'Pintu Berbagi Makanan meneruskan donasi itu kepada dapur-dapur kecil milik warga, dan setiap Jumat masakannya diantarkan kepada panti asuhan, keluarga prasejahtera, petugas kebersihan, serta warga yang membutuhkan, lalu foto dan video penyalurannya kembali kepada donatur paling lama sehari sesudahnya. Makanan berlebih yang masih layak pun ikut dijemput, supaya yang tersisa dari satu meja dapat menjadi makan malam di meja yang lain.',
      ],
      closing: 'Mengingat orang yang lapar adalah pekerjaan yang tidak pernah selesai bila ditanggung sendirian, dan itulah yang membuat setiap piring yang berpindah menjadi urusan kita bersama.',
    },
    stats: [
      { value: '12.400', label: 'porsi tersalurkan' },
      { value: '38', label: 'titik penyaluran' },
      { value: '1.900', label: 'penerima manfaat' },
      { value: '52', label: 'pekan berjalan' },
    ],
    howItWorks: [
      { title: 'Order / Jemput', desc: 'Donasi masuk atau surplus dijemput.' },
      { title: 'Kurasi Higiene', desc: 'Mitra dapur menyiapkan standar laik.' },
      { title: 'Penyaluran', desc: 'Diantar ke titik penerima terdata.' },
      { title: 'Laporan H+1', desc: 'Foto & video dikirim ke donatur.' },
    ],
    forWhom: ['Panti asuhan', 'Fakir miskin', 'Petugas kebersihan', 'Komunitas prasejahtera', 'Warga terdampak'],
    faq: [
      { q: 'Bagaimana kebersihan & kelayakan makanan dijamin?', a: 'Makanan dimasak mitra dapur terkurasi dengan standar laik higiene, dicek sebelum penyaluran, dan tak pernah menyimpan yang basi atau kedaluwarsa.' },
      { q: 'Ke mana saja makanan disalurkan?', a: 'Ke titik penerima yang sudah terdata dan dipetakan, mulai dari panti, warga prasejahtera, sampai petugas kebersihan. Penyaluran dibuat merata, tidak menumpuk di satu tempat.' },
      { q: 'Bisakah saya berdonasi rutin setiap pekan?', a: 'Bisa. Hubungi kami via WhatsApp, tim membantu mengatur donasi rutin dan jumlah pax sesuai kebutuhan kamu.' },
    ],
    ctaTitle: 'Punya surplus makanan atau ingin jadi mitra penyalur?',
    ctaText: 'Tim kami bantu salurkan ke titik yang tepat. Donasi per program ada di halaman masing-masing.',
  },
  // Empat pintu di bawah ini belum punya program. Ceritanya ditulis supaya tetap
  // benar selama pintunya masih disiapkan, jadi tidak ada kalimat yang berbunyi
  // seolah penyalurannya sudah jalan.
  //
  // Daftar "cara ikut"-nya dulu di sini juga, sebagai field `contribute`.
  // Sekarang di koleksi `aksi` (src/content/aksi/*.json) supaya editor bisa
  // menyentuhnya tanpa developer.
  // Pintu ini belum punya program, jadi halamannya bersandar pada cerita. Tidak
  // ada angka di sini dengan sengaja: satu pohon pun belum ditanam, dan angka
  // dampak baru boleh muncul lewat jejak, bukan diketik tangan.
  environment: {
    story: {
      // Tulisan pemilik situs, kata demi kata, urutannya juga tidak diubah.
      // SATU frasa berubah saat pintu berpindah sumbu: "Pintu Berbagi Pohon"
      // jadi "Pintu Berbagi Lingkungan", karena pintu bernama Pohon sudah tak
      // ada dan menyebut pintu yang tak ada bukan soal gaya bahasa. Selain itu
      // tak ada satu kata pun yang disentuh.
      // Empat kalimatnya dipetakan langsung ke bentuk yang dirender halaman:
      // kalimat pertama jadi judul, dua berikutnya jadi paragraf, yang terakhir
      // jadi kutipan penutup. Jadi tidak ada satu kata pun yang ditambahkan,
      // dibuang, atau dipendekkan.
      //
      // Judulnya sempat diringkas supaya lebih menggigit, dan itu keliru.
      // Ringkasannya mengambil separuh kalimat pertama, sehingga paragrafnya
      // mengulang kalimat yang barusan dibaca, dan bangunan emosinya rusak.
      // Kalau judul pendek diinginkan lagi, tulis kalimat baru, jangan potong
      // kalimat yang sudah ada.
      headline: 'Kota yang baik bukan hanya dibangun dengan beton, jalan, dan gedung, tetapi juga dengan pohon yang memberi kehidupan.',
      paragraphs: [
        'Di tengah suhu kota yang semakin panas, kualitas udara yang menurun, dan dampak perubahan iklim yang semakin nyata, setiap orang kini dapat ikut menjadi bagian dari solusinya.',
        'Melalui Pintu Berbagi Lingkungan, setiap donasi akan tumbuh menjadi pohon yang menghadirkan keteduhan, menyerap karbon, menghasilkan oksigen, dan memperkuat ketahanan kota bagi generasi mendatang.',
      ],
      closing: 'Karena membangun kota yang lebih hijau bukan hanya tugas pemerintah, tetapi gerakan kita bersama.',
    },
    forWhom: ['Warga di sekitar titik tanam', 'Sekolah & ruang publik', 'Pejalan kaki dan pengguna jalan', 'Kawasan rawan panas & banjir', 'Generasi mendatang'],
    ctaTitle: 'Ingin menanam lebih banyak pohon di kotamu?',
    ctaText: 'Punya lahan, bibit, atau ingin berdonasi pohon? Ceritakan ke kami lewat WhatsApp.',
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
