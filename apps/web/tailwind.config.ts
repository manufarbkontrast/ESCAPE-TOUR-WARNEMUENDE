import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Maritime theme colors
        navy: {
          50: '#eef2f7',
          100: '#d5dfeb',
          200: '#abbfda',
          300: '#7d9cc4',
          400: '#5479ac',
          500: '#3a5f92',
          600: '#2d4b74',
          700: '#1e3655',
          800: '#142642',
          900: '#0b1929',
          950: '#050d17',
        },
        brass: {
          50: '#fef9ee',
          100: '#fcf0d2',
          200: '#f8dea4',
          300: '#f3c56c',
          400: '#edaa3b',
          500: '#e6921e',
          600: '#cc7514',
          700: '#a95813',
          800: '#8a4516',
          900: '#723a15',
          950: '#3e1c08',
        },
        sand: {
          50: '#faf8f5',
          100: '#f3efe8',
          200: '#e6ddd0',
          300: '#d5c7b2',
          400: '#c1ac91',
          500: '#b2977a',
          600: '#a5856a',
          700: '#8a6d58',
          800: '#715a4b',
          900: '#5d4b40',
          950: '#312721',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'bounce-in': 'bounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
