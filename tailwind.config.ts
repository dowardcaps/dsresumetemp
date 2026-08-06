import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#C7D3E8",
          900: "#EEF2F8",
          800: "#F5F8FC",
          700: "#D0DCF0",
          600: "#8FA8CC",
        },
        paper: {
          100: "#FFFFFF",
          200: "#F5F8FC",
          300: "#E3EAF5",
        },
        stamp: {
          DEFAULT: "#2B579A",
          light: "#3B6FC4",
          dark: "#1E3F72",
        },
        signal: {
          DEFAULT: "#185ABD",
          light: "#4A90D9",
        },
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
