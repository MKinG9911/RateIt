/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Dark theme palette matching the design
        background: {
          DEFAULT: '#0B0E14',
          card: '#141820',
          elevated: '#1A1F2E',
          hover: '#222838',
        },
        primary: {
          DEFAULT: '#8B5CF6',
          hover: '#7C3AED',
          light: '#A78BFA',
          dark: '#6D28D9',
        },
        accent: {
          green: '#22C55E',
          red: '#EF4444',
          yellow: '#F59E0B',
          blue: '#3B82F6',
          pink: '#EC4899',
          orange: '#F97316',
        },
        surface: {
          DEFAULT: '#1E2433',
          light: '#2A3142',
          border: '#2D3548',
        },
        text: {
          primary: '#F1F5F9',
          secondary: '#94A3B8',
          muted: '#64748B',
        },
        star: '#F59E0B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
      },
    },
  },
  plugins: [],
};
