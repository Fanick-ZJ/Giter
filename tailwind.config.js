/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "mask-color": "rgba(188, 187, 187, 0.71)",
        "title-color":"#737b89"
      },
      zIndex: {
        "top": "999999999",
      }
    }
  },
  plugins: [],
}

