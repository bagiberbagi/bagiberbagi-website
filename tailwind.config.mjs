/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts}'],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: '#FFD900',
          blue: '#1D46B9',
          orange: '#C25400',
          orangeDark: '#A54700',
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
      screens: {
        nav: '860px',
      },
    },
  },
  plugins: [],
};
