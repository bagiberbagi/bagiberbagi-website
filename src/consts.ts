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
  | 'time' | 'space' | 'money' | 'tree' | 'impact';

// "Pintu Berbagi" — jalan masuk berkontribusi sumber daya. Sebuah program
// menempel pada satu pintu lewat field `pintu`-nya (lihat programs.ts).
// (Dampak/impact BUKAN pintu — ia lapisan hasil, tampil lewat ImpactSection.)
//
// Satu-satunya sumber daftar pintu. Semua tempat lain menurunkan darinya:
// `PintuId` (tipe), enum zod di content.config.ts, dan opsi select Keystatic.
// Tambah/hapus pintu cukup di sini + entri PINTU di bawah — jangan tulis ulang
// daftar id di tempat lain.
export const PINTU_IDS = ['food', 'goods', 'time', 'space', 'money', 'tree'] as const;
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
  // seoDescription = meta description /berbagi/[slug] (70-160 char, padat kata
  // kunci). Batas atas 160 mengikuti titik potong Google; lebih dari itu ekor
  // kalimatnya tak pernah tampil. Sama dengan batas field SEO di Keystatic.
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
  { id: 'goods', slug: 'barang', label: 'Berbagi Barang', english: 'Goods Sharing', icon: 'box', tagline: 'Pakaian, buku, dan perlengkapan layak pakai berpindah ke yang memerlukan.', blurb: 'Barang layak pakai berpindah tangan.', seoDescription: 'Berbagi barang lewat bagiberbagi.id: pakaian, buku, dan perlengkapan layak pakai disalurkan ke warga dan komunitas yang membutuhkan, terdokumentasi.', color: '#7C4DDA', colorTint: '#ECE6FB', colorDeep: '#5E33B0' },
  { id: 'time', slug: 'waktu', label: 'Berbagi Waktu', english: 'Time Sharing', icon: 'time', tagline: 'Relawan membagikan keahlian, dari mengajar sampai konsultasi.', blurb: 'Relawan berbagi keahlian & tenaga.', seoDescription: 'Berbagi waktu bersama bagiberbagi.id: relawan membagikan keahlian dan tenaga, dari mengajar sampai pendampingan, untuk kegiatan sosial di berbagai kota.', color: '#E0447B', colorTint: '#FBE4EE', colorDeep: '#B22C5C' },
  { id: 'space', slug: 'ruang', label: 'Berbagi Ruang', english: 'Space Sharing', icon: 'space', tagline: 'Ruang pertemuan, aula, gudang, dan kendaraan untuk kegiatan sosial.', blurb: 'Ruang & kendaraan untuk kegiatan sosial.', seoDescription: 'Berbagi ruang lewat bagiberbagi.id: aula, gudang, ruang pertemuan, dan kendaraan tersedia untuk mendukung kegiatan sosial serta penyaluran bantuan di komunitas.', color: '#0EA5C4', colorTint: '#DBF2F8', colorDeep: '#0B7E97' },
  { id: 'money', slug: 'dana', label: 'Berbagi Dana', english: 'Money Sharing', icon: 'money', tagline: 'Zakat, CSR, dan donasi kami salurkan tepat sasaran.', blurb: 'Zakat, CSR, donasi tepat sasaran.', seoDescription: 'Berbagi dana bersama bagiberbagi.id: zakat, sedekah, CSR, dan donasi disalurkan tepat sasaran dan transparan untuk program bantuan makanan dan sosial.', color: '#16A34A', colorTint: '#DCF3E4', colorDeep: '#10803A' },
  // Hijau daun, bukan hijau emerald: Dana sudah memakai #16A34A, dan dua hijau
  // dengan rona berdekatan terbaca sebagai satu pintu yang sama di peta beranda.
  { id: 'tree', slug: 'pohon', label: 'Berbagi Pohon', english: 'Tree Sharing', icon: 'tree', tagline: 'Setiap donasi tumbuh jadi pohon yang meneduhkan kota dan menyerap karbon.', blurb: 'Pohon yang meneduhkan & menyerap karbon.', seoDescription: 'Berbagi pohon lewat bagiberbagi.id: donasi ditanam jadi pohon yang memberi keteduhan, menyerap karbon, dan memperkuat ketahanan kota bagi generasi mendatang.', color: '#65A30D', colorTint: '#EDF4DB', colorDeep: '#4D7C0F' },
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
export interface CategoryStory { headline: string; paragraphs: string[]; closing?: string }
export interface CategoryContent {
  // Cerita pembuka pintu, dirender tepat di bawah hero. Isinya alasan pintu ini
  // ada, bukan cara ikut: yang terakhir itu urusan program. `closing` dipisah
  // karena kalimat penutupnya dipakai sebagai kutipan, bukan paragraf biasa.
  story?: CategoryStory;
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
    contribute: [
      { title: 'Donasi paket', desc: 'Donasi ke program aktif, lalu kami salurkan dan kirim laporannya.' },
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
      { q: 'Ke mana saja makanan disalurkan?', a: 'Ke titik penerima yang sudah terdata dan dipetakan, mulai dari panti, warga prasejahtera, sampai petugas kebersihan. Penyaluran dibuat merata, tidak menumpuk di satu tempat.' },
      { q: 'Bisakah saya berdonasi rutin setiap pekan?', a: 'Bisa. Hubungi kami via WhatsApp, tim membantu mengatur donasi rutin dan jumlah pax sesuai kebutuhan kamu.' },
    ],
    ctaTitle: 'Punya surplus makanan atau ingin jadi mitra penyalur?',
    ctaText: 'Tim kami bantu salurkan ke titik yang tepat. Donasi per program ada di halaman masing-masing.',
  },
  // Empat pintu di bawah ini belum punya program. Ceritanya ditulis supaya tetap
  // benar selama pintunya masih disiapkan, jadi tidak ada kalimat yang berbunyi
  // seolah penyalurannya sudah jalan, dan `contribute`-nya berisi hal yang bisa
  // dikerjakan pembaca minggu ini juga tanpa menunggu kami.
  goods: {
    story: {
      headline: 'Barang yang sudah tidak digunakan bukan barang yang sudah tidak berguna, melainkan barang yang sedang menunggu pemilik berikutnya untuk melanjutkan usianya.',
      paragraphs: [
        'Setiap rumah menyimpan pakaian yang sudah tidak dipakai, buku yang sudah selesai dibaca, perlengkapan sekolah yang sudah tidak muat, dan peralatan rumah tangga yang tergeletak di sudut lemari, dan kini semua orang dapat membuat simpanan itu berguna kembali bagi orang lain.',
        'Pintu Berbagi Barang sedang kami siapkan untuk menjadi jalannya, lengkap dengan pemeriksaan kelayakan sebelum sebuah barang berpindah tangan, sebab yang diterima seseorang semestinya terasa sebagai pemberian yang pantas, bukan sebagai sisa yang sudah tidak diinginkan.',
      ],
      closing: 'Umur sebuah barang semestinya diukur dari seberapa lama ia tetap berguna bagi orang lain, bukan dari seberapa lama ia tersimpan sendirian di rumah yang sudah tidak memerlukannya lagi.',
    },
    contribute: [
      { title: 'Pilah isi lemari', desc: 'Sisihkan yang masih layak tapi sudah lama tidak kamu pakai, lalu simpan terpisah supaya tidak tercampur lagi saat pintu ini dibuka.' },
      { title: 'Kabari barang yang ada', desc: 'Kirim foto dan daftar barangnya lewat WhatsApp, supaya kami tahu barang jenis apa yang paling banyak tersedia sebelum alur penyalurannya kami rancang.' },
      { title: 'Bantu susun standarnya', desc: 'Kalau kamu terbiasa mengurus gudang atau pengiriman barang, ceritakan pengalamanmu, supaya cara memilah dan mengantarnya tidak kami tentukan sendiri.' },
    ],
    forWhom: ['Anak-anak panti asuhan', 'Siswa yang belum punya seragam', 'Anak yang kekurangan buku bacaan', 'Keluarga prasejahtera', 'Warga yang perabot rumahnya seadanya', 'Petugas kebersihan kota'],
    ctaTitle: 'Ada barang bagus yang cuma tersimpan di rumahmu?',
    ctaText: 'Kirim fotonya ke kami lewat WhatsApp, nanti kami kabari kalau penyalurannya sudah bisa jalan.',
  },
  time: {
    story: {
      headline: 'Keahlian yang setiap hari dipakai untuk mencari nafkah sering terasa biasa saja bagi pemiliknya, padahal justru itulah yang paling langka tersedia ketika sebuah kegiatan sosial membutuhkannya.',
      paragraphs: [
        'Waktu adalah satu-satunya milik yang tidak pernah bisa dikembalikan setelah diberikan, dan justru itulah yang membuat kesediaan setiap orang begitu berharga, sebab yang menolong bukan kehadiran sekali yang mengesankan, melainkan keinginan untuk datang lagi.',
        'Di Pintu Berbagi Waktu, jam dan keahlian yang diberikan akan disusun menjadi giliran mengajar, mendampingi belajar, merapikan pembukuan dapur kecil, dan memotret kegiatan, sehingga pertolongan itu dapat diandalkan bukan sekali, melainkan dari pekan ke pekan berikutnya.',
      ],
      closing: 'Sebab kesediaan untuk terus hadir bagi orang lain tidak boleh bertumpu pada satu dua orang yang sama, melainkan menjadi giliran yang dapat dijalankan oleh setiap orang yang mau meluangkan waktunya.',
    },
    contribute: [
      { title: 'Kirim daftar keahlianmu', desc: 'Lewat WhatsApp, sebutkan apa yang kamu bisa kerjakan dan berapa jam dalam seminggu kamu benar-benar luang, lalu kami simpan supaya bisa dicocokkan begitu kebutuhannya muncul.' },
      { title: 'Ikut satu penyaluran dulu', desc: 'Penyaluran makanan sudah berjalan dan kamu boleh ikut membantu di situ, karena melihat sendiri satu kegiatan lebih cepat menjelaskan bantuan seperti apa yang benar-benar dipakai.' },
      { title: 'Ajak satu orang bergantian', desc: 'Kalau ada dua orang yang bisa saling menggantikan, jadwal tidak langsung berantakan saat salah satu berhalangan, jadi ceritakan pintu ini ke teman yang keahliannya berbeda darimu.' },
    ],
    forWhom: ['Siswa yang tertinggal pelajaran', 'Anak panti yang butuh teman belajar', 'Dapur kecil yang pembukuannya belum rapi', 'Kegiatan warga yang perlu didokumentasikan', 'Tim penyaluran di lapangan', 'Relawan baru yang perlu didampingi'],
    ctaTitle: 'Keahlian apa yang bisa kamu bagikan?',
    ctaText: 'Tulis saja ke WhatsApp kami, apa yang kamu bisa dan kapan biasanya kamu luang, biar kami catat lebih dulu dan kami hubungi saat kebutuhannya sudah jelas.',
  },
  space: {
    story: {
      headline: 'Sebuah ruang tidak kehilangan nilainya ketika kosong, sebab nilai yang sesungguhnya justru muncul begitu ada orang lain yang boleh memakainya.',
      paragraphs: [
        'Banyak kegiatan baik tertahan bukan karena kekurangan niat, melainkan karena tidak ada aula untuk berkumpul dan tidak ada kendaraan untuk mengangkut bantuan, dan kini setiap orang dengan ruang atau kendaraan yang menganggur pada hari tertentu dapat ikut membuka jalan.',
        'Pintu Berbagi Ruang nantinya mempertemukan pemilik ruang dengan kegiatan yang sedang mencarinya, supaya aula, gudang, dan kendaraan yang kosong pada hari tertentu dapat dipinjamkan untuk kegiatan sosial dan penyaluran bantuan, dan sebuah niat baik tidak lagi berhenti hanya karena tidak ada tempat berkumpul.',
      ],
      closing: 'Kota yang terbuka tumbuh dari ruang-ruang yang bersedia dipinjamkan, sekecil apa pun bentuknya, kepada siapa saja yang sedang memerlukannya.',
    },
    contribute: [
      { title: 'Daftarkan ruang atau kendaraanmu', desc: 'Ceritakan lewat WhatsApp jenis ruangnya, lokasinya, dan hari yang biasanya kosong, lalu kami simpan sebagai calon titik kegiatan yang pertama kami hubungi nanti.' },
      { title: 'Pinjamkan langsung tanpa lewat kami', desc: 'Kalau di sekitarmu ada kelompok yang sedang mencari tempat berkumpul, kamu bisa menawarkan ruangmu ke mereka sekarang juga tanpa menunggu program ini dibuka.' },
      { title: 'Kenalkan kami ke pengelolanya', desc: 'Sambungkan kami ke pengurus aula, masjid, atau gudang yang kamu kenal, lalu kami yang menjelaskan bagaimana peminjamannya nanti diatur.' },
    ],
    forWhom: ['Komunitas relawan yang belum punya markas', 'Kelas belajar anak-anak di kampung', 'Dapur umum warga', 'Karang taruna dan kelompok pemuda', 'Kelompok yang perlu kendaraan angkut'],
    ctaTitle: 'Punya ruang yang menganggur di hari tertentu?',
    ctaText: 'Ceritakan ruang atau kendaraan yang kamu punya lewat WhatsApp, supaya nanti ada tempat yang bisa dituju kelompok yang sedang mencarinya.',
  },
  money: {
    story: {
      headline: 'Dana adalah bantuan yang paling lentur, sebab ia dapat berubah menjadi apa pun yang paling dibutuhkan pada hari itu, asalkan perjalanannya tetap bisa ditelusuri dari awal hingga akhir.',
      paragraphs: [
        'Kebutuhan mendesak jarang datang dengan pemberitahuan, ada yang harus melunasi biaya pengobatan dalam hitungan jam, ada yang kehilangan modal usaha dalam semalam, dan pintu untuk ikut meringankannya kini terbuka bagi setiap orang.',
        'Pintu Berbagi Dana sedang disiapkan untuk menampung zakat, sedekah, donasi perorangan, dan anggaran tanggung jawab sosial perusahaan, agar tersalur ke kebutuhan yang sudah diperiksa, dicatat secara terbuka, dan dapat ditelusuri oleh siapa pun yang menitipkannya.',
      ],
      closing: 'Kepercayaan yang dititipkan melalui sebuah donasi hanya akan terjaga selama jalannya tetap terbuka untuk ditelusuri siapa pun.',
    },
    contribute: [
      { title: 'Periksa dulu catatan penyalurannya', desc: 'Sebelum mengirim uang, kamu bisa membuka halaman Jejak & Dampak dan melihat sendiri kegiatan apa saja yang sudah kami catat di sana.' },
      { title: 'Titipkan zakat atau sedekahmu', desc: 'Selama pintu ini masih kami siapkan, uang yang kamu kirim kami arahkan ke program makanan yang sudah berjalan, dan bukti penyalurannya kami kirimkan ke kamu.' },
      { title: 'Bawa anggaran CSR kantormu', desc: 'Kalau kamu yang memegang anggaran CSR, ajak kami bicara lewat WhatsApp soal bentuk laporan dan dokumentasi yang perusahaanmu butuhkan.' },
    ],
    forWhom: ['Mustahik penerima zakat', 'Keluarga prasejahtera', 'Warga yang sedang kesulitan mendadak', 'Penerima manfaat program makanan', 'Dapur UMKM yang memasak pesanannya'],
    ctaTitle: 'Mau tahu dulu uangmu akan dipakai untuk apa?',
    ctaText: 'Tanyakan lewat WhatsApp sedetail yang kamu mau, termasuk bentuk laporan yang kamu harapkan, dan kami jawab satu per satu.',
  },
  // Pintu ini belum punya program, jadi halamannya bersandar pada cerita. Tidak
  // ada angka di sini dengan sengaja: satu pohon pun belum ditanam, dan angka
  // dampak baru boleh muncul lewat jejak, bukan diketik tangan.
  tree: {
    story: {
      // Tulisan pemilik situs, kata demi kata, urutannya juga tidak diubah.
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
        'Melalui Pintu Berbagi Pohon, setiap donasi akan tumbuh menjadi pohon yang menghadirkan keteduhan, menyerap karbon, menghasilkan oksigen, dan memperkuat ketahanan kota bagi generasi mendatang.',
      ],
      closing: 'Karena membangun kota yang lebih hijau bukan hanya tugas pemerintah, tetapi gerakan kita bersama.',
    },
    contribute: [
      { title: 'Tunjuk titik yang panas', desc: 'Ceritakan lewat WhatsApp jalan atau kawasan di sekitarmu yang terik dan tidak punya peneduh, supaya daftar lokasi tanamnya tidak kami susun dari peta saja.' },
      { title: 'Tawarkan lahan atau bibit', desc: 'Kalau kamu punya lahan yang bisa ditanami atau bibit yang siap dipindahkan, kabari kami, karena dua hal itu yang paling sering menahan penanaman.' },
      { title: 'Rawat pohon yang sudah ada', desc: 'Pohon muda lebih sering mati karena tidak terawat daripada karena kurang bibit, jadi menyiram dan menjaga yang sudah tumbuh di sekitarmu sudah menolong hari ini juga.' },
    ],
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
