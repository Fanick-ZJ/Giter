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
        "title-color":"#737b89",
        'right-color':'#f7f9fc',
      },
      zIndex: {
        "top": "999999999",
      },
      fontFamily: {
        'default': ["Helvetica Neue", 'Helvetica', 'Arial', "PingFang SC", "Hiragino Sans GB", "Heiti SC", "Microsoft YaHei", "WenQuanYi Micro Hei", 'sans-serif'],
      }
    }
  },
  plugins: [],
}

