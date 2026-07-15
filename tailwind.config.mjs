/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts}'],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: '#FFD900',
          blue: '#1D46B9',
          orange: '#F4791D',
        },
        ink: '#0F172A',
        muted: '#64748B',
        border: '#EEF0F3',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      screens: {
        nav: '860px',
      },
    },
  },
  plugins: [],
};
