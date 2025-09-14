/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
      extend: {
      // Aquí extendemos el tema
      animation: {
        'shadow-pulse': 'shadow-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        'shadow-pulse': {
          '50%': {
             'box-shadow': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1), 0 0 0 10px rgb(245 158 11 / 0.2)',
          }
        }
      }
    },
  },
  
  plugins: [
     require('@tailwindcss/forms'), // <-- AÑADE ESTA LÍNEA
  ],
}