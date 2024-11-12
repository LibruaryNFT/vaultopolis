// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Adjust this path as necessary
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        flow: {
          light: "#00EF8B", // flow-light
          dark: "#02D87E", // flow-dark
          darkest: "#029A5C", // flow-darkest
        },
      },
    },
  },
};
