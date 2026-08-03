import { createElement } from 'react';
import { collection, config, fields, singleton } from '@keystatic/core';
import { PINTU } from './src/consts';

/**
 * Field gambar share reusable — dipakai di blok SEO (seoFields) dan di tiap
 * entri seo.pages. Diekstrak agar `directory`/`publicPath` tak bisa drift:
 * kalau keduanya beda, unggahan share terpecah ke dua folder.
 */
function shareImage() {
  return fields.image({
    label: 'Gambar share',
    description: 'Unggah gambar, atau kosongkan untuk memakai gambar default.',
    // Sama seperti foto jejak: unggahan mendarat di src/assets supaya lewat
    // astro:assets (dikecilkan + dikompres ulang), bukan disajikan mentah dari
    // public/. publicPath wajib persis sama dengan kunci glob di
    // src/lib/share-image.ts.
    directory: 'src/assets/share',
    publicPath: '/src/assets/share/',
  });
}

/**
 * Array paragraf teks multiline — pola berulang di halaman About (hero, misi,
 * blok kedua misi). itemLabel memakai 40 karakter pertama sebagai preview.
 */
function paragraphsField(label: string) {
  return fields.array(fields.text({ label: 'Paragraf', multiline: true }), {
    label,
    itemLabel: (props) => props.value?.slice(0, 40) || 'Paragraf',
  });
}

/**
 * Batas panjang teks yang menghadap mesin pencari. Google memotong judul di
 * sekitar 60 karakter dan deskripsi di sekitar 160, jadi apa pun di atas itu
 * tak pernah terbaca pengunjung. Dipasang sebagai `validation` supaya admin
 * menolak simpan, bukan sekadar imbauan di teks bantu yang bisa dilewati.
 * Nilainya dipakai dua kali (blok SEO per halaman dan singleton SEO), jadi
 * disimpan di satu tempat agar keduanya tak bisa berbeda.
 */
const SEO_TITLE_MAX = 60;
const SEO_DESCRIPTION_MAX = 160;

/**
 * Blok SEO yang menempel di entri konten yang punya halamannya sendiri.
 * Semua opsional: dikosongkan berarti halaman memakai judul/deskripsi yang
 * diturunkan dari isinya, seperti sebelum blok ini ada. Batas panjang tidak
 * mengganggu itu: field kosong tetap lolos, yang ditolak hanya isian kepanjangan.
 */
function seoFields(hint: string) {
  return fields.object(
    {
      title: fields.text({
        label: 'Judul di hasil pencarian',
        description: `Kosongkan untuk memakai ${hint}. Ideal 30-60 karakter; Google memotong judul di sekitar ${SEO_TITLE_MAX} karakter.`,
        validation: { length: { max: SEO_TITLE_MAX } },
      }),
      description: fields.text({
        label: 'Deskripsi di hasil pencarian',
        description: `Kosongkan untuk memakai paragraf pembuka halaman. Ideal 70-160 karakter; Google memotong deskripsi di sekitar ${SEO_DESCRIPTION_MAX} karakter, jadi taruh info terpenting di depan.`,
        multiline: true,
        validation: { length: { max: SEO_DESCRIPTION_MAX } },
      }),
      image: shareImage(),
    },
    {
      label: 'SEO',
      description: 'Bagaimana halaman ini tampil di Google dan saat dibagikan.',
    }
  );
}

/**
 * Tiga halaman legal berbagi bentuk yang sama; hanya id dan label yang beda.
 * Kembalikan singleton langsung (bukan objek ber-computed-key) supaya kunci
 * tetap literal — `ui.navigation` butuh kunci literal untuk mereferensikannya.
 */
function legalPage(id: 'privacy' | 'terms' | 'transparency', label: string) {
  return singleton({
    label,
    path: `src/content/legal/${id}`,
    format: { contentField: 'content' as const },
    schema: {
      title: fields.text({ label: 'Judul' }),
      eyebrow: fields.text({ label: 'Eyebrow' }),
      intro: fields.text({ label: 'Paragraf pembuka', multiline: true }),
      closing: fields.text({ label: 'Paragraf penutup', multiline: true }),
      updatedAt: fields.text({ label: 'Terakhir diperbarui (contoh: 15 Juli 2026)' }),
      seo: seoFields('judul halaman + nama situs'),
      content: fields.markdoc({
        label: 'Isi halaman',
        options: { image: false, codeBlock: false, table: false, blockquote: false },
      }),
    },
  });
}

