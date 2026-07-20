import { collection, config, fields, singleton } from '@keystatic/core';

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
      image: fields.text({
        label: 'Gambar share',
        description: 'Path dari root situs. Kosongkan untuk memakai gambar default.',
      }),
    },
    {
      label: 'SEO',
      description: 'Bagaimana halaman ini tampil di Google dan saat dibagikan.',
    }
  );
}

/** Tiga halaman legal berbagi bentuk yang sama; hanya id dan label yang beda. */
function legalPage(id: 'privacy' | 'terms' | 'transparency', label: string) {
  return {
    [id]: singleton({
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
    }),
  };
}

export default config({
  storage: {
    kind: 'cloud',
  },
  cloud: {
    project: 'bagiberbagi/bagiberbagi-website',
  },
  singletons: {
    // Halaman legal sengaja singleton, bukan collection: masing-masing punya
    // route hard-coded (privasi/syarat/transparansi.astro) yang memanggil
    // getEntry dengan id tetap. Sebagai collection, UI-nya menawarkan
    // tambah/hapus/rename-slug — entri baru tidak akan punya halaman, dan
    // rename atau hapus justru mematahkan route yang sudah ada.
    // Ini juga satu-satunya konten dengan body prose, jadi satu-satunya yang
    // pakai contentField; Keystatic hanya mendukung ekstensi .mdoc untuk itu.
    ...legalPage('privacy', 'Legal — Kebijakan Privasi'),
    ...legalPage('terms', 'Legal — Syarat & Ketentuan'),
    ...legalPage('transparency', 'Legal — Transparansi'),

    // SEO dipisah dari Site Settings: yang satu identitas & kontak, yang satu
    // teks yang muncul di hasil pencarian dan share preview. Dibaca dua tempat
    // sekaligus — BaseLayout (meta + JSON-LD) dan generator OG image — jadi
    // judul yang diedit di sini ikut terpakai di gambar share-nya.
    seo: singleton({
      label: 'SEO',
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
            image: fields.text({
              label: 'Gambar share',
              description: 'Kosongkan untuk memakai gambar default.',
            }),
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
      label: 'Site Settings',
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
      },
    }),
    about: singleton({
      label: 'Halaman Tentang Kami',
      path: 'src/content/about/about',
      format: 'json',
      schema: {
        seo: seoFields('judul hero'),
        hero: fields.object(
          {
            eyebrow: fields.text({ label: 'Eyebrow' }),
            title: fields.text({ label: 'Judul utama' }),
            paragraphs: fields.array(fields.text({ label: 'Paragraf', multiline: true }), {
              label: 'Paragraf hero',
              itemLabel: (props) => props.value?.slice(0, 40) || 'Paragraf',
            }),
          },
          { label: 'Hero' }
        ),
        mission: fields.object(
          {
            eyebrow: fields.text({ label: 'Eyebrow' }),
            title: fields.text({ label: 'Judul' }),
            paragraphs: fields.array(fields.text({ label: 'Paragraf', multiline: true }), {
              label: 'Paragraf',
              itemLabel: (props) => props.value?.slice(0, 40) || 'Paragraf',
            }),
            growTitle: fields.text({ label: 'Judul blok kedua' }),
            growParagraphs: fields.array(fields.text({ label: 'Paragraf', multiline: true }), {
              label: 'Paragraf blok kedua',
              itemLabel: (props) => props.value?.slice(0, 40) || 'Paragraf',
            }),
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
        label: fields.text({ label: 'Nama Program' }),
        disabled: fields.checkbox({ label: 'Nonaktif (belum dibuka)' }),
      },
    }),
  },
});
