/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}', './.storybook/preview.ts', './src/**/*.stories.{ts,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        lato: ['Lato', 'sans-serif'],
      },
      fontWeight: {
        light: '300',
        normal: '400',
        bold: '700',
      },
      colors: {
        'toast-typo-1': '#0f172b',
        muted: '#62748e',
        primary: '#d4ccb4',
        secondary: '#e5e7eb',
        tertiary: '#F6F4F0',
        'primary-black': '#464646',
        'secondary-black': '#69533F',
        'tertiary-black': '#E8E5D9',
        'custome-blue': '#5570F1',
        bg: '#f8f8f8',
        hover: '#baad8a',
        active: '#a69369',
        inactive: '#e8e5d9',
        'typo-primary': '#525252',
        'tab-bg': '#f0f0f0',
        'active-tab-bg': '#989898',
        'inactive-tab-text': '#464646',
        'active-tab-text': '#f8f8f8',
        'inactive-tab-txt': '#464646',
        'active-tab-txt': '#f8f8f8',
        'primary-gray': '#CFD3D4',
        'secondary-gray': '#83898C',
        'typo-active': '#4e3e35',
        'tab-secondary-typo': '#656565',
        'tab-secondary-active-typo': '#342721',
        'custom-brown': '#826A4C',
        'table-typo': '#3d3d3d',
      },
      keyframes: {
        'slide-in': {
          from: { transform: 'translateX(100%)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
      },
      animation: {
        'slide-in': 'slide-in 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
