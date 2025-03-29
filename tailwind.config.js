/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2A2A72",
        secondary: "#F4A261",
        accent: "#264653",
      },
      screens: {
        'custom': '1000px', // Define a new breakpoint at 1000px
      },
    },
  },
  plugins: [],
}
