/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: '#c8f135',
        surface: '#111111',
        card: '#1a1a1a',
        border: '#2a2a2a',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        badgePulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
        },
        typeIndicator: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.2' },
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.4s ease forwards',
        badgePulse: 'badgePulse 0.4s ease forwards',
        typeIndicator: 'typeIndicator 0.9s ease-in-out infinite',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

