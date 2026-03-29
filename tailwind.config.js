/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50:  "#f0f4ff",
          100: "#dde6ff",
          200: "#c3d0ff",
          300: "#9db0ff",
          400: "#7585ff",
          500: "#5a5ef9",
          600: "#4640ee",
          700: "#3b33d4",
          800: "#302bab",
          900: "#2c2887",
        },
      },
      boxShadow: {
        card: "0 2px 16px 0 rgba(0,0,0,0.08)",
        "card-dark": "0 2px 16px 0 rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};
