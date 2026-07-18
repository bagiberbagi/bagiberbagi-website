import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const legal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/legal' }),
  schema: z.object({
    title: z.string(),
    eyebrow: z.string(),
    intro: z.string(),
    closing: z.string(),
    updatedAt: z.string(),
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
  }),
});

const faqs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/faqs' }),
  schema: z.object({
    q: z.string(),
    a: z.string(),
    category: z
      .enum(['umum', 'donasi', 'penyaluran', 'kemitraan', 'kontak'])
      .default('umum'),
  }),
});

const programs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/programs' }),
  schema: z.object({
    label: z.string(),
    disabled: z.boolean(),
  }),
});

const footerCols = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/footer-cols' }),
  schema: z.object({
    title: z.string(),
    links: z.array(
      z.object({
        label: z.string(),
        href: z.string(),
        target: z.enum(['_self', '_blank']).optional(),
      })
    ),
  }),
});

export const collections = { legal, settings, faqs, programs, footerCols };
