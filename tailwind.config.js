module.exports = {
  content: [
    "./app/**/*.{js,ts,tsx}",
    "./components/**/*.{js,ts,tsx}",
    "./src/**/*.{js,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        retroBg: "#f5e8c7",
        retroPrimary: "#d2691e",
        retroAccent: "#8b4513",
        retroText: "#2c2c2c",
      },
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        mono: ["'Space Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
