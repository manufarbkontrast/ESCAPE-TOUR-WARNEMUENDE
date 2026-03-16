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
        // Dark theme — true blacks
        dark: {
          50: '#f5f5f5',
          100: '#e5e5e5',
          200: '#d4d4d4',
          300: '#a3a3a3',
          400: '#737373',
          500: '#525252',
          600: '#404040',
          700: '#262626',
          800: '#171717',
          900: '#0a0a0a',
          950: '#000000',
        },
        // Neon cyan accent
        neon: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#00f0ff',
          600: '#00c8d6',
          700: '#0097a3',
          800: '#007580',
          900: '#005c66',
          950: '#003d44',
        },
        // Keep sand for subtle text tones
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
        'slide-down': 'slideDown 0.3s ease-out',
        'bounce-in': 'bounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'neon-pulse': 'neonPulse 2s ease-in-out infinite',
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
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        neonPulse: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0, 240, 255, 0.3), 0 0 20px rgba(0, 240, 255, 0.1)' },
          '50%': { boxShadow: '0 0 10px rgba(0, 240, 255, 0.5), 0 0 40px rgba(0, 240, 255, 0.2)' },
        },
      },
      boxShadow: {
        'neon': '0 0 5px rgba(0, 240, 255, 0.3), 0 0 20px rgba(0, 240, 255, 0.1)',
        'neon-lg': '0 0 10px rgba(0, 240, 255, 0.4), 0 0 40px rgba(0, 240, 255, 0.15)',
        'neon-xl': '0 0 15px rgba(0, 240, 255, 0.5), 0 0 60px rgba(0, 240, 255, 0.2)',
      },
    },
  },
  plugins: [],
}

export default config
