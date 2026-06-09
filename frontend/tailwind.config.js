/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          ink: '#18261f',
          forest: '#244734',
          moss: '#3f6b53',
          sand: '#f6f1e9',
          cream: '#fff8ef',
          coral: '#ef7d57',
          gold: '#d8b16a',
          mist: '#d9e4d7',
        },
      },
      fontFamily: {
        sans: ['Avenir Next', 'Montserrat', 'Helvetica Neue', 'sans-serif'],
        display: ['Futura', 'Avenir Next', 'Montserrat', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 18px 60px rgba(11, 17, 14, 0.18)',
      },
      backgroundImage: {
        'hero-grid': 'radial-gradient(circle at 1px 1px, rgba(255, 248, 239, 0.12) 1px, transparent 0)',
      },
    },
  },
  plugins: [],
};
