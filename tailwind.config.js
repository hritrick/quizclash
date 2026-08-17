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
          50: '#FDFBF7',
          100: '#F6F2EA',
          200: '#EBE4D5',
          300: '#DDD1BD',
          800: '#181715',
          900: '#11100F',
          950: '#0A0A09',
        },
        accent: {
          DEFAULT: '#D4AF37', // Antique Gold
          hover: '#C29B28',
          light: '#FFFDF5',
          dark: '#E5C158',
          glow: 'rgba(212, 175, 55, 0.25)',
        },
        crimson: {
          DEFAULT: '#B91C1C',
          light: '#FEF2F2',
          dark: '#991B1B',
          glow: 'rgba(185, 28, 28, 0.2)',
        },
        emeraldCustom: {
          DEFAULT: '#047857',
          light: '#ECFDF5',
          dark: '#065F46',
          glow: 'rgba(4, 120, 87, 0.2)',
        }
      },
      boxShadow: {
        'subtle': '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
        'elevated': '0 12px 36px -6px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
        'glow-accent': '0 0 25px -5px rgba(212, 175, 55, 0.4)',
        'glow-emerald': '0 0 25px -5px rgba(4, 120, 87, 0.4)',
        'glow-crimson': '0 0 25px -5px rgba(185, 28, 28, 0.4)',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-6px)' },
          '40%, 80%': { transform: 'translateX(6px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        }
      },
      animation: {
        shake: 'shake 0.4s cubic-bezier(.36,.07,.19,.97) both',
        float: 'float 4s ease-in-out infinite',
        shimmer: 'shimmer 2s infinite',
      }
    },
  },
  plugins: [],
}
