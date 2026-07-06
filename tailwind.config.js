/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: {
          50: '#FFFDF9',
          100: '#FAFAF8',
          200: '#F8F7F4',
          300: '#F2F0EB',
          400: '#E8E5DE',
          500: '#D8D4CB',
        },
        ink: {
          50: '#F5F4F2',
          100: '#E5E3DF',
          200: '#C9C6BF',
          300: '#A8A49B',
          400: '#7A766C',
          500: '#5C5851',
          600: '#3F3C37',
          700: '#2A2825',
          800: '#1C1B19',
          900: '#121110',
        },
        crimson: {
          50: '#FBF3F3',
          100: '#F7E3E3',
          200: '#EFC4C4',
          300: '#E29B9B',
          400: '#D06B6B',
          500: '#C0392B',
          600: '#A93226',
          700: '#8B2A20',
          800: '#6E2219',
          900: '#561B14',
        },
        accent: {
          gold: '#B8893A',
          sage: '#6B8E6F',
          blue: '#4A6FA5',
        },
      },
      fontFamily: {
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      letterSpacing: {
        editorial: '0.01em',
        wide2: '0.08em',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(28,27,25,0.04), 0 4px 12px rgba(28,27,25,0.04)',
        card: '0 1px 3px rgba(28,27,25,0.05), 0 8px 24px rgba(28,27,25,0.06)',
        lift: '0 4px 12px rgba(28,27,25,0.08), 0 16px 40px rgba(28,27,25,0.08)',
        inset: 'inset 0 1px 2px rgba(28,27,25,0.06)',
        crimson: '0 1px 3px rgba(192,57,43,0.12), 0 8px 24px rgba(192,57,43,0.10)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'blink-caret': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'fade-up': 'fade-up 0.5s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'pulse-soft': 'pulse-soft 1.6s ease-in-out infinite',
        'blink-caret': 'blink-caret 1s step-end infinite',
      },
    },
  },
  plugins: [],
};
