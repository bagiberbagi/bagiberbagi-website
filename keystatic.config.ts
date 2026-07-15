import { collection, config, fields, singleton } from '@keystatic/core';

export default config({
  storage: {
    kind: 'cloud',
  },
  cloud: {
    project: 'bagiberbagi/bagiberbagi-website',
  },
  singletons: {
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
  },
  collections: {
    faqs: collection({
      label: 'FAQ',
      slugField: 'q',
      path: 'src/content/faqs/*',
      format: { data: 'yaml' },
      schema: {
        q: fields.text({ label: 'Pertanyaan' }),
        a: fields.text({ label: 'Jawaban', multiline: true }),
      },
    }),
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
    footerCols: collection({
      label: 'Kolom Footer',
      slugField: 'title',
      path: 'src/content/footer-cols/*',
      format: { data: 'yaml' },
      schema: {
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
          { label: 'Link', itemLabel: (props) => props.fields.label.value || 'Link' }
        ),
      },
    }),
  },
});
