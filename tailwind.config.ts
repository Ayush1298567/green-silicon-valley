import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        gsv: {
          // Primary - Grounded Green (Professional, Eco-focused)
          green: "#2D7A4F",        // Deep forest green (primary)
          greenDark: "#1F5438",    // Darker shade for hover
          greenLight: "#3A9461",   // Lighter for accents
          greenSoft: "#E8F5EE",    // Very light for backgrounds
          greenMuted: "#4A9B6A",   // Muted for secondary elements

          // Secondary - Warm Confident Tones
          warm: "#D97642",         // Warm terracotta/orange
          warmDark: "#B85F2F",     // Darker warm
          warmLight: "#E89563",    // Lighter warm
          warmSoft: "#FFF4ED",     // Very light warm background

          // Neutrals - Professional & Reliable
          charcoal: "#1A1A1A",     // Almost black
          gray: {
            50: "#FAFAFA",
            100: "#F5F5F5",
            200: "#E5E5E5",
            300: "#D4D4D4",
            400: "#A3A3A3",
            500: "#737373",
            600: "#525252",
            700: "#404040",
            800: "#262626",
            900: "#171717"
          },
          slate: {
            900: "#1E293B",        // Very dark slate
            800: "#334155",        // Dark slate
            700: "#475569",        // Medium-dark slate
            600: "#64748B",        // Medium slate
            500: "#94A3B8",        // Light-medium slate
            400: "#CBD5E1",        // Light slate
            300: "#E2E8F0",        // Very light slate
            200: "#F1F5F9",        // Almost white slate
            100: "#F8FAFC"         // Off-white
          }
        },
        // Keep accent colors for specific use cases
        accent: {
          blue: "#3B82F6",
          yellow: "#F59E0B",
          red: "#EF4444",
          success: "#10B981",
          warning: "#F59E0B",
          error: "#EF4444",
          info: "#3B82F6"
        }
      },
      boxShadow: {
        soft: "0 4px 20px rgba(0,0,0,0.06)",
        "soft-lg": "0 10px 40px rgba(0,0,0,0.08)",
        "soft-xl": "0 20px 60px rgba(0,0,0,0.12)",
        "inner-soft": "inset 0 2px 4px rgba(0,0,0,0.06)",
        "glow-green": "0 0 40px rgba(43, 174, 102, 0.3)"
      },
      borderRadius: {
        xl: "14px",
        "2xl": "18px",
        "3xl": "24px"
      },
      fontSize: {
        "hero": ["72px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "800" }],
        "display": ["48px", { lineHeight: "1.2", fontWeight: "700" }],
        "heading": ["36px", { lineHeight: "1.3", fontWeight: "700" }],
        "subheading": ["24px", { lineHeight: "1.4", fontWeight: "600" }],
        "body-lg": ["20px", { lineHeight: "1.6" }],
        "body": ["16px", { lineHeight: "1.7" }]
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-up": "slideUp 0.6s ease-out",
        "slide-down": "slideDown 0.6s ease-out",
        "scale-in": "scaleIn 0.4s ease-out",
        "float": "float 3s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite"
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" }
        },
        slideDown: {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" }
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        },
        glow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" }
        }
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "112": "28rem",
        "128": "32rem"
      }
    }
  },
  plugins: []
};

export default config;


