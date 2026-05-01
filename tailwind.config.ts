import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        rawey: {
          gold: "#C9A96A",
          background: "#F5F5F5",
          text: "#1A1A1A",
          muted: "#767676",
          line: "#E8E2D8"
        }
      },
      boxShadow: {
        soft: "0 18px 50px rgba(26, 26, 26, 0.08)"
      },
      fontFamily: {
        sans: ["var(--font-cairo)", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
