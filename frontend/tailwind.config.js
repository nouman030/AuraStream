/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          base: "#0a0a0f",
          surface: "rgba(20, 20, 25, 0.7)",
          border: "rgba(255, 255, 255, 0.1)",
        },
        brand: {
          violet: "#7c3aed",
          teal: "#06b6d4",
          gold: "#f59e0b",
        }
      },
      fontFamily: {
        heading: ['"Clash Display"', '"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      backgroundImage: {
        'glass': 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
        'glass-hover': 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 15px rgba(124, 58, 237, 0.5)' },
          '50%': { opacity: '.7', boxShadow: '0 0 5px rgba(124, 58, 237, 0.3)' },
        }
      }
    },
  },
  plugins: [],
}
