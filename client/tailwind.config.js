/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0A0807',
          900: '#14110F',
          800: '#231E1B',
          700: '#342E2A',
          600: '#4D4540',
        },
        cream: {
          50: '#FFFFFF',
          100: '#FDFBF7',
          200: '#FBF6EE',
          300: '#F4ECE0',
          400: '#E8DCС8',
        },
        accent: {
          amber: '#F2A93B',
          'amber-hover': '#E09627',
          coral: '#FF5A4E',
          'coral-hover': '#E64337',
          teal: '#1F8A70',
          'teal-hover': '#166E58',
          violet: '#7C4DFF',
          'violet-hover': '#6535E6',
        },
        tile: {
          red: '#E63946',
          blue: '#1D3557',
          teal: '#1F8A70',
          amber: '#E76F51',
          yellow: '#F4A261',
          violet: '#6C5CE7',
        }
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'game-tile': '0 6px 0 0 rgba(0, 0, 0, 0.25)',
        'game-tile-active': '0 2px 0 0 rgba(0, 0, 0, 0.25)',
        'card-warm': '0 10px 30px -5px rgba(20, 17, 15, 0.08)',
        'buzzer': '0 8px 0 0 #B27B22',
        'buzzer-active': '0 2px 0 0 #B27B22',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-6px)' },
          '40%, 80%': { transform: 'translateX(6px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.03)' },
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.85)' },
          '70%': { transform: 'scale(1.05)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        shake: 'shake 0.4s ease-in-out',
        'pulse-glow': 'pulseGlow 2s infinite ease-in-out',
        'pop-in': 'popIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }
    },
  },
  plugins: [],
};
