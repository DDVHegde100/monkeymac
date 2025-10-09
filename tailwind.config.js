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
        'bg-primary': '#1a1a1a',
        'bg-secondary': '#2a2a2a',
        'text-primary': '#ffffff',
        'text-secondary': '#b8b8b8',
        'accent': '#ffd700',
        'correct': '#00ff00',
        'incorrect': '#ff0000',
      },
      fontFamily: {
        'mono': ['Fira Code', 'Monaco', 'Cascadia Code', 'Ubuntu Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
