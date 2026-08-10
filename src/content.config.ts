import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { PINTU_IDS } from './consts';

const seoOverrides = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  // fields.image menulis null saat kosong; nullish() menerima null & undefined.
  image: z.string().nullish(),
});

// Satu foto jejak: berkasnya plus keterangan yang tak bisa disimpulkan dari
// berkas itu sendiri. `alt` dan `caption` default '' supaya entri lama yang
// belum punya keduanya tetap lolos validasi, dan pembacanya yang memutuskan
// arti kosong (lihat src/lib/jejak.ts).
const jejakPhotoSchema = z.object({
  image: z.string().nullish(),
  alt: z.string().default(''),
  caption: z.string().default(''),
});

// Satu butir ketentuan program: judul yang bisa dipindai mata, plus isinya.
// Dipakai dua kali — di singleton `ketentuan` (berlaku semua program) dan di
// `programs.detail.ketentuan` (khas satu program) — supaya keduanya tak bisa
// berbeda bentuk. Keduanya default '' karena Keystatic menulis baris array
// yang fieldnya dikosongkan tanpa kunci sama sekali; pembacanya yang membuang
// butir tanpa judul atau tanpa isi (lihat src/lib/ketentuan.ts).
const ketentuanItem = z.object({
  title: z.string().default(''),
  body: z.string().default(''),
});

const legal = defineCollection({
  loader: glob({ pattern: '*.mdoc', base: './src/content/legal' }),
  schema: z.object({
    title: z.string(),
    eyebrow: z.string(),
    intro: z.string(),
    closing: z.string(),
    updatedAt: z.string(),
    seo: seoOverrides.optional(),
  }),
});

const settings = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/settings' }),
  schema: z.object({
    waNumber: z.string(),
    waNumberDisplay: z.string(),
    socials: z.object({
      instagram: z.string(),
      tiktok: z.string(),
      email: z.string(),
    }),
    statLabels: z.array(z.string()),
    statTargets: z.object({
      dana: z.number(),
      donatur: z.number(),
      berbagi: z.number(),
      area: z.number(),
    }),
    statsNote: z.string(),
    // Jadwal program berulang mingguan; menyetir hitung mundur di hero.
    // weekday: '0'=Minggu … '6'=Sabtu (nilai select Keystatic = string).
    schedule: z.object({
      weekday: z.string(),
      time: z.string(),
    }),
    // Panel "Agenda Berikutnya" di kartu hero. Semua opsional supaya beranda
    // tetap benar saat editor belum mengisinya: location kosong menyembunyikan
    // panel, targetPorsi 0 menyembunyikan bar progres. Tanggal tidak disimpan
    // di sini, dihitung dari `schedule` di klien supaya tidak basi.
    nextAgenda: z
      .object({
        location: z.string().default(''),
        targetPorsi: z.number().default(0),
        collectedPorsi: z.number().default(0),
        cutoff: z.string().default(''),
      })
      .default({ location: '', targetPorsi: 0, collectedPorsi: 0, cutoff: '' }),
  }),
});

const seo = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/seo' }),
  schema: z.object({
    siteName: z.string(),
    defaultTitle: z.string(),
    defaultDescription: z.string(),
    defaultImage: z.string(),
    organization: z.object({
      type: z.enum(['NGO', 'Organization']),
      name: z.string(),
      logo: z.string(),
      // Dua-duanya opsional dan sengaja dibiarkan kosong sampai pemilik
      // mengisinya. Keduanya masuk JSON-LD sebagai pernyataan fakta tentang
      // organisasi, jadi tebakan di sini berarti menerbitkan data palsu yang
      // dibaca mesin pencari sebagai kebenaran. Blok yang kosong tak dirender
      // sama sekali (lihat BaseLayout), jadi kosong tetap aman.
      address: z
        .object({
          locality: z.string(),
          region: z.string().default(''),
          country: z.string().default('ID'),
        })
        .nullish(),
      foundingDate: z.string().nullish(),
    }),
    pages: z.array(
      z.object({
        path: z.string(),
        title: z.string(),
        description: z.string(),
        image: z.string().nullish(),
        breadcrumbName: z.string().optional(),
        noindex: z.boolean().default(false),
      })
    ),
  }),
});

const about = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/about' }),
  schema: z.object({
    seo: seoOverrides.optional(),
    hero: z.object({
      eyebrow: z.string(),
      title: z.string(),
      paragraphs: z.array(z.string()),
    }),
    mission: z.object({
      eyebrow: z.string(),
      title: z.string(),
      paragraphs: z.array(z.string()),
      growTitle: z.string(),
      growParagraphs: z.array(z.string()),
    }),
    values: z.object({
      eyebrow: z.string(),
      title: z.string(),
      items: z.array(
        z.object({
          icon: z.enum(['transparansi', 'kolaborasi', 'keberlanjutan', 'dampak']),
          title: z.string(),
          desc: z.string(),
        })
      ),
    }),
  }),
});

