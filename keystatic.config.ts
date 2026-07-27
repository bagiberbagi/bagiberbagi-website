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
    directory: 'public/uploads/share',
    publicPath: '/uploads/share',
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
 * Blok SEO yang menempel di entri konten yang punya halamannya sendiri.
 * Semua opsional: dikosongkan berarti halaman memakai judul/deskripsi yang
 * diturunkan dari isinya, seperti sebelum blok ini ada.
 */
function seoFields(hint: string) {
  return fields.object(
    {
      title: fields.text({
        label: 'Judul di hasil pencarian',
        description: `Kosongkan untuk memakai ${hint}. Ideal 30–65 karakter.`,
      }),
      description: fields.text({
        label: 'Deskripsi di hasil pencarian',
        description: 'Kosongkan untuk memakai paragraf pembuka halaman. Ideal 70–160 karakter.',
        multiline: true,
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
      Halaman: ['home', 'about', 'programs', 'jejak'],
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
        defaultTitle: fields.text({ label: 'Judul default' }),
        defaultDescription: fields.text({
          label: 'Deskripsi default',
          description: 'Dipakai halaman yang belum punya deskripsi sendiri. Ideal 50–160 karakter.',
          multiline: true,
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
            title: fields.text({ label: 'Judul', description: 'Ideal 30–60 karakter.' }),
            description: fields.text({
              label: 'Deskripsi',
              description: 'Ideal 50–160 karakter.',
              multiline: true,
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
                href: fields.text({ label: 'URL / Anchor' }),
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
          directory: 'public/uploads/programs',
          publicPath: '/uploads/programs',
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
        date: fields.date({ label: 'Tanggal' }),
        location: fields.text({ label: 'Lokasi' }),
        summary: fields.text({ label: 'Ringkasan', multiline: true }),
        metrics: fields.array(
          fields.object({
            label: fields.text({ label: 'Label', description: 'Contoh: porsi, penerima, relawan.' }),
            value: fields.integer({ label: 'Nilai' }),
          }),
          {
            label: 'Metrik',
            description: 'Angka hasil. Label senada digabung saat agregasi (huruf besar/kecil diabaikan).',
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
        cover: fields.image({
          label: 'Gambar sampul',
          directory: 'src/assets/jejak',
          publicPath: '/src/assets/jejak/',
        }),
        gallery: fields.array(
          fields.image({
            label: 'Foto',
            directory: 'src/assets/jejak',
            publicPath: '/src/assets/jejak/',
          }),
          {
            label: 'Galeri',
            itemLabel: (props) => props.value?.filename || 'Foto',
          }
        ),
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