export default config({
  storage: {
    kind: 'cloud',
  },
  cloud: {
    project: 'bagiberbagi/bagiberbagi-website',
  },
  ui: {
    brand: {
      name: 'bagiberbagi.id',
      // Logo memakai favicon PNG yang sudah ada; alt kosong karena nama teks
      // sudah dirender di sebelahnya (hindari duplikat bagi pembaca layar).
      mark: () =>
        createElement('img', {
          src: '/favicon/favicon-32x32.png',
          alt: '',
          width: 24,
          height: 24,
        }),
    },
    // Kelompokkan sidebar agar tidak menumpuk datar. Kunci di sini harus sama
    // persis dengan kunci singleton/collection di bawah.
    navigation: {
      Halaman: ['home', 'about', 'programs', 'organisasi', 'jejak'],
      'Konten Situs': ['faq', 'footer'],
      Legal: ['privacy', 'terms', 'transparency'],
      'Pengaturan Situs': ['settings', 'seo', 'analytics'],
    },
  },
  singletons: {
    // Halaman legal sengaja singleton, bukan collection: masing-masing punya
    // route hard-coded (privasi/syarat/transparansi.astro) yang memanggil
    // getEntry dengan id tetap. Sebagai collection, UI-nya menawarkan
    // tambah/hapus/rename-slug — entri baru tidak akan punya halaman, dan
    // rename atau hapus justru mematahkan route yang sudah ada.
    // Ini juga satu-satunya konten dengan body prose, jadi satu-satunya yang
    // pakai contentField; Keystatic hanya mendukung ekstensi .mdoc untuk itu.
    privacy: legalPage('privacy', 'Kebijakan Privasi'),
    terms: legalPage('terms', 'Syarat & Ketentuan'),
    transparency: legalPage('transparency', 'Transparansi'),

    // SEO dipisah dari Site Settings: yang satu identitas & kontak, yang satu
    // teks yang muncul di hasil pencarian dan share preview. Dibaca dua tempat
    // sekaligus — BaseLayout (meta + JSON-LD) dan generator OG image — jadi
    // judul yang diedit di sini ikut terpakai di gambar share-nya.
    seo: singleton({
      label: 'SEO & Share Preview',
      path: 'src/content/seo/seo',
      format: 'json',
      schema: {
        siteName: fields.text({ label: 'Nama situs (og:site_name)' }),
        defaultTitle: fields.text({
          label: 'Judul default',
          description: `Ideal 30-60 karakter; Google memotong judul di sekitar ${SEO_TITLE_MAX} karakter.`,
          validation: { length: { max: SEO_TITLE_MAX } },
        }),
        defaultDescription: fields.text({
          label: 'Deskripsi default',
          description: `Dipakai halaman yang belum punya deskripsi sendiri. Ideal 50-160 karakter; Google memotong deskripsi di sekitar ${SEO_DESCRIPTION_MAX} karakter.`,
          multiline: true,
          validation: { length: { max: SEO_DESCRIPTION_MAX } },
        }),
        defaultImage: fields.text({
          label: 'Gambar share default',
          description: 'Path dari root situs, contoh: /og-image.png',
        }),
        organization: fields.object(
          {
            type: fields.select({
              label: 'Tipe entitas',
              options: [
                { label: 'NGO / organisasi nirlaba', value: 'NGO' },
                { label: 'Organisasi umum', value: 'Organization' },
              ],
              defaultValue: 'NGO',
            }),
            name: fields.text({ label: 'Nama organisasi' }),
            logo: fields.text({ label: 'Path logo', description: 'Contoh: /favicon/apple-touch-icon.png' }),
          },
          {
            label: 'Organisasi (structured data)',
            description: 'Email dan akun sosial diambil dari Site Settings.',
          }
        ),
        pages: fields.array(
          fields.object({
            path: fields.text({
              label: 'Path halaman',
              description: 'Diawali dan diakhiri garis miring, contoh: /faq/ — beranda cukup /',
            }),
            title: fields.text({
              label: 'Judul',
              description: `Ideal 30-60 karakter; Google memotong judul di sekitar ${SEO_TITLE_MAX} karakter.`,
              validation: { length: { max: SEO_TITLE_MAX } },
            }),
            description: fields.text({
              label: 'Deskripsi',
              description: `Ideal 50-160 karakter; Google memotong deskripsi di sekitar ${SEO_DESCRIPTION_MAX} karakter, jadi taruh info terpenting di depan.`,
              multiline: true,
              validation: { length: { max: SEO_DESCRIPTION_MAX } },
            }),
            image: shareImage(),
            breadcrumbName: fields.text({
              label: 'Nama di breadcrumb',
              description: 'Kosongkan untuk memakai judul tanpa embel-embel nama situs.',
            }),
            noindex: fields.checkbox({ label: 'Sembunyikan dari mesin pencari' }),
          }),
          {
            label: 'Halaman',
            itemLabel: (props) => props.fields.path.value || 'Halaman',
          }
        ),
      },
    }),

    faq: singleton({
      label: 'FAQ',
      path: 'src/content/faq/faq',
      format: 'json',
      schema: {
        items: fields.array(
          fields.object({
            q: fields.text({ label: 'Pertanyaan' }),
            a: fields.text({ label: 'Jawaban', multiline: true }),
            category: fields.select({
              label: 'Kategori',
              options: [
                { label: 'Umum', value: 'umum' },
                { label: 'Donasi & Pembayaran', value: 'donasi' },
                { label: 'Penyaluran & Transparansi', value: 'penyaluran' },
                { label: 'Kemitraan', value: 'kemitraan' },
                { label: 'Kontak', value: 'kontak' },
              ],
              defaultValue: 'umum',
            }),
          }),
          {
            label: 'Pertanyaan',
            description:
              'Seret untuk mengurutkan. Pertanyaan dikelompokkan per kategori di halaman FAQ; urutan di sini menentukan urutan di dalam kelompoknya.',
            itemLabel: (props) => props.fields.q.value || 'Pertanyaan',
          }
        ),
      },
    }),

    footer: singleton({
      label: 'Footer',
      path: 'src/content/footer/footer',
      format: 'json',
      schema: {
        columns: fields.array(
          fields.object({
            title: fields.text({ label: 'Judul Kolom' }),
            links: fields.array(
              fields.object({
                label: fields.text({ label: 'Label' }),
                href: fields.text({
                  label: 'URL / Anchor',
                  description:
                    'Isi "https://wa.me/" tanpa nomor untuk tautan WhatsApp: nomornya diambil otomatis dari Identitas & Kontak.',
                }),
                target: fields.select({
                  label: 'Buka di',
                  options: [
                    { label: 'Tab yang sama', value: '_self' },
                    { label: 'Tab baru', value: '_blank' },
                  ],
                  defaultValue: '_self',
                }),
              }),
              {
                label: 'Link',
                description: 'Seret untuk mengurutkan.',
                itemLabel: (props) => props.fields.label.value || 'Link',
              }
            ),
          }),
          {
            label: 'Kolom',
            description: 'Seret untuk mengurutkan kolom dari kiri ke kanan.',
            itemLabel: (props) => props.fields.title.value || 'Kolom',
          }
        ),
      },
    }),

    settings: singleton({
      label: 'Identitas & Kontak',
      path: 'src/content/settings/site',
      format: 'json',
      schema: {
        waNumber: fields.text({ label: 'Nomor WhatsApp (format wa.me, contoh: +6282233996648)' }),
        waNumberDisplay: fields.text({ label: 'Nomor WhatsApp (tampilan)' }),
        socials: fields.object({
          instagram: fields.text({ label: 'Instagram (handle, tanpa @)' }),
          tiktok: fields.text({ label: 'TikTok (handle, tanpa @)' }),
          email: fields.text({ label: 'Email' }),
        }),
        statLabels: fields.array(fields.text({ label: 'Label' }), {
          label: 'Label Statistik',
          itemLabel: (props) => props.value || 'Label',
        }),
        statTargets: fields.object({
          dana: fields.number({ label: 'Total Dana (Jt)' }),
          donatur: fields.number({ label: 'Donatur Terdaftar' }),
          berbagi: fields.number({ label: 'Orang Telah Berbagi' }),
          area: fields.number({ label: 'Area Distribusi' }),
        }),
        statsNote: fields.text({ label: 'Catatan Statistik (mis. periode/sumber data)' }),
        schedule: fields.object(
          {
            weekday: fields.select({
              label: 'Hari',
              options: [
                { label: 'Minggu', value: '0' },
                { label: 'Senin', value: '1' },
                { label: 'Selasa', value: '2' },
                { label: 'Rabu', value: '3' },
                { label: 'Kamis', value: '4' },
                { label: 'Jumat', value: '5' },
                { label: 'Sabtu', value: '6' },
              ],
              defaultValue: '5',
            }),
            time: fields.text({ label: 'Jam (format 24 jam, contoh 06:00)', defaultValue: '06:00' }),
          },
          { label: 'Jadwal Program (hitung mundur hero)' }
        ),
        // Panel "Agenda Berikutnya" di kartu hero. Kosongkan Lokasi untuk
        // menyembunyikan seluruh panelnya; kosongkan Target Porsi untuk
        // menyembunyikan bar progresnya saja. Tanggalnya tidak diisi manual,
        // dihitung sendiri dari Jadwal Program di atas.
        nextAgenda: fields.object(
          {
            location: fields.text({
              label: 'Lokasi (kosongkan untuk menyembunyikan panel)',
              description: 'Contoh: Kampung Melayu, Jakarta Timur',
            }),
            targetPorsi: fields.integer({
              label: 'Target Porsi',
              description: 'Isi 0 untuk menyembunyikan bar progres.',
              defaultValue: 0,
            }),
            collectedPorsi: fields.integer({
              label: 'Porsi Terkumpul',
              description: 'Perbarui menjelang hari H. Tidak boleh melebihi target.',
              defaultValue: 0,
            }),
            cutoff: fields.text({
              label: 'Batas Donasi',
              description: 'Ditulis apa adanya, contoh: Kamis 21.00. Kosongkan kalau tidak ada batas.',
            }),
          },
          { label: 'Agenda Berikutnya (kartu hero)' }
        ),
      },
    }),
    // Switchboard analytics: tiap alat = centang + ID. BaseLayout menyuntik
    // skripnya hanya jika aktif + ID terisi. ID adalah kode publik (tampil di
    // HTML), bukan rahasia. Menyimpan = deploy otomatis ± 2 menit.
    analytics: singleton({
      label: 'Analytics',
      path: 'src/content/analytics/analytics',
      format: 'json',
      schema: {
        posthog: fields.object(
          {
            enabled: fields.checkbox({ label: 'Aktifkan PostHog' }),
            host: fields.text({
              label: 'Host',
              description: 'Contoh: https://eu.i.posthog.com atau https://us.i.posthog.com',
            }),
            projectKey: fields.text({
              label: 'Project Key',
              description: 'Kode publik (phc_…), bukan rahasia.',
            }),
          },
          { label: 'PostHog — insight privat (cookieless, tanpa consent)' }
        ),
        umami: fields.object(
          {
            enabled: fields.checkbox({ label: 'Aktifkan Umami' }),
            host: fields.text({
              label: 'Host',
              description: 'Contoh: https://cloud.umami.is atau URL instans Umami-mu.',
            }),
            websiteId: fields.text({
              label: 'Website ID',
              description: 'UUID dari dashboard Umami. Kode publik.',
            }),
          },
          { label: 'Umami — analitik ringan (cookieless, tanpa consent)' }
        ),
        ga4: fields.object(
          {
            enabled: fields.checkbox({ label: 'Aktifkan Google Analytics 4' }),
            measurementId: fields.text({
              label: 'Measurement ID',
              description: 'Format: G-XXXXXXXXXX. Kode publik.',
            }),
          },
          { label: 'Google Analytics 4 — cookie, butuh consent' }
        ),
        metaPixel: fields.object(
          {
            enabled: fields.checkbox({ label: 'Aktifkan Meta Pixel' }),
            pixelId: fields.text({ label: 'Pixel ID', description: 'Kode publik.' }),
          },
          { label: 'Meta Pixel — cookie, butuh consent' }
        ),
        clarity: fields.object(
          {
            enabled: fields.checkbox({ label: 'Aktifkan Microsoft Clarity' }),
            projectId: fields.text({ label: 'Project ID' }),
          },
          { label: 'Microsoft Clarity — cookie, butuh consent (opsional)' }
        ),
        gtm: fields.object(
          {
            enabled: fields.checkbox({ label: 'Aktifkan Google Tag Manager' }),
            containerId: fields.text({
              label: 'Container ID',
              description:
                'Format: GTM-XXXXXXX. Jika ini aktif, kelola GA4/Pixel di dalam GTM — jangan dicentang juga di sini (hindari dobel-fire).',
            }),
          },
          { label: 'Google Tag Manager — cookie, butuh consent (opsional)' }
        ),
        consentBanner: fields.checkbox({
          label: 'Tampilkan consent banner',
          description: 'Wajib begitu ada alat cookie di atas yang aktif. Consent Mode v2 default: denied.',
          defaultValue: true,
        }),
      },
    }),
    // Beranda memegang penempatan, bukan isi: program mana yang disorot dan
    // dengan urutan apa. Isi programnya sendiri tetap di koleksi Program, jadi
    // satu program bisa disorot tanpa datanya diduplikasi ke sini.
    home: singleton({
      label: 'Beranda',
      path: 'src/content/home/home',
      format: 'json',
      schema: {
        programSection: fields.object(
          {
            eyebrow: fields.text({ label: 'Eyebrow', defaultValue: 'PROGRAM AKTIF' }),
            title: fields.text({ label: 'Judul bagian' }),
            items: fields.array(fields.relationship({ label: 'Program', collection: 'programs' }), {
              label: 'Program yang disorot',
              description:
                'Seret untuk mengurutkan. Kartu di beranda tampil persis seurutan daftar ini. Kosongkan daftarnya kalau bagian ini tidak ingin ditampilkan sama sekali. Foto tiap kartu diatur di entri programnya.',
              itemLabel: (props) => props.value || 'Pilih program',
            }),
          },
          {
            label: 'Bagian Program Aktif',
            description: 'Kartu besar berisi program pilihan, tepat di bawah cara kerja.',
          }
        ),
      },
    }),

    about: singleton({
      label: 'Tentang Kami',
      path: 'src/content/about/about',
      format: 'json',
      schema: {
        seo: seoFields('judul hero'),
        hero: fields.object(
          {
            eyebrow: fields.text({ label: 'Eyebrow' }),
            title: fields.text({ label: 'Judul utama' }),
            paragraphs: paragraphsField('Paragraf hero'),
          },
          { label: 'Hero' }
        ),
        mission: fields.object(
          {
            eyebrow: fields.text({ label: 'Eyebrow' }),
            title: fields.text({ label: 'Judul' }),
            paragraphs: paragraphsField('Paragraf'),
            growTitle: fields.text({ label: 'Judul blok kedua' }),
            growParagraphs: paragraphsField('Paragraf blok kedua'),
          },
          { label: 'Mengapa Kami Ada' }
        ),
        values: fields.object(
          {
            eyebrow: fields.text({ label: 'Eyebrow' }),
            title: fields.text({ label: 'Judul' }),
            items: fields.array(
              fields.object({
                icon: fields.select({
                  label: 'Ikon',
                  options: [
                    { label: 'Transparansi (mata)', value: 'transparansi' },
                    { label: 'Kolaborasi (orang)', value: 'kolaborasi' },
                    { label: 'Keberlanjutan (daur ulang)', value: 'keberlanjutan' },
                    { label: 'Dampak (target)', value: 'dampak' },
                  ],
                  defaultValue: 'transparansi',
                }),
                title: fields.text({ label: 'Judul nilai' }),
                desc: fields.text({ label: 'Deskripsi', multiline: true }),
              }),
              { label: 'Nilai', itemLabel: (props) => props.fields.title.value || 'Nilai' }
            ),
          },
          { label: 'Nilai yang Kami Pegang' }
        ),
        cta: fields.object(
          {
            title: fields.text({ label: 'Judul' }),
            text: fields.text({ label: 'Teks', multiline: true }),
          },
          { label: 'Ajakan (CTA)' }
        ),
      },
    }),
  },
  collections: {
    programs: collection({
      label: 'Program',
      slugField: 'label',
      path: 'src/content/programs/*',
      format: { data: 'yaml' },
      schema: {
        label: fields.slug({ name: { label: 'Nama Program' } }),
        pintu: fields.select({
          label: 'Pintu',
          description: 'Pintu berbagi tempat program ini bernaung.',
          // Opsi diturunkan dari PINTU (consts.ts) — satu sumber daftar pintu.
          // Label mempertahankan format lama "Berbagi X (Id)".
          options: PINTU.map((p) => ({
            label: `${p.label} (${p.id[0].toUpperCase()}${p.id.slice(1)})`,
            value: p.id,
          })),
          defaultValue: 'food',
        }),
        order: fields.integer({
          label: 'Urutan',
          description: 'Makin kecil makin dulu tampil di kategorinya.',
          defaultValue: 0,
        }),
        active: fields.checkbox({
          label: 'Aktif (sudah dibuka)',
          description: 'Aktif + isi Detail terisi = program dapat halaman sendiri. Nonaktif tampil "Segera Hadir".',
        }),
        image: fields.image({
          label: 'Foto kartu beranda',
          description:
            'Dipakai saat program ini disorot di beranda (atur di menu Beranda). Rasio lanskap, minimal 900x560. Kosongkan untuk memakai foto bawaan.',
          // Unggahan mendarat di src/assets, bukan public/, supaya foto lewat
          // astro:assets. publicPath wajib persis sama dengan kunci glob di
          // src/lib/programs.ts.
          directory: 'src/assets/programs',
          publicPath: '/src/assets/programs/',
        }),
        summary: fields.text({
          label: 'Ringkasan',
          description: 'Deskripsi singkat untuk kartu program & menu.',
          multiline: true,
        }),
        detail: fields.object(
          {
            eyebrow: fields.text({ label: 'Eyebrow', defaultValue: 'PROGRAM AKTIF' }),
            description: fields.text({ label: 'Deskripsi halaman', multiline: true }),
            features: fields.array(fields.text({ label: 'Poin' }), {
              label: 'Poin keunggulan',
              itemLabel: (props) => props.value || 'Poin',
            }),
          },
          {
            label: 'Detail halaman',
            description: 'Hanya perlu diisi untuk program aktif yang punya halaman sendiri.',
          }
        ),
      },
    }),

    // Donor institusional (komunitas atau perusahaan) yang memberi rutin,
    // lintas program — lihat design.md keputusan #1 dan #2. Publish gate dan
    // pola field meniru `programs`: active + Detail.description terisi = dapat
    // halaman sendiri.
    organisasi: collection({
      label: 'Organisasi',
      slugField: 'label',
      path: 'src/content/organisasi/*',
      format: { data: 'yaml' },
      schema: {
        label: fields.slug({ name: { label: 'Nama Organisasi' } }),
        logo: fields.image({
          label: 'Logo',
          description: 'Kosongkan untuk memakai placeholder.',
          // Logo kecil, tidak lewat astro:assets, sama seperti pola pengecualian
          // unggahan non-galeri lain di situs ini (mis. laporan PDF jejak).
          directory: 'public/uploads/organisasi',
          publicPath: '/uploads/organisasi/',
        }),
        summary: fields.text({
          label: 'Ringkasan',
          description: 'Deskripsi singkat untuk kartu di daftar organisasi.',
          multiline: true,
        }),
        detail: fields.object(
          {
            description: fields.text({ label: 'Deskripsi halaman', multiline: true }),
            since: fields.text({
              label: 'Berkontribusi sejak',
              description: 'Ditulis apa adanya, contoh: 2023, atau Januari 2023.',
            }),
            instagram: fields.text({
              label: 'Instagram (opsional)',
              description: 'Handle, tanpa @. Kosongkan bila tidak ada.',
            }),
            website: fields.text({ label: 'Website (opsional)', description: 'Kosongkan bila tidak ada.' }),
          },
          {
            label: 'Detail halaman',
            description: 'Hanya perlu diisi untuk organisasi aktif yang punya halaman sendiri.',
          }
        ),
        active: fields.checkbox({
          label: 'Aktif (tampil di direktori)',
          description:
            'Aktif + isi Detail terisi = organisasi dapat halaman sendiri. Nonaktif tidak tampil di /organisasi/.',
        }),
      },
    }),

    // Jejak = lapisan eksekusi di atas program: satu program berjalan berkali-
    // kali, tiap kali menghasilkan foto, angka, dan cerita. Body naratif pakai
    // Markdoc (.mdoc) — ekstensi ini WAJIB sepakat dengan content.config.ts,
    // kalau mismatch Keystatic diam menampilkan nol entry.
    jejak: collection({
      label: 'Jejak',
      slugField: 'title',
      path: 'src/content/jejak/*',
      format: { contentField: 'body' },
      schema: {
        title: fields.slug({
          name: { label: 'Judul' },
          slug: {
            label: 'Slug',
            description: 'Ikuti konvensi program-slug-YYYY-MM-DD, contoh: jumat-berkah-2026-07-18.',
          },
        }),
        program: fields.relationship({
          label: 'Program induk',
          description: 'Program yang jejak ini merupakan pelaksanaannya.',
          collection: 'programs',
        }),
        organisasi: fields.relationship({
          label: 'Organisasi (opsional)',
          description:
            'Isi bila jejak ini merupakan kontribusi dari donor institusional (komunitas/perusahaan) tertentu. Berdiri sendiri dari Program induk — satu organisasi boleh berkontribusi lewat program berbeda-beda.',
          collection: 'organisasi',
        }),
        date: fields.date({ label: 'Tanggal' }),
        location: fields.text({ label: 'Lokasi' }),
        points: fields.array(
          fields.object({
            label: fields.text({
              label: 'Nama titik',
              description: 'Misalnya "Taman MRT Dukuh Atas" atau "Halte Tosari". Boleh dikosongkan kalau titiknya cuma satu.',
            }),
            coordinates: fields.text({
              label: 'Koordinat',
              description:
                'Buka Google Maps, klik kanan di titiknya, pilih koordinat yang muncul paling atas, lalu tempel di sini. Menempel URL halaman Google Maps apa adanya juga bisa.',
            }),
          }),
          {
            label: 'Titik lokasi',
            description:
              'Opsional, untuk menampilkan peta di halaman jejak. Boleh lebih dari satu kalau penyalurannya berpindah beberapa tempat; semuanya tampil di satu peta, bernomor sesuai urutan daftar ini. Kosongkan kalau tak perlu peta.',
            itemLabel: (props) => props.fields.label.value || props.fields.coordinates.value || 'Titik',
          }
        ),
        summary: fields.text({ label: 'Ringkasan', multiline: true }),
        metrics: fields.array(
          fields.object({
            label: fields.text({
              label: 'Label',
              description:
                'Pakai salah satu label baku ini supaya angkanya ikut tampil di seksi Dampak beranda: porsi, mitra umkm, relawan, penerima, donasi tersalur. Agen lapangan dihitung di dalam "relawan", bukan label sendiri, supaya satu orang tak terhitung dua kali. Label lain tetap tersimpan dan ikut dijumlah, hanya urutannya mengekor di belakang.',
            }),
            value: fields.integer({ label: 'Nilai' }),
          }),
          {
            label: 'Metrik',
            description:
              'Angka hasil penyaluran ini. Label senada digabung saat agregasi (huruf besar/kecil diabaikan), jadi tulis persis sama antar entri. Isi "mitra umkm" dan "relawan" juga, bukan cuma porsi dan penerima, karena dua angka itu yang membuktikan cerita ekosistem di beranda.',
            itemLabel: (props) =>
              props.fields.label.value
                ? `${props.fields.label.value}: ${props.fields.value.value ?? ''}`
                : 'Metrik',
          }
        ),
        // Foto jejak disimpan di src/assets/jejak, BUKAN public/: hanya berkas
        // di dalam src/ yang lewat pipeline astro:assets (webp, beberapa lebar,
        // dimensi terbaca). Yang perlu dijaga cuma dua hal:
        //   directory  = lokasi berkas sungguhan di repo (tempat unggah/hapus),
        //   publicPath = awalan string yang ditulis ke frontmatter.
        // publicPath sengaja '/src/assets/jejak/' supaya nilai di .mdoc persis
        // sama dengan kunci import.meta.glob di src/lib/jejak.ts. Kalau salah
        // satu diubah, ubah keduanya bersamaan atau pemetaan foto putus.
        // Pratinjau di admin tetap jalan: Keystatic membaca isi berkas lewat
        // API-nya sendiri (blob URL), bukan lewat URL publik situs.
        //
        // Foto dibungkus object supaya `alt` dan `caption` punya rumah. Dulu
        // field ini cuma path telanjang, dan karena tak ada tempat menyimpan
        // keterangan, tiap pemakai <Image> terpaksa menulis alt="" untuk
        // memuaskan Astro (yang menolak alt undefined) — hasilnya seluruh foto
        // lapangan tak terbaca Google Images maupun pembaca layar.
        //
        // Dua-duanya OPSIONAL dan memang boleh kosong. Galeri satu jejak bisa
        // belasan foto; mewajibkan alt di tiap foto cuma memancing editor
        // mengetik asal. Yang kosong jatuh ke alt turunan judul jejak di
        // src/lib/jejak.ts, jadi kosong tetap aman dan tak pernah kembali ke ""
        cover: fields.object(
          {
            image: fields.image({
              label: 'Gambar',
              directory: 'src/assets/jejak',
              publicPath: '/src/assets/jejak/',
            }),
            alt: fields.text({
              label: 'Alt (deskripsi untuk yang tak melihat foto)',
              description:
                'Kosongkan kalau foto ini tak punya kekhususan; sistem akan memakai judul jejak. Isi kalau isinya perlu dijelaskan, misal "Pengurus panti menerima paket di teras".',
            }),
            caption: fields.text({
              label: 'Keterangan (tampil di bawah foto besar)',
              description:
                'Terlihat pengunjung saat foto dibuka. Ini tempat cerita: siapa, sedang apa, kapan. Kosongkan kalau tak ada yang perlu diceritakan.',
              multiline: true,
            }),
          },
          { label: 'Gambar sampul' }
        ),
        gallery: fields.array(
          fields.object(
            {
              image: fields.image({
                label: 'Gambar',
                directory: 'src/assets/jejak',
                publicPath: '/src/assets/jejak/',
              }),
              alt: fields.text({ label: 'Alt (opsional)' }),
              caption: fields.text({ label: 'Keterangan (opsional)', multiline: true }),
            },
            { label: 'Foto' }
          ),
          {
            label: 'Galeri',
            itemLabel: (props) => props.fields.image.value?.filename || 'Foto',
          }
        ),
        // Video ditaruh sesudah galeri karena posisinya di halaman juga di situ,
        // tepat di bawah foto. Berbeda dari foto, berkas videonya TIDAK diunggah
        // ke repo: satu menit rekaman ponsel sudah puluhan megabyte, dan repo
        // ini ikut ter-clone tiap kali CI membangun situs. Yang disimpan hanya
        // link, dan halaman baru memuat pemutarnya setelah pengunjung menekan
        // play (lihat VideoEmbed.astro).
        video: fields.object(
          {
            url: fields.text({
              label: 'Link video',
              description:
                'Tempel link apa adanya, bentuknya tidak perlu dirapikan dulu. Google Drive, YouTube, dan Vimeo jadi pemutar di halaman ini, dalam bentuk penulisan mana pun (link Bagikan, /preview, /embed, /shorts, bahkan tanpa https:// di depan). Bisa juga berkas yang diunggah manual ke public/uploads/jejak/, ditulis sebagai /uploads/jejak/nama.mp4. Link yang tidak bisa dipasang sebagai pemutar, misalnya folder Drive, Instagram, atau TikTok, tetap tampil sebagai tautan keluar di bawah foto. Khusus Drive, berkasnya wajib dibagikan sebagai "Siapa saja yang memiliki link", kalau tidak pengunjung cuma melihat permintaan akses. Kosongkan kalau jejak ini tanpa video.',
            }),
            poster: fields.image({
              label: 'Poster video',
              description:
                'Gambar diam yang tampil sebelum video diputar. Kosongkan untuk memakai gambar sampul jejak ini. Selama belum diputar, tak ada satu pun permintaan ke server YouTube, jadi halaman tetap ringan dan tak menitipkan pengunjung ke pihak ketiga.',
              directory: 'src/assets/jejak',
              publicPath: '/src/assets/jejak/',
            }),
            caption: fields.text({
              label: 'Keterangan video',
              description: 'Satu kalimat pendek di bawah pemutar, misalnya "Dokumentasi penyaluran, 31 Juli 2026". Boleh dikosongkan.',
            }),
            orientation: fields.select({
              label: 'Orientasi video',
              description:
                'Pilih Tegak untuk rekaman ponsel yang dipegang berdiri (termasuk Shorts dan Reels). Salah pilih tidak merusak apa pun, videonya hanya terapit pita hitam.',
              options: [
                { label: 'Mendatar (16:9)', value: 'landscape' },
                { label: 'Tegak (9:16)', value: 'portrait' },
              ],
              defaultValue: 'landscape',
            }),
          },
          {
            label: 'Video dokumentasi',
            description: 'Opsional. Tampil di bawah foto, di atas angka penyaluran.',
          }
        ),
        // Laporan siap-jadi (mis. ringkasan ESG/CSR), unggahan manual editor —
        // tanpa generate otomatis (design.md keputusan #6). Disajikan apa
        // adanya dari public/, sama seperti video berkas manual di atas.
        reportPdf: fields.file({
          label: 'Laporan PDF (opsional)',
          description:
            'Mis. ringkasan ESG/CSR yang sudah disusun manual. Unggah PDF yang sudah dikompres, situs tidak mengompresnya otomatis.',
          directory: 'public/uploads/jejak-reports',
          publicPath: '/uploads/jejak-reports/',
        }),
        published: fields.checkbox({
          label: 'Terbit',
          description: 'Hanya jejak terbit yang tampil di situs dan ikut agregasi dampak.',
        }),
        body: fields.markdoc({
          label: 'Cerita',
          options: { image: false, codeBlock: false, table: false },
        }),
      },
    }),
  },
});
