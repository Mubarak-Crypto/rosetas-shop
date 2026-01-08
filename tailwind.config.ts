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
        
        // ✨ NEW: Soft Red Theme
        "neon-rose": "#C0574F",   // Primary Brand Color (Velvet Red)
        "theme-red": "#C0574F",   // Explicit Red name
        
        // 🛑 SAFETY NET: Force "Purple" code to use Red
        "neon-purple": "#C0574F", 
        
        glass: "rgba(255, 255, 255, 0.05)",
      },
      boxShadow: {
        // Red Glow
        "glow-rose": "0 0 20px rgba(192, 87, 79, 0.4)", 
        "glow-red": "0 0 20px rgba(192, 87, 79, 0.4)",
        
        // Safety Net: Force Purple Glow to be Red Glow
        "glow-purple": "0 0 20px rgba(192, 87, 79, 0.4)", 
      },
    },
  },
  plugins: [],
};
export default config;