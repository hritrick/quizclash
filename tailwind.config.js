/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      colors: {
        paper: {
          50: '#FAF8F5',
          100: '#F4F0E8',
          200: '#E8E1D3',
          300: '#DCD1BD',
          800: '#1C1A17',
          900: '#121110',
          950: '#0B0A09',
        },
        accent: {
          DEFAULT: '#C59B27', // Antique Gold
          hover: '#B38B1E',
          light: '#F8F3E6',
          dark: '#E2BD56',
        },
        crimson: {
          DEFAULT: '#9E2A2B',
          light: '#FDF2F2',
          dark: '#7A1C1D',
        },
        emeraldCustom: {
          DEFAULT: '#2D6A4F',
          light: '#F0F7F4',
          dark: '#1B4332',
        }
      },
      boxShadow: {
        'subtle': '0 2px 10px rgba(0, 0, 0, 0.03)',
        'editorial': '0 10px 30px -10px rgba(0, 0, 0, 0.08)',
        'editorial-dark': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
