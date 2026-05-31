import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Emerald dark palette
        emerald: {
          950: "#0A1F1C",
          900: "#102820",
          800: "#1A3A2F",
          700: "#1F4D3E",
          600: "#246049",
          500: "#2A7358",
        },
        // Gold palette
        gold: {
          50: "#FDF8EC",
          100: "#FAF0CC",
          200: "#F5E09A",
          300: "#EFCD63",
          400: "#E8C044",
          500: "#C9A84C",
          600: "#B8922A",
          700: "#9A7A22",
          800: "#7C621A",
          900: "#5E4A14",
        },
        // Cream / Light theme
        cream: {
          50: "#FDFBF5",
          100: "#F9F5E8",
          200: "#F3EDD4",
          300: "#EDE4BE",
        },
        // Dark theme
        dark: {
          bg: "#0D1B18",
          card: "#132520",
          border: "#1E3A30",
          hover: "#1A3028",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Cormorant Garamond", "Georgia", "serif"],
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #C9A84C 0%, #E8C96C 50%, #C9A84C 100%)",
        "emerald-gradient": "linear-gradient(135deg, #102820 0%, #1A4A38 100%)",
        "dark-gradient": "linear-gradient(135deg, #0D1B18 0%, #132520 100%)",
        "card-light": "linear-gradient(145deg, #FFFFFF 0%, #F9F5E8 100%)",
        "card-dark": "linear-gradient(145deg, #132520 0%, #1A3028 100%)",
      },
      boxShadow: {
        "gold": "0 4px 24px rgba(201, 168, 76, 0.25)",
        "gold-lg": "0 8px 40px rgba(201, 168, 76, 0.35)",
        "emerald": "0 4px 24px rgba(10, 31, 28, 0.4)",
        "card": "0 2px 20px rgba(0, 0, 0, 0.08)",
        "card-dark": "0 2px 20px rgba(0, 0, 0, 0.4)",
      },
      animation: {
        "spin-slow": "spin 3s linear infinite",
        "pulse-gold": "pulse-gold 2s ease-in-out infinite",
        "slide-up": "slideUp 0.3s ease-out",
        "fade-in": "fadeIn 0.4s ease-out",
        "bounce-subtle": "bounceSubtle 0.6s ease-out",
        "shimmer": "shimmer 2s infinite linear",
      },
      keyframes: {
        "pulse-gold": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(201, 168, 76, 0.4)" },
          "50%": { boxShadow: "0 0 0 10px rgba(201, 168, 76, 0)" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        bounceSubtle: {
          "0%": { transform: "scale(0.95)" },
          "60%": { transform: "scale(1.02)" },
          "100%": { transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;
