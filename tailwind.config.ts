import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  darkMode: "class",
  theme: {
    fontFamily: {
      sans: [
        '-apple-system',
        'BlinkMacSystemFont',
        'SF Pro Text',
        'system-ui',
        'sans-serif'
      ],
      display: [
        '-apple-system',
        'BlinkMacSystemFont',
        'SF Pro Display',
        'system-ui',
        'sans-serif'
      ]
    },
    extend: {
      colors: {
        // Apple-inspired minimalism with green accents
        gsv: {
          // Primary - Apple Green (Sophisticated, Trustworthy)
          green: "#007AFF",        // Apple blue (primary actions)
          greenDark: "#005BD3",    // Darker for hover states
          greenLight: "#4DA3FF",   // Lighter for secondary elements
          greenSoft: "#E6F2FF",    // Very light for backgrounds
          greenMuted: "#7AB8FF",   // Muted for supporting elements

          // Secondary - Environmental Green
          eco: "#30D158",          // Apple green for environmental theme
          ecoDark: "#248A3D",      // Darker eco green
          ecoLight: "#66D477",     // Lighter eco green
          ecoSoft: "#E8F8E8",      // Very light eco background

          // Tertiary - Warm accent
          warm: "#FF9F0A",         // Apple orange/warm
          warmDark: "#E68606",    // Darker warm
          warmLight: "#FFB340",   // Lighter warm
          warmSoft: "#FFF8E6",    // Very light warm background

          // System Grays - Apple System Colors
          gray: {
            50: "#F9F9F9",        // System background (lightest)
            100: "#F2F2F7",       // Secondary system background
            200: "#E5E5EA",       // Tertiary system background
            300: "#D1D1D6",       // Separator color
            400: "#C7C7CC",       // System fill (light)
            500: "#AEAEB2",       // System fill
            600: "#8E8E93",       // Secondary label
            700: "#636366",       // Tertiary label
            800: "#48484A",       // Quaternary label
            900: "#1C1C1E"        // Primary label (darkest)
          },

          // Text colors
          charcoal: "#1A1A1A",     // Primary text color

          // Semantic colors for status
          success: "#30D158",      // Apple green for success
          warning: "#FF9F0A",      // Apple orange for warnings
          error: "#FF453A",        // Apple red for errors
          info: "#64D2FF"          // Apple blue for information
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
        // Apple-inspired subtle shadows
        soft: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
        "soft-lg": "0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)",
        "soft-xl": "0 8px 24px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06)",
        "inner-soft": "inset 0 1px 2px rgba(0,0,0,0.08)",
        "glow-green": "0 0 20px rgba(0, 122, 255, 0.15)"
      },
      borderRadius: {
        // Apple border radius (more rounded)
        sm: "6px",
        md: "8px",
        lg: "10px",
        xl: "12px",
        "2xl": "16px",
        "3xl": "20px"
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


