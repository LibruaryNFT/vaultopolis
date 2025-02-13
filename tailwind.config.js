// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Adjust this path as necessary
  ],
  theme: {
    extend: {
      screens: {
        xs: "475px",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        flow: {
          light: "#00EF8B", // flow-light
          dark: "#02D87E", // flow-dark
          darkest: "#029A5C", // flow-darkest
        },
        vault: {
          DEFAULT: "#ffc700", // main "vault" color
          light: "#ffe15c",
        },

        opolis: {
          DEFAULT: "#50c878",
          dark: "#40A060",
        },
      },
    },
  },
};
