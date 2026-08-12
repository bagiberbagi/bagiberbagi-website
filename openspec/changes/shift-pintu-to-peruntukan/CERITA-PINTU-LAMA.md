# Cerita pintu lama yang tak punya penerus

Empat blok `CATEGORY_CONTENT` ini ditulis untuk pintu berbasis BENTUK yang dipensiunkan M3.
Prosanya nyata dan tak ada yang membuangnya — disalin utuh di sini karena isinya justru bahan
untuk permukaan tingkat-situs yang dibuat M4:

| bekas pintu | bahan untuk |
|---|---|
| `time` | halaman **Relawan** |
| `space` | halaman **Logistik** |
| `money` | permukaan **Donasi** / transparansi |
| `goods` | ditulis ulang per pintu (buku ke Pendidikan, alat kesehatan ke Kesehatan) |


## `goods`

```ts
  goods: {
    story: {
      headline: 'Barang yang sudah tidak digunakan bukan barang yang sudah tidak berguna, melainkan barang yang sedang menunggu pemilik berikutnya untuk melanjutkan usianya.',
      paragraphs: [
        'Setiap rumah menyimpan pakaian yang sudah tidak dipakai, buku yang sudah selesai dibaca, perlengkapan sekolah yang sudah tidak muat, dan peralatan rumah tangga yang tergeletak di sudut lemari, dan kini semua orang dapat membuat simpanan itu berguna kembali bagi orang lain.',
        'Pintu Berbagi Barang sedang kami siapkan untuk menjadi jalannya, lengkap dengan pemeriksaan kelayakan sebelum sebuah barang berpindah tangan, sebab yang diterima seseorang semestinya terasa sebagai pemberian yang pantas, bukan sebagai sisa yang sudah tidak diinginkan.',
      ],
      closing: 'Umur sebuah barang semestinya diukur dari seberapa lama ia tetap berguna bagi orang lain, bukan dari seberapa lama ia tersimpan sendirian di rumah yang sudah tidak memerlukannya lagi.',
    },
    forWhom: ['Anak-anak panti asuhan', 'Siswa yang belum punya seragam', 'Anak yang kekurangan buku bacaan', 'Keluarga prasejahtera', 'Warga yang perabot rumahnya seadanya', 'Petugas kebersihan kota'],
    ctaTitle: 'Ada barang bagus yang cuma tersimpan di rumahmu?',
    ctaText: 'Kirim fotonya ke kami lewat WhatsApp, nanti kami kabari kalau penyalurannya sudah bisa jalan.',
  },
```

## `time`

```ts
  time: {
    story: {
      headline: 'Keahlian yang setiap hari dipakai untuk mencari nafkah sering terasa biasa saja bagi pemiliknya, padahal justru itulah yang paling langka tersedia ketika sebuah kegiatan sosial membutuhkannya.',
      paragraphs: [
        'Waktu adalah satu-satunya milik yang tidak pernah bisa dikembalikan setelah diberikan, dan justru itulah yang membuat kesediaan setiap orang begitu berharga, sebab yang menolong bukan kehadiran sekali yang mengesankan, melainkan keinginan untuk datang lagi.',
        'Di Pintu Berbagi Waktu, jam dan keahlian yang diberikan akan disusun menjadi giliran mengajar, mendampingi belajar, merapikan pembukuan dapur kecil, dan memotret kegiatan, sehingga pertolongan itu dapat diandalkan bukan sekali, melainkan dari pekan ke pekan berikutnya.',
      ],
      closing: 'Sebab kesediaan untuk terus hadir bagi orang lain tidak boleh bertumpu pada satu dua orang yang sama, melainkan menjadi giliran yang dapat dijalankan oleh setiap orang yang mau meluangkan waktunya.',
    },
    forWhom: ['Siswa yang tertinggal pelajaran', 'Anak panti yang butuh teman belajar', 'Dapur kecil yang pembukuannya belum rapi', 'Kegiatan warga yang perlu didokumentasikan', 'Tim penyaluran di lapangan', 'Relawan baru yang perlu didampingi'],
    ctaTitle: 'Keahlian apa yang bisa kamu bagikan?',
    ctaText: 'Tulis saja ke WhatsApp kami, apa yang kamu bisa dan kapan biasanya kamu luang, biar kami catat lebih dulu dan kami hubungi saat kebutuhannya sudah jelas.',
  },
```

## `space`

```ts
  space: {
    story: {
      headline: 'Sebuah ruang tidak kehilangan nilainya ketika kosong, sebab nilai yang sesungguhnya justru muncul begitu ada orang lain yang boleh memakainya.',
      paragraphs: [
        'Banyak kegiatan baik tertahan bukan karena kekurangan niat, melainkan karena tidak ada aula untuk berkumpul dan tidak ada kendaraan untuk mengangkut bantuan, dan kini setiap orang dengan ruang atau kendaraan yang menganggur pada hari tertentu dapat ikut membuka jalan.',
        'Pintu Berbagi Ruang nantinya mempertemukan pemilik ruang dengan kegiatan yang sedang mencarinya, supaya aula, gudang, dan kendaraan yang kosong pada hari tertentu dapat dipinjamkan untuk kegiatan sosial dan penyaluran bantuan, dan sebuah niat baik tidak lagi berhenti hanya karena tidak ada tempat berkumpul.',
      ],
      closing: 'Kota yang terbuka tumbuh dari ruang-ruang yang bersedia dipinjamkan, sekecil apa pun bentuknya, kepada siapa saja yang sedang memerlukannya.',
    },
    forWhom: ['Komunitas relawan yang belum punya markas', 'Kelas belajar anak-anak di kampung', 'Dapur umum warga', 'Karang taruna dan kelompok pemuda', 'Kelompok yang perlu kendaraan angkut'],
    ctaTitle: 'Punya ruang yang menganggur di hari tertentu?',
    ctaText: 'Ceritakan ruang atau kendaraan yang kamu punya lewat WhatsApp, supaya nanti ada tempat yang bisa dituju kelompok yang sedang mencarinya.',
  },
```

## `money`

```ts
  money: {
    story: {
      headline: 'Dana adalah bantuan yang paling lentur, sebab ia dapat berubah menjadi apa pun yang paling dibutuhkan pada hari itu, asalkan perjalanannya tetap bisa ditelusuri dari awal hingga akhir.',
      paragraphs: [
        'Kebutuhan mendesak jarang datang dengan pemberitahuan, ada yang harus melunasi biaya pengobatan dalam hitungan jam, ada yang kehilangan modal usaha dalam semalam, dan pintu untuk ikut meringankannya kini terbuka bagi setiap orang.',
        'Pintu Berbagi Dana sedang disiapkan untuk menampung zakat, sedekah, donasi perorangan, dan anggaran tanggung jawab sosial perusahaan, agar tersalur ke kebutuhan yang sudah diperiksa, dicatat secara terbuka, dan dapat ditelusuri oleh siapa pun yang menitipkannya.',
      ],
      closing: 'Kepercayaan yang dititipkan melalui sebuah donasi hanya akan terjaga selama jalannya tetap terbuka untuk ditelusuri siapa pun.',
    },
    forWhom: ['Mustahik penerima zakat', 'Keluarga prasejahtera', 'Warga yang sedang kesulitan mendadak', 'Penerima manfaat program makanan', 'Dapur UMKM yang memasak pesanannya'],
    ctaTitle: 'Mau tahu dulu uangmu akan dipakai untuk apa?',
    ctaText: 'Tanyakan lewat WhatsApp sedetail yang kamu mau, termasuk bentuk laporan yang kamu harapkan, dan kami jawab satu per satu.',
  },
```
