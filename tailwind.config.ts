import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Base escura (premium)
        ink: {
          DEFAULT: "#0b0b0e",
          800: "#141419",
          700: "#1c1c22",
          600: "#26262e",
        },
        // Dourado (destaque)
        gold: {
          DEFAULT: "#d4af37",
          light: "#e8c860",
          dark: "#a8862a",
        },
        // Verde da marca (secundário)
        manto: { DEFAULT: "#0a7d2c", dark: "#075c20", accent: "#f5c518" },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-oswald)", "var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
