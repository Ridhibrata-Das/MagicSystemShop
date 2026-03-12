import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        system: {
          bg: "rgba(10, 15, 25, 0.85)", // Translucent dark panel
          border: "rgba(0, 240, 255, 0.3)", // Dim cyan border
          accent: "#00f0ff", // Bright glowing cyan
          error: "#ff3333", // Red error glow
          success: "#00ff66", // Green success glow
          text: "#e2f1f8", // Soft blue-white text
          muted: "#6b8a9e", // Muted blue-grey text
        }
      },
      fontFamily: {
        orbitron: ['var(--font-orbitron)'],
        rajdhani: ['var(--font-rajdhani)'],
      },
      boxShadow: {
        'system-glow': '0 0 10px rgba(0, 240, 255, 0.5), inset 0 0 10px rgba(0, 240, 255, 0.2)',
        'system-glow-hover': '0 0 20px rgba(0, 240, 255, 0.8), inset 0 0 15px rgba(0, 240, 255, 0.4)',
        'system-error': '0 0 10px rgba(255, 51, 51, 0.6)',
        'system-success': '0 0 10px rgba(0, 255, 102, 0.6)',
      },
      animation: {
        'scanline': 'scanline 8s linear infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in-up': 'fadeInUp 0.3s ease-out forwards',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' }
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 15px rgba(0, 240, 255, 0.6)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 5px rgba(0, 240, 255, 0.3)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    },
  },
  plugins: [],
} satisfies Config;
