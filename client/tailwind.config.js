/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#151922",
        stone: "#EDEAE2",
        paper: "#F7F5EF",
        teal: "#1F6F5C",
        amber: "#D6A419",
        rust: "#B94A2C",
      },
    },
  },
  plugins: [],
};
