/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // soft iridescent macaron palette (from the Figma demo)
        macaron: {
          lavender: '#bcb4e6',
          periwinkle: '#aeb9ec',
          pink: '#f2b6d4',
          blush: '#f7cfe0',
          peach: '#f6d3b2',
          cream: '#f7efe2',
          sky: '#bcd2ef',
        },
        // acid lime used for the nav + connector lines
        lime: {
          acid: '#b6ff00',
          grass: '#7ed957',
        },
        ink: '#1a1726',
      },
      fontFamily: {
        // Gravitas One = heavy retro Americana display / nav
        display: ['"Gravitas One"', 'Georgia', 'serif'],
        // Playfair Display = elegant editorial body serif
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-9px)' },
        },
        grainShift: {
          '0%,100%': { transform: 'translate(0,0)' },
          '25%': { transform: 'translate(-4%,-6%)' },
          '50%': { transform: 'translate(5%,3%)' },
          '75%': { transform: 'translate(-3%,5%)' },
        },
        twinkle: {
          '0%,100%': { opacity: '0.85', transform: 'scale(1) rotate(0deg)' },
          '50%': { opacity: '1', transform: 'scale(1.12) rotate(15deg)' },
        },
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
        grain: 'grainShift 9s steps(8) infinite',
        twinkle: 'twinkle 3.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
