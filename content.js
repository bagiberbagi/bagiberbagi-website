// Simple lightweight CMS: edit this file to change page content without touching layout/logic.
export const content = {
  waNumber: '+6282233996648',
  waNumberDisplay: '+62 822-3399-6648',
  socials: {
    instagram: 'bagiberbagiid',
    tiktok: 'bagiberbagiid',
    email: 'bagiberbagi.official@gmail.com'
  },
  programOptions: [
    { label: 'Jumat Berkah', disabled: false },
    { label: 'Paket Makanan Sehat', disabled: true },
    { label: 'Bantuan UMKM Kuliner', disabled: true },
    { label: 'Dukungan Relawan Lapangan', disabled: true }
  ],
  statLabels: ['Total Dana Tersalurkan', 'Donatur Terdaftar', 'Orang Telah Berbagi', 'Area Distribusi'],
  legal: {
    privacy: {
      title: 'Kebijakan Privasi',
      paragraphs: [
        'bagiberbagi.id mengumpulkan data pribadi (nama, kontak, riwayat donasi) hanya untuk memproses donasi dan mengirimkan laporan penyaluran kepada donatur.',
        'Data tidak dibagikan ke pihak ketiga untuk kepentingan komersial. Data pembayaran diproses melalui mekanisme yang aman dan tidak disimpan di server kami.',
        'Donatur dapat meminta penghapusan data pribadinya kapan saja dengan menghubungi tim kami melalui WhatsApp.'
      ]
    },
    terms: {
      title: 'Syarat & Ketentuan',
      paragraphs: [
        'Donasi yang telah dikonfirmasi tidak dapat dibatalkan atau dikembalikan, kecuali terjadi kesalahan teknis pada sistem pembayaran.',
        'bagiberbagi.id berkomitmen menyalurkan dana sesuai program yang dipilih donatur dan mengirimkan bukti penyaluran (foto/video) maksimal H+1.',
        'Mitra UMKM dan relawan yang bergabung wajib mengikuti standar higienitas dan proses penyaluran yang ditetapkan oleh tim bagiberbagi.id.'
      ]
    },
    transparency: {
      title: 'Transparansi & Status Kami',
      paragraphs: [
        'bagiberbagi.id adalah inisiatif komunitas independen yang saat ini dalam tahap pengembangan menuju badan hukum resmi. Kami berkomitmen menjalankan setiap donasi secara akuntabel selama masa awal ini.',
        'Ringkasan penggunaan dana akan dipublikasikan secara berkala seiring bertambahnya skala program. Untuk saat ini, setiap donasi dilengkapi bukti penyaluran (foto/video) yang dikirim langsung ke donatur.'
      ]
    }
  },
  programFeatures: [
    { iconFood: true, bg: '#FDEEE1', color: '#F4791D', title: 'Makanan sehat & higienis', desc: 'Menu bergizi lengkap dimasak UMKM kuliner terkurasi dengan standar laik higiene.' },
    { iconMap: true, bg: '#E3EAFB', color: '#1D46B9', title: 'Penerima terdata, bukan tebak-tebakan', desc: 'Titik penyaluran dipetakan dengan seksama, merata, tidak menumpuk di satu tempat.' },
    { iconCamera: true, bg: '#FDEEE1', color: '#F4791D', title: 'Bukti nyata setiap pekan', desc: 'Foto dan video geotagged dari lapangan dikirim ke donatur maksimal H+1 setelah distribusi.' },
    { iconRepeat: true, bg: '#E3EAFB', color: '#1D46B9', title: 'Bisa berlangganan', desc: 'Aktifkan donasi berlangganan yang berjalan otomatis tanpa perlu diingat-ingat.' }
  ],
  steps: [
    { n: '01', title: 'Pilih Program', desc: 'Pilih jumlah pax, sekali jalan atau langganan mingguan.' },
    { n: '02', title: 'Lakukan Pembayaran', desc: 'Lakukan pembayaran dengan aman melalui mekanisme pada platform.' },
    { n: '03', title: 'Mitra Menjalankan', desc: 'Order diteruskan ke UMKM partner dengan standar higienitas.' },
    { n: '04', title: 'Penyaluran', desc: 'Panti asuhan, petugas kebersihan dan fakir miskin sesuai pemetaan.' },
    { n: '05', title: 'Laporan Transparan', desc: 'Foto & video penyaluran dikirim maksimal H+1.' }
  ],
  impacts: [
    { iconHeart: true, title: 'Penerima Manfaat', desc: 'Makanan sehat bergizi hadir terjadwal — kepastian dan martabat bagi yang membutuhkan.' },
    { iconChef: true, title: 'UMKM Kuliner', desc: 'Dapur kecil mendapat order pasti mingguan, omzet yang membantu usaha keluarga.' },
    { iconWalk: true, title: 'Relawan Lapangan', desc: 'Warga memperoleh penghasilan rutin dalam setiap proses penyaluran lingkungannya sendiri.' },
    { iconBox: true, title: 'Pekerja Pendukung', desc: 'Dokumentasi & kurir ikut bergerak. Lapangan kerja baru lahir dari satu tradisi.' }
  ],
  faqs: [
    { q: 'Bagaimana cara memastikan donasi saya benar-benar disalurkan?', a: 'Setiap penyaluran didokumentasikan dengan foto & video geotagged yang dikirim ke donatur maksimal H+1 setelah distribusi.' },
    { q: 'Bisakah saya memilih program atau jumlah pax secara spesifik?', a: 'Bisa. Pilih program yang tersedia dan atur jumlah pax sesuai kebutuhan langsung dari kalkulator donasi di atas.' },
    { q: 'Apakah bisa donasi rutin setiap minggu?', a: 'Bisa, aktifkan donasi berlangganan yang berjalan otomatis tanpa perlu diingat-ingat setiap minggunya.' },
    { q: 'Bagaimana proses pembayarannya?', a: 'Setelah memilih program, Anda akan diarahkan ke tim kami via WhatsApp untuk menyelesaikan detail dan metode pembayaran.' }
  ],
  footerCols: [
    { title: 'Program', links: [
      { label: 'Donasi', href: '#donasi', isPlain: false },
      { label: 'CSR Enterprise', href: '#tentang', isPlain: false },
      { label: 'UMKM Partner', href: '#tentang', isPlain: false }
    ] },
    { title: 'Perusahaan', links: [
      { label: 'Tentang Kami', href: '#tentang', isPlain: false },
      { label: 'FAQ', href: '#faq', isPlain: false, target: '_self' },
      { label: 'Panduan', href: '#cara-kerja', isPlain: false, target: '_self' }
    ] },
    { title: 'Legal & Kontak', links: [
      { label: 'Kebijakan Privasi', href: '#privasi', isPlain: false, target: '_self' },
      { label: 'Syarat & Ketentuan', href: '#syarat', isPlain: false, target: '_self' },
      { label: 'Kontak', href: 'WA_LINK', isPlain: false, target: '_blank' }
    ] }
  ]
};
