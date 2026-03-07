import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cosmic: {
          navy: '#1A1A2E',
          dark: '#0D0D1A',
          deeper: '#070710',
        },
        gold: {
          DEFAULT: '#C9A84C',
          light: '#E5C76B',
          dim: '#8A6D2F',
        },
        celestial: '#F4F0FF',
        teal: {
          DEFAULT: '#00C9A7',
          dim: '#00856F',
        },
        purple: {
          cosmic: '#7B2FBE',
          glow: '#9D4EDD',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
        brand: ['var(--font-syne)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'cosmic-gradient': 'radial-gradient(ellipse at top, #2D1B69 0%, #1A1A2E 50%, #070710 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(43,27,97,0.4) 0%, rgba(26,26,46,0.8) 100%)',
        'gold-gradient': 'linear-gradient(135deg, #C9A84C, #E5C76B)',
        'teal-gradient': 'linear-gradient(135deg, #00C9A7, #0097A7)',
      },
      boxShadow: {
        'glow-gold': '0 0 20px rgba(201, 168, 76, 0.3)',
        'glow-teal': '0 0 20px rgba(0, 201, 167, 0.3)',
        'glow-purple': '0 0 30px rgba(123, 47, 190, 0.4)',
        'card': '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: '0.2', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
    },
  },
  plugins: [],
}

export default config
