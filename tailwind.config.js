/** @type {import('tailwindcss').Config} */
export default {
  // Añadimos stage.html para evitar que Tailwind purgue sus clases
  content: ['./index.html', './stage.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class', // Habilitar modo oscuro con clase 'dark'
  theme: {
    extend: {
      animation: {
        blink: 'blink 1s infinite',
      },
      keyframes: {
        blink: {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