const faq = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/faq' }),
  schema: z.object({
    items: z.array(
      z.object({
        q: z.string(),
        a: z.string(),
        category: z
          .enum(['umum', 'donasi', 'penyaluran', 'kemitraan', 'kontak'])
          .default('umum'),
      })
    ),
  }),
});

const programs = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/programs' }),
  schema: z.object({
    label: z.string(),
    // Pintu tempat program bernaung. Impact bukan pintu (lapisan hasil) — tak
    // ada di enum ini. Daftar id-nya tunggal di PINTU_IDS (consts.ts).
    pintu: z.enum(PINTU_IDS).default('food'),
    order: z.number().default(0),
    active: z.boolean().default(false),
    // Foto kartu sorotan (unggahan Keystatic ke src/assets/programs). Isinya
    // path string; lib/programs.ts yang memetakannya ke modul astro:assets.
    // Kosong = pakai foto bawaan. fields.image menulis null saat dikosongkan,
    // jadi nullish().
    image: z.string().nullish(),
    summary: z.string(),
    // Teks slide program di "Panggung Bergilir" beranda (ProgramStage.astro).
    // Dulu ditulis tangan di dalam komponen; sekarang milik editor. Seluruhnya
    // opsional dengan default supaya program lama tetap valid tanpa disentuh:
    // slide yang fieldnya kosong cuma kehilangan baris itu, bukan gagal build.
    // `status` sengaja tidak punya saklar sendiri — komponen menampilkannya
    // hanya selama program ini belum punya foto sendiri dan belum punya jejak
    // berfoto, jadi statusnya hilang sendiri begitu dokumentasinya masuk.
    stage: z
      .object({
        kicker: z.string().default(''),
        // Kosong = pakai `summary` program. Diisi hanya kalau slide butuh
        // kalimat yang berbeda dari ringkasan kartu/menu.
        lead: z.string().default(''),
        status: z.string().default(''),
        caption: z.string().default(''),
        ctaLabel: z.string().default('Lihat program'),
        ctaWhatsapp: z.boolean().default(false),
        ctaMessage: z.string().default(''),
      })
      .default({
        kicker: '',
        lead: '',
        status: '',
        caption: '',
        ctaLabel: 'Lihat program',
        ctaWhatsapp: false,
        ctaMessage: '',
      }),
    // Diisi hanya untuk program aktif yang punya halaman detail; program
    // "segera hadir" cukup mengosongkannya (tidak ter-route).
    detail: z
      .object({
        eyebrow: z.string().default('PROGRAM AKTIF'),
        description: z.string().default(''),
        features: z.array(z.string()).default([]),
        // Ketentuan yang cuma berlaku di program ini (tenggat pesanan, area,
        // isi paket). Duduk di dalam `detail` karena isinya khusus halaman:
        // program tanpa halaman tak punya tempat memajangnya. Yang berlaku
        // untuk semua program tinggal di singleton `ketentuan`, dan keduanya
        // digabung di src/lib/ketentuan.ts.
        ketentuan: z.array(ketentuanItem).default([]),
      })
      .default({ eyebrow: 'PROGRAM AKTIF', description: '', features: [], ketentuan: [] }),
  }),
});

// Donor institusional (komunitas atau perusahaan) yang memberi rutin, satu
// schema tanpa subtipe karena strukturnya identik — lihat design.md keputusan
// #2. Publish gate meniru programs: active + detail.description terisi.
const organisasi = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/organisasi' }),
  schema: z.object({
    label: z.string(),
    // fields.image menulis null saat dikosongkan; nullish() menerima null & undefined.
    logo: z.string().nullish(),
    summary: z.string(),
    detail: z
      .object({
        description: z.string().default(''),
        since: z.string().default(''),
        instagram: z.string().optional(),
        website: z.string().optional(),
      })
      .default({ description: '', since: '', instagram: '', website: '' }),
    active: z.boolean().default(false),
  }),
});

/**
 * Penempatan di beranda, dipisah dari isi program: program menjawab "apa ini",
 * beranda menjawab "mana yang dipajang dan urutannya". Slug di `items` adalah
 * referensi ke koleksi programs, jadi konsumen wajib membuang slug yang sudah
 * tak ada (program dihapus/rename) alih-alih percaya begitu saja.
 * fields.relationship menulis null saat entri dikosongkan.
 */
