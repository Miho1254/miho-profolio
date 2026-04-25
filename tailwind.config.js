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
          dark: "#1a3a6e",
          primary: "#4091FF",
          accent: "#4091FF",
          light: "#7AB5FF",
          lighter: "#b7d4ff",
          soft: "#f0f5ff",
          surface: "#e6f0ff",
          muted: "#5a7ba8",
          onPrimary: "#FFFFFF",
          darkBg: "#0a1628",
          darkCard: "#112240",
          darkBorder: "rgba(64, 145, 255, 0.2)",
        },
        black: "#12151E",
        "hot-pink": "#fd2d78",
      },
      fontFamily: {
        display: ['"Chakra Petch"', 'sans-serif'],
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
