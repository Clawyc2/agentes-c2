/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0f1117',
        bg2: '#181c27',
        bg3: '#1e2235',
        orange: '#f7931a',
        green: '#22c55e',
        purple: '#4f46e5',
        gold: '#92400e',
        red: '#ef4444',
        gray: '#2a2f45',
        text: '#e8eaf6',
        text2: '#8b90a8',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['Space Grotesk', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
