/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/pages/**/*.{js,ts,jsx,tsx}', './src/components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Palette de couleurs Julie Grohens
        primary: {
          50: '#faf8f5',
          100: '#f5f0e8',
          200: '#e8ddc9',
          300: '#d9c5a3',
          400: '#d2ab7d',
          500: '#D08C60', // Couleur principale - Titres & Éléments graphiques
          600: '#c17b52',
          700: '#a56745',
          800: '#87553b',
          900: '#6e4630',
        },
        // Couleurs de la palette cliente
        cream: {
          light: '#FBF9F6', // Fond des sections ou arrière-plans alternés
          main: '#F5E9DC', // Fond principal, encadrés
        },
        taupe: '#B9A89D', // Texte secondaire, détails
        charcoal: '#2C2C2C', // Texte principal
      },
    },
  },
  plugins: [],
};
