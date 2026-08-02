import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        manto: { DEFAULT: "#0a7d2c", dark: "#075c20", accent: "#f5c518" },
      },
    },
  },
  plugins: [],
};
export default config;
