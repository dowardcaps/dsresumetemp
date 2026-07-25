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
          950: "#0F1218",
          900: "#14171F",
          800: "#1B1F29",
          700: "#252A36",
          600: "#333949",
        },
        paper: {
          100: "#F7F8FA",
          200: "#EDEFF3",
          300: "#E1E4EA",
        },
        stamp: {
          DEFAULT: "#D6451D",
          light: "#F06B3D",
          dark: "#A9350F",
        },
        signal: {
          DEFAULT: "#0EA5A5",
          light: "#5EEAD4",
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
