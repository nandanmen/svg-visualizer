/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        title: ["Arima Madurai"],
        sans: ["Nunito"],
        mono: ["Cartograph CF"],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
