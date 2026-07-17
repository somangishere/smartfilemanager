export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "#141f19",
          50: "#1b2921",
          100: "#101913",
          200: "#0b120e",
        },
        ink: {
          50: "#0f1712",
          100: "#1c2a22",
          200: "#33453a",
          400: "#7c9186",
          500: "#93a394",
          700: "#c8cfc4",
          900: "#ece7d8",
        },
        accent: {
          50: "#241c10",
          200: "#7a6136",
          500: "#c49b5a",
          600: "#d4ac6e",
        },
      },
      fontFamily: {
        serif: ["\"Cormorant Garamond\"", "ui-serif", "Georgia", "serif"],
        sans: ["\"Source Sans 3\"", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.85rem",
        "2xl": "1.1rem",
      },
    },
  },
  plugins: [],
}