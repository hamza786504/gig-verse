/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Futura', 'Trebuchet MS', 'Arial', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#6366f1', // Indigo 500
          hover: '#4f46e5',   // Indigo 600
        },
        secondary: {
          DEFAULT: '#0f172a', // Slate 900
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f8fafc',   // Slate 50
        },
        background: '#f1f5f9', // Slate 100
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 15px rgba(99, 102, 241, 0.5)',
      }
    },
  },
  plugins: [],
}
