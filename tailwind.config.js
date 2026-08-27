/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand primary: automotive/ev-inspired steel-blue palette
        primary: {
          50: '#f3f8fb',
          100: '#e6f1f6',
          200: '#cfe6ee',
          300: '#9dd1e0',
          400: '#53b4cc',
          500: '#0b94b9',
          600: '#077a93',
          700: '#05586a',
          800: '#033a46',
          900: '#02242b',
        },
        workshop: {
          amber: '#f59e0b',
          green: '#10b981',
          red: '#ef4444',
          blue: '#3b82f6',
          gray: '#6b7280',
        },
      },
    },
  },
  plugins: [],
};
