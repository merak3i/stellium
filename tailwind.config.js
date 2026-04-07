/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        void: '#000000',
        'stellar-white': '#f0ede8',
        'stellar-dim': '#8a8680',
        // Aspect colors for Spectrum Read
        'aspect-conjunction': '#ffffff',
        'aspect-opposition': '#e84040',
        'aspect-square': '#e87040',
        'aspect-trine': '#4a7dc9',
        'aspect-sextile': '#4ac975',
        'aspect-quincunx': '#c9c04a',
      },
      fontFamily: {
        hud: ['Helvetica Neue', 'HelveticaNeue', 'Inter', 'Helvetica', 'Arial', 'sans-serif'],
        label: ['Space Grotesk', 'sans-serif'],
        display: ['Seanor', 'Syncopate', 'serif'],
      },
      letterSpacing: {
        widest: '0.3em',
        'ultra-wide': '0.5em',
      },
    },
  },
  plugins: [],
}