const home = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/home' }),
  schema: z.object({
    programSection: z.object({
      eyebrow: z.string().default('PROGRAM AKTIF'),
      title: z.string(),
      items: z.array(z.string().nullish()).default([]),
    }),
    // Slide pertama "Panggung Bergilir" membawa narasi seksinya, bukan narasi
    // satu program, jadi teksnya milik beranda. Sisa slide membaca `stage` di
    // entri programnya masing-masing.
    programStage: z
      .object({
        kicker: z.string().default(''),
        title: z.string().default(''),
        lead: z.string().default(''),
        // Kalimat penutup di pil slide pertama. Nama programnya ditambahkan
        // komponen di depan kalimat ini (tebal), jadi yang disimpan di sini
        // hanya lanjutannya.
        statement: z.string().default(''),
      })
      .default({ kicker: '', title: '', lead: '', statement: '' }),
  }),
});

const jejak = defineCollection({
  loader: glob({ pattern: '*.mdoc', base: './src/content/jejak' }),
  schema: z.object({
    title: z.string(),
    program: z.string(), // slug program induk (relationship)
    // Relationship opsional, lateral terhadap `program` (bukan field di
    // dalamnya): satu organisasi bisa punya jejak di beberapa program, jadi
    // slug-nya disimpan sendiri, bukan bersarang. fields.relationship menulis
    // null saat dikosongkan.
    organisasi: z.string().nullish(),
    // ISO YYYY-MM-DD sebagai string. Keystatic Cloud kadang menulis field ini
    // sebagai scalar YAML tanpa quote (`date: 2026-07-31`), yang di-parse jadi
    // Date, bukan string. Makanya di sini diterima keduanya lalu dinormalkan,
    // supaya build tak gagal tiap kali entry jejak disimpan ulang lewat CMS.
    date: z
      .union([z.string(), z.date()])
      .transform((d) => (typeof d === 'string' ? d : d.toISOString().slice(0, 10))),
    location: z.string(),
    // Titik peta, opsional dan boleh lebih dari satu: satu kali penyaluran
    // sering berpindah beberapa tempat yang berdekatan. `location` di atas tetap
    // jadi nama kawasannya, daftar ini yang memecahnya jadi titik. Koordinat
    // disimpan sebagai string apa adanya (pasangan angka atau URL Google Maps)
    // dan dibaca `lib/geo.ts`; daftar kosong berarti tak ada peta.
    points: z
      .array(
        z.object({
          label: z.string().default(''),
          coordinates: z.string().default(''),
        })
      )
      .default([]),
    summary: z.string(),
    metrics: z.array(z.object({ label: z.string(), value: z.number() })).default([]),
    // Foto = path + keterangannya, bukan path telanjang. `alt` dan `caption`
    // boleh kosong: yang mengubahnya jadi kalimat adalah src/lib/jejak.ts, yang
    // menjatuhkan alt kosong ke turunan judul jejak. Bentuk ini harus sama
    // persis dengan fields.object di keystatic.config.ts, karena admin UI yang
    // menulis berkasnya.
    // fields.image menulis null saat dikosongkan; nullish() menerima null & undefined.
    cover: jejakPhotoSchema.nullish(),
    gallery: z.array(jejakPhotoSchema.nullish()).default([]),
    // Video dokumentasi, opsional. Disimpan sebagai satu string URL, bukan enum
    // penyedia + id terpisah: editor menempelkan apa yang mereka salin dari
    // aplikasi, dan `lib/video.ts` yang membaca bentuknya. `url` kosong berarti
    // jejak ini tak punya video, dan blok videonya memang tak dirender.
    video: z
      .object({
        url: z.string().default(''),
        poster: z.string().nullish(),
        caption: z.string().default(''),
        // Rekaman lapangan hampir selalu diambil dengan ponsel tegak. Dipaksa
        // ke bingkai 16:9 hasilnya video kecil terapit dua pita hitam, jadi
        // orientasinya disimpan dan bingkainya yang menyesuaikan.
        orientation: z.enum(['landscape', 'portrait']).default('landscape'),
      })
      .default({ url: '', poster: null, caption: '', orientation: 'landscape' }),
    // Laporan PDF (mis. ESG/CSR summary) unggahan manual editor, tanpa generate
    // otomatis (design.md keputusan #6). fields.file menulis null saat
    // dikosongkan; disajikan apa adanya dari public/, bukan lewat astro:assets,
    // sama seperti foto kartu program.
    reportPdf: z.string().nullish(),
    published: z.boolean().default(false),
  }),
});

const footer = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/footer' }),
  schema: z.object({
    columns: z.array(
      z.object({
        title: z.string(),
        links: z.array(
          z.object({
            label: z.string(),
            href: z.string(),
            target: z.enum(['_self', '_blank']).optional(),
          })
        ),
      })
    ),
  }),
});

