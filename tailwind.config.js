// tailwind.config.js
module.exports = {
  darkMode: "class", // Tailwind looks for .dark on <html> or <body>
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
      animation: {
        blink: "blink 1s steps(1, start) infinite",
      },
      screens: {
        xs: "475px",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },

      // Original custom colors remain (flow, vault, etc.)
      // We'll add new color keys that reference CSS variables:
      colors: {
        // Our variable-based color keys:
        "brand-primary": "var(--brand-primary-bg)",
        "brand-secondary": "var(--brand-secondary-bg)",
        "brand-text": "var(--brand-text)",
        "brand-accent": "var(--brand-accent)",
        "brand-border": "var(--brand-border)",

        flow: {
          light: "#00EF8B",
          dark: "#02D87E",
          darkest: "#029A5C",
        },
        vault: {
          DEFAULT: "#ffc700",
          light: "#ffe15c",
        },
        opolis: {
          DEFAULT: "#50c878",
          dark: "#40A060",
        },
        brandGrey: {
          darkest: "#181818",
          dark: "#2A2A2A",
          light: "#E0E0E0",
        },
      },
    },
  },
};
