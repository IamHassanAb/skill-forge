/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        terracotta: '#C2624A',
        'terracotta-dim': 'rgba(194,98,74,0.1)',
        'terracotta-border': 'rgba(194,98,74,0.22)',
        'amber-score': '#C9912A',
        's-bg': '#110D0B',
        's-1': '#1C1410',
        's-2': '#241912',
        's-border': '#2A1E16',
        's-border-2': '#3D2820',
        'light-bg':      '#FAF6F1',
        'light-s1':      '#F2EBE3',
        'light-s2':      '#EDE4D8',
        'light-border':  '#DDD0C4',
        'light-border2': '#C8B8A8',
        'light-t1':      '#2A1E16',
        'light-t2':      '#5A3828',
        'light-t3':      '#8C7060',
        'light-t4':      '#A89880',
        accent: '#c8f135',
        surface: '#111111',
        card: '#1a1a1a',
        border: '#2a2a2a',
      },
      fontFamily: {
        serif: ['Lora', 'Newsreader', 'serif'],
        sans: ['DM Sans', 'Manrope', 'sans-serif'],
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

