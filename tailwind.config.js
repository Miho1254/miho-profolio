/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/**/*.html",
    "./src/**/*.{astro,js,jsx,svelte,ts,tsx,vue}",
  ],
  darkMode: 'class',
  important: true,
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#091e3a",
          primary: "#1d4ed8",
          accent: "#1d4ed8",
          light: "#60a5fa",
          lighter: "#93c5fd",
          soft: "#f8fafc",
          surface: "#e2e8f0",
          muted: "#334155",
          onPrimary: "#FFFFFF",
          darkBg: "#0a1628",
          darkCard: "#112240",
          darkBorder: "rgba(96, 165, 250, 0.25)",
        },
        black: "#0f172a",
        "hot-pink": "#fd2d78",
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"Fira Code"', 'monospace'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'brutal': '4px 4px 0px rgba(64, 145, 255, 0.25)',
        'brutal-lg': '6px 6px 0px rgba(64, 145, 255, 0.3)',
        'brutal-dark': '4px 4px 0px rgba(64, 145, 255, 0.15)',
      },
      keyframes: {
        wipe: {
          "0%": { transform: "translateX(-100%) skewX(12deg)" },
          "100%": { transform: "translateX(200%) skewX(12deg)" },
        },
      },
      animation: {
        wipe: "wipe 0.7s ease-in-out",
      },
    },
  },
  plugins: [],
};
