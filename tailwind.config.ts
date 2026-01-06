import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: '#050505',
        'neon-rose': '#ff007f', 
        'neon-purple': '#b026ff',
        'glass': 'rgba(255, 255, 255, 0.05)',
      },
      boxShadow: {
        'glow-rose': '0 0 20px rgba(255, 0, 127, 0.5)',
        'glow-purple': '0 0 20px rgba(176, 38, 255, 0.5)',
      }
    },
  },
  plugins: [],
};
export default config;