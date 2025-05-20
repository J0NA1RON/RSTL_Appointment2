/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
      },
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      animation: {
        'calendar-pulse': 'calendarPulse 0.5s cubic-bezier(0.4, 0, 0.6, 1)',
        'selected-ring': 'selectedRing 0.4s cubic-bezier(0.4, 0, 0.6, 1)',
      },
      keyframes: {
        calendarPulse: {
          '0%': { boxShadow: '0 0 0 0 rgba(59,130,246,0.5)' },
          '70%': { boxShadow: '0 0 0 10px rgba(59,130,246,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(59,130,246,0)' },
        },
        selectedRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(59,130,246,0.7)' },
          '100%': { boxShadow: '0 0 0 4px rgba(59,130,246,0.2)' },
        },
      },
    },
  },
  plugins: [],
}; 