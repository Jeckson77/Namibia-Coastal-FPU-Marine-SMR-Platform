/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#c3f5ff",
        secondary: "#b1cad7",
        tertiary: "#ffe9cd",
        background: "#10141a",
        surface: {
          lowest: "#0a0e14",
          low: "#161b22",
          high: "#262a31",
          highest: "#31353c",
        },
        accent: {
          emerald: "#10b981",
          amber: "#f59e0b",
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
