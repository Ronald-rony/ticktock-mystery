/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      borderWidth: {
        3: '3px',
      },
      fontFamily: {
        display: [
          '"Fredoka"',
          '"Nunito"',
          '"SF Pro Rounded"',
          '"Arial Rounded MT Bold"',
          'ui-rounded',
          'system-ui',
          'sans-serif',
        ],
        body: [
          '"Nunito"',
          '"SF Pro Rounded"',
          '"Segoe UI"',
          'ui-rounded',
          'system-ui',
          'sans-serif',
        ],
      },
      colors: {
        cream: '#FFF9ED',
        butter: '#FFF1C9',
        coral: {
          400: '#FF7579',
          500: '#FF5A5F',
          600: '#E03E44',
        },
        skytoy: {
          400: '#4FC3F7',
          500: '#29B6F6',
          600: '#0288D1',
        },
        grape: {
          400: '#B17AEF',
          500: '#9B5DE5',
          600: '#7B3CC8',
        },
        leaf: {
          400: '#6EE052',
          500: '#58CC02',
          600: '#46A302',
        },
        sunny: {
          400: '#FFD43B',
          500: '#FFC800',
          600: '#E5A400',
        },
      },
      animation: {
        'float-slow': 'floatSlow 4s ease-in-out infinite',
        'pop-in': 'popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'sparkle': 'sparkle 1.8s ease-in-out infinite',
      },
      keyframes: {
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        popIn: {
          '0%': { transform: 'scale(0.65)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-6deg)' },
          '75%': { transform: 'rotate(6deg)' },
        },
        sparkle: {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)', opacity: '0.9' },
          '50%': { transform: 'scale(1.22) rotate(12deg)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
