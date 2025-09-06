/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        'background': '#FAFAFA',
        'surface': '#FFFFFF',
        'text-primary': '#0A0A0A',
        'text-secondary': '#6B7280',
        'accent': '#000000',
        'borders': '#E5E7EB',
        'subtle': '#F9FAFB',
      },
      spacing: {
        '18': '4.5rem',
      },
    },
  },
  plugins: [],
};