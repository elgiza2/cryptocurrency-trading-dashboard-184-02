
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'matrix': ['Share Tech Mono', 'monospace'],
        'cyber': ['Orbitron', 'sans-serif'],
        'neon': ['Electrolize', 'sans-serif'],
        'future': ['Aldrich', 'sans-serif'],
        'space': ['Audiowide', 'sans-serif'],
        'robot': ['Wallpoet', 'sans-serif'],
        'tech': ['Michroma', 'sans-serif'],
        'digital': ['Rationale', 'sans-serif'],
        'sci-fi': ['Exo', 'sans-serif'],
        'handwrite': ['Kalam', 'cursive'],
        'horror': ['Creepster', 'cursive'],
        'dark': ['Nosifer', 'cursive'],
        'western': ['Rye', 'cursive'],
        'retro': ['Fontdiner Swanky', 'cursive'],
        'blood': ['Butcherman', 'cursive'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
        },
        link: {
          DEFAULT: "hsl(var(--link))",
        },
      },
      borderRadius: {
        lg: "1rem",
        md: "0.75rem",
        sm: "0.5rem",
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out",
        "slide-up": "slide-up 0.5s ease-out",
        "gradient-shift": "gradientShift 8s ease infinite",
        "gaming-pulse": "gaming-pulse 2s ease-in-out infinite",
        "roulette-gradient": "roulette-gradient 3s ease infinite",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "gradientShift": {
          "0%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
          "100%": { "background-position": "0% 50%" },
        },
        "gaming-pulse": {
          "0%, 100%": { "box-shadow": "0 0 20px hsl(320 85% 60% / 0.4)" },
          "50%": { "box-shadow": "0 0 40px hsl(320 85% 60% / 0.8)" },
        },
        "roulette-gradient": {
          "0%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
          "100%": { "background-position": "0% 50%" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
