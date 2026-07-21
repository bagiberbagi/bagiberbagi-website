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
      fontSize: {
        micro: '11px',
        eyebrow: '13px',
        'body-sm': '14.5px',
        body: '15px',
        'title-sm': '17px',
        title: '22px',
        'heading-sm': '26px',
        heading: '28px',
        'heading-md': '30px',
        'heading-lg': '32px',
        'heading-xl': '34px',
        display: '38px',
        'display-lg': '56px',
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
