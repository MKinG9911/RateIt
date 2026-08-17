/** @type {import('tailwindcss').Config} */
function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgb(var(${variableName}) / ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
}

module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: withOpacity('--color-bg-rgb'),
          card: withOpacity('--color-bg-card-rgb'),
          elevated: withOpacity('--color-bg-elevated-rgb'),
          hover: withOpacity('--color-bg-hover-rgb'),
        },
        primary: {
          DEFAULT: withOpacity('--color-primary-rgb'),
          hover: withOpacity('--color-primary-hover-rgb'),
          light: withOpacity('--color-primary-light-rgb'),
          dark: withOpacity('--color-primary-dark-rgb'),
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
          DEFAULT: withOpacity('--color-surface-rgb'),
          light: withOpacity('--color-surface-light-rgb'),
          border: withOpacity('--color-surface-border-rgb'),
        },
        text: {
          primary: withOpacity('--color-text-primary-rgb'),
          secondary: withOpacity('--color-text-secondary-rgb'),
          muted: withOpacity('--color-text-muted-rgb'),
        },
        star: withOpacity('--color-star-rgb'),
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['var(--font-nunito)', 'Nunito', 'system-ui', 'sans-serif'],
        brand: ['var(--font-nunito)', 'Nunito', 'system-ui', 'sans-serif'],
        nunito: ['var(--font-nunito)', 'Nunito', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
      },
    },
  },
  plugins: [],
};
