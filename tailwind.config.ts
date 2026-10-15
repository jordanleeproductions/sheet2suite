import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/products/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#FFFFFF",
        pane: "#F8FAFC",
        ink: {
          DEFAULT: "#0F172A",
          primary: "#0F172A",
          secondary: "#334155",
          muted: "#64748B",
        },
        hairline: {
          DEFAULT: "#E2E8F0",
          slate: "#CBD5E1",
          dark: "#334155",
        },
        ledger: {
          emerald: "#059669",
          muted: "#ECFDF5",
        },
        ceremonial: {
          gold: "#D4AF37",
          muted: "#FEF9C3",
        },
      },
      fontFamily: {
        serif: [
          "var(--font-editorial-serif)",
          "var(--font-newsreader-google)",
          "var(--font-serif-google)",
          "Newsreader",
          "Playfair Display",
          "Georgia",
          "Cambria",
          "serif",
        ],
        mono: [
          "var(--font-technical-mono)",
          "var(--font-jetbrains-google)",
          "var(--font-geist-mono-google)",
          "JetBrains Mono",
          "Geist Mono",
          "Roboto Mono",
          "monospace",
        ],
        sans: [
          "var(--font-interface-sans)",
          "var(--font-sans-google)",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      borderRadius: {
        none: "0px",
        xs: "2px",
        sm: "2px",
        DEFAULT: "3px",
        md: "3px",
        lg: "4px",
        xl: "4px",
        "2xl": "4px",
        "3xl": "4px",
        full: "4px", // Restricts pill containers to crisp micro-radius
      },
      boxShadow: {
        none: "none",
        xs: "none",
        sm: "none",
        DEFAULT: "none",
        md: "none",
        lg: "none",
        xl: "none",
        "2xl": "none",
        hairline: "0 0 0 1px #E2E8F0",
        "hairline-dark": "0 0 0 1px #334155",
      },
      borderWidth: {
        DEFAULT: "1px",
        hairline: "1px",
      },
    },
  },
  plugins: [],
};

export default config;
