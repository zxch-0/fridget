/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#14211C',
        forest: {
          950: '#0C1813',
          900: '#16382A',
          800: '#1C4A37',
          700: '#245C44',
          600: '#2D6A4F',
          500: '#40916C',
        },
        mint: {
          200: '#B7E4C7',
          300: '#95D5B2',
          400: '#74C69D',
          500: '#3DDC97',
          600: '#2BB87A',
        },
        cream: {
          50: '#FBF8F3',
          100: '#F6F1E8',
          200: '#EDE4D3',
          300: '#E0D3BA',
        },
        tomato: '#E85D4C',
        paper: '#F4E7C4',
        gold: '#C4922A',
      },
      fontFamily: {
        serif: ['Fraunces', 'Iowan Old Style', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 18px 40px -24px rgba(20, 33, 28, 0.35)',
        lift: '0 24px 50px -20px rgba(20, 33, 28, 0.28)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
