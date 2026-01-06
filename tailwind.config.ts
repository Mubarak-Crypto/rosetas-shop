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
        midnight: "#050505",
        "neon-rose": "#F3E5AB", // Champagne Cream
        "neon-purple": "#b026ff",
        glass: "rgba(255, 255, 255, 0.05)",
      },
      boxShadow: {
        "glow-rose": "0 0 20px rgba(243, 229, 171, 0.2)", // Soft, weak glow
        "glow-purple": "0 0 20px rgba(176, 38, 255, 0.5)",
      },
    },
  },
  plugins: [],
};
export default config;