const analytics = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/analytics' }),
  schema: z.object({
    posthog: z
      .object({
        enabled: z.boolean().default(false),
        host: z.string().default(''),
        projectKey: z.string().default(''),
      })
      .default({ enabled: false, host: '', projectKey: '' }),
    umami: z
      .object({
        enabled: z.boolean().default(false),
        host: z.string().default(''),
        websiteId: z.string().default(''),
      })
      .default({ enabled: false, host: '', websiteId: '' }),
    ga4: z
      .object({ enabled: z.boolean().default(false), measurementId: z.string().default('') })
      .default({ enabled: false, measurementId: '' }),
    metaPixel: z
      .object({ enabled: z.boolean().default(false), pixelId: z.string().default('') })
      .default({ enabled: false, pixelId: '' }),
    clarity: z
      .object({ enabled: z.boolean().default(false), projectId: z.string().default('') })
      .default({ enabled: false, projectId: '' }),
    gtm: z
      .object({ enabled: z.boolean().default(false), containerId: z.string().default('') })
      .default({ enabled: false, containerId: '' }),
    consentBanner: z.boolean().default(true),
  }),
});

// ===== aksi =====
//
// Satu berkas per pintu, isinya daftar "cara ikut" pintu itu. Dulu hidup
// sebagai field `contribute` di `CATEGORY_CONTENT` (consts.ts), tempat editor
// tidak bisa menyentuhnya sama sekali; field itu sudah dihapus.
//
// SCHEMA DI SINI PERMISIF, PEMBACANYA YANG KETAT. Ini aturannya, bukan
// kelalaian. Admin Keystatic bisa menulis nilai yang tidak masuk akal tanpa
// developer di dekatnya: `fields.integer` tanpa `validation.isRequired`
// menulis `null` begitu kotaknya dikosongkan, dan `fields.array` menerima nol
// item. Kalau zod di sini menolaknya, `astro:content` melempar dan seluruh
// build mati gara-gara satu klik di CMS. Jadi semua yang bisa kosong ditulis
// `.nullish()` atau `.default([])` di sini, lalu `src/lib/aksi.ts` yang
// memutuskan mana yang layak dirender dan mana yang dibuang dengan
// `console.warn`. Pola yang sama dipakai `createImageResolver`,
// `getProgramSection()`, dan flag `misconfigured` di analytics.ts.
//
// Bentuk `mechanism` mengikuti apa yang benar-benar ditulis `fields.conditional`
// ke disk, yaitu `{ discriminant, value }`, diverifikasi lewat spike B4
// sebelum satu pembaca pun ditulis.
const aksiMechanism = z.discriminatedUnion('discriminant', [
  z.object({
    discriminant: z.literal('none'),
    // `fields.empty()` menulis null. Dibuat `unknown` supaya bentuk apa pun
    // yang datang dari sisi Keystatic tidak pernah menjatuhkan build.
    value: z.unknown().nullish(),
  }),
  z.object({
    discriminant: z.literal('conversation'),
    value: z
      .object({ message: z.string().nullish() })
      .nullish(),
  }),
  z.object({
    discriminant: z.literal('quantity'),
    value: z
      .object({
        // Dibawa sejak hari pertama dan belum dibaca siapa pun. Lima belas
        // literal "porsi" di Ajakan.astro tetap seperti sekarang; ini cuma
        // menyediakan tempatnya, bukan mesinnya.
        unit: z.string().nullish(),
        pricePerUnit: z.number().nullish(),
        presets: z.array(z.number().nullish()).default([]),
        packages: z.array(z.string().nullish()).default([]),
      })
      .nullish(),
  }),
]);

const aksiItem = z.object({
  title: z.string().default(''),
  desc: z.string().nullish(),
  // `fields.relationship` menulis null saat dikosongkan, dan slug-nya bisa
  // basi persis seperti `home.programSection.items`, jadi pembacanya wajib
  // membuang rujukan yang tak menunjuk program mana pun.
  program: z.string().nullish(),
  showOnPintu: z.boolean().default(true),
  mechanism: aksiMechanism,
});

const aksi = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/aksi' }),
  schema: z.object({ items: z.array(aksiItem).default([]) }),
});

/**
 * Ketentuan yang berlaku untuk SEMUA program, satu singleton array. Urutan
 * tampil = urutan array (bisa diseret di Keystatic), alasan yang sama dengan
 * `faq` dan `footer`: urutannya berarti, jumlahnya kecil, dan tak ada butir
 * yang perlu route sendiri.
 *
 * Isinya sengaja cuma menyatakan ulang apa yang sudah terbit di `/syarat`
 * dengan suara operasional. Kewajiban platform tetap satu pintu di sana; dua
 * dokumen yang menyatakan kewajiban tentang transaksi yang sama akan saling
 * bertentangan cepat atau lambat.
 */
const ketentuan = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/ketentuan' }),
  schema: z.object({ items: z.array(ketentuanItem).default([]) }),
});

export const collections = { legal, settings, seo, about, faq, programs, organisasi, home, jejak, footer, analytics, aksi, ketentuan };
