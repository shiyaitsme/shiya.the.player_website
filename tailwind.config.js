/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // low-saturation macaron palette
        macaron: {
          pink: '#e9a6c9',
          blush: '#f3c7dc',
          blue: '#a9c4e8',
          sky: '#cfe0f2',
          purple: '#c4a7e7',
          lilac: '#ddc9f0',
          cream: '#f6f1e7',
        },
        acid: {
          green: '#8fb98f',
          lime: '#b7d36a',
          neon: '#c6ff5e',
          chrome: '#dfe7d8',
        },
        ink: '#2a2535',
      },
      fontFamily: {
        // Retro Americana display + clean body
        display: ['"Bungee"', '"Archivo Black"', 'system-ui', 'sans-serif'],
        body: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        flicker: {
          '0%, 18%, 22%, 25%, 53%, 57%, 83%, 100%': {
            opacity: '1',
            color: '#eaffd4',
            textShadow:
              '0 0 4px #00ff00, 0 0 11px #00ff00, 0 0 22px #00ff00, 0 0 44px #39ff14, 0 0 70px #00ff00',
          },
          '20%, 24%, 55%, 85%': {
            opacity: '0.28',
            color: '#7bdc6a',
            textShadow: 'none',
          },
          '19%, 23%, 54%, 84%': { opacity: '0.85', textShadow: '0 0 6px #00ff00' },
        },
        sparkleSpin: {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(180deg) scale(1.12)' },
          '100%': { transform: 'rotate(360deg) scale(1)' },
        },
        grainShift: {
          '0%,100%': { transform: 'translate(0,0)' },
          '10%': { transform: 'translate(-5%,-10%)' },
          '30%': { transform: 'translate(3%,-15%)' },
          '50%': { transform: 'translate(-8%,9%)' },
          '70%': { transform: 'translate(12%,4%)' },
          '90%': { transform: 'translate(-4%,12%)' },
        },
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        flicker: 'flicker 1.6s infinite',
        sparkle: 'sparkleSpin 6s linear infinite',
        grain: 'grainShift 8s steps(10) infinite',
        floaty: 'floaty 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
