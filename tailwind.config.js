/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta gamificada estilo Duolingo
        grass: {
          DEFAULT: "#58cc02",
          dark: "#46a302",
          light: "#89e219",
        },
        sky: {
          DEFAULT: "#1cb0f6",
          dark: "#1899d6",
        },
        flame: {
          DEFAULT: "#ff9600",
          dark: "#e58600",
        },
        gold: "#ffc800",
        ink: "#3c3c3c",
        cloud: "#f7f7f7",
        line: "#e5e5e5",
      },
      fontFamily: {
        sans: ['"Nunito"', "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        // Sombra inferior "press" típica de botones Duolingo
        press: "0 4px 0 0 rgba(0,0,0,0.18)",
        "press-sm": "0 2px 0 0 rgba(0,0,0,0.18)",
        card: "0 2px 0 0 rgba(0,0,0,0.06)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
