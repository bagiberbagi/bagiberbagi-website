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
    cta: z.object({
      title: z.string(),
      text: z.string(),
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
    summary: z.string(),
    // Diisi hanya untuk program aktif yang punya halaman detail; program
    // "segera hadir" cukup mengosongkannya (tidak ter-route).
    detail: z
      .object({
        eyebrow: z.string().default('PROGRAM AKTIF'),
        description: z.string().default(''),
        features: z.array(z.string()).default([]),
      })
      .default({ eyebrow: 'PROGRAM AKTIF', description: '', features: [] }),
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

export const collections = { legal, settings, seo, about, faq, programs, footer, analytics };
