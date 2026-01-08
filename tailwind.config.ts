import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ✅ FIXED: Updated to #F6EFE6 */
        cream: "#F6EFE6",
        ink: "#1F1F1F",
        nude: "#D8BFAF",
        "champagne-gold": "#C9A24D",
        
        "neon-rose": "#C9A24D",   
        glass: "rgba(31, 31, 31, 0.08)",
      },
      boxShadow: {
        "glow-gold": "0 10px 30px rgba(201, 162, 77, 0.25)",
      },
    },
  },
  plugins: [],
};
export default config;