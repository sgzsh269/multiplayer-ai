/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        primary: "#3B5FFF",
        accent: "#5EEAD4",
        background: "#F8FAFC",
        text: "#1E293B",
        secondary: "#64748B",
      },
      borderRadius: {
        lg: "0.75rem", // 12px
        xl: "1rem", // 16px
      },
      boxShadow: {
        card: "0 2px 8px rgba(16, 30, 54, 0.08)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-primary": "linear-gradient(90deg, #A21CFB 0%, #F43F5E 100%)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
