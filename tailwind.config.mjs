/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts}'],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: '#FFD900',
          blue: '#1D46B9',
          // Satu-satunya brand orange. Nilai vivid ini juga dipakai pintu
          // Makanan (consts PINTU.food) & ikon FEATURES — jaga tetap sama.
          orange: '#F4791D',
          orangeDark: '#C25D0F',
          orangeTint: '#FDEEE1',
          blueTint: '#E3EAFB',
        },
        // Netral hangat untuk bidang seksi yang berdampingan dengan hero kuning.
        // gray-50 condong biru dan terasa dingin di sebelah kuning; ini padanan
        // hangatnya. Dipakai sebagai latar seksi, bukan sebagai latar kartu.
        surface: {
          warm: '#F7F6F3',
        },
        ink: '#0F172A',
        muted: '#505D6F',
        border: '#EEF0F3',
        gray: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          300: '#B4BCC8',
          400: '#687281',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      // Skala tipografi tunggal — step dirapatkan agar hierarki jelas & selaras
      // dengan ukuran default Tailwind (biar `text-base`/`text-sm`/`text-xs`
      // yang tercecer melebur ke nilai token, bukan dua sistem yang beda 0.5-1px).
      // Body 16 = text-base; body-sm 14 = text-sm; micro 12 = text-xs. Heading
      // naik rata 22→26→30→34→40. `heading-md`/`heading-xl` dipensiun (duplikat/
      // tak terpakai) — angka stat kini responsif heading-sm→heading-lg.
      // Tiap token bawa lineHeight + letterSpacing sendiri (skala = sumber tunggal
      // ritme vertikal & tracking, bukan util tersebar). Prinsip diadopsi dari
      // tipografi OpenAI (bukan font-nya — tetap Plus Jakarta Sans): tracking
      // OPTIK menyempit seiring ukuran (display -0.03em, heading -0.02, body
      // -0.01), leading KONTRAS (display nyaris solid ~1.05, body lega ~1.6).
      // Karena token sudah atur ini, util `tracking-tight`/`leading-tight` dibuang
      // agar token yang berlaku; weight heading turun ke bold (700), hierarki
      // dari ukuran+tracking bukan ketebalan.
      fontSize: {
        // Label terkecil. Ada karena peran ini terus muncul (label huruf besar
        // berjarak lebar dan keterangan kecil di dalam kartu) dan tiap kali
        // orang menulis 11px mentah di scoped style karena micro terasa terlalu
        // besar. Sekarang angkanya satu dan tercatat.
        label: ['11px', { lineHeight: '1.35', letterSpacing: '0.01em' }],
        micro: ['12px', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
        eyebrow: ['13px', { lineHeight: '1.2', letterSpacing: '0' }],
        'body-sm': ['14px', { lineHeight: '1.55', letterSpacing: '-0.01em' }],
        body: ['16px', { lineHeight: '1.6', letterSpacing: '-0.01em' }],
        'title-sm': ['18px', { lineHeight: '1.35', letterSpacing: '-0.015em' }],
        title: ['22px', { lineHeight: '1.3', letterSpacing: '-0.015em' }],
        'heading-sm': ['26px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        heading: ['30px', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'heading-lg': ['34px', { lineHeight: '1.12', letterSpacing: '-0.025em' }],
        display: ['40px', { lineHeight: '1.08', letterSpacing: '-0.03em' }],
        'display-lg': ['56px', { lineHeight: '1.04', letterSpacing: '-0.03em' }],
      },
      borderRadius: {
        card: '20px',
      },
      // Skala shadow terpusat — hindari nilai arbitrary yang sedikit-beda di
      // tiap komponen. card=permukaan besar, cardSoft=lebih lembut,
      // cardSm=kartu kecil/hover, menu=panel mega-menu, pill=badge gelap.
      boxShadow: {
        card: '0 20px 40px -24px rgba(15,23,42,0.22)',
        cardSoft: '0 20px 40px -24px rgba(15,23,42,0.18)',
        cardSm: '0 12px 24px -16px rgba(15,23,42,0.25)',
        menu: '0 24px 48px -24px rgba(15,23,42,0.22)',
        pill: '0 8px 20px -8px rgba(15,23,42,0.5)',
      },
      screens: {
        nav: '860px',
      },
    },
  },
  plugins: [],
};
