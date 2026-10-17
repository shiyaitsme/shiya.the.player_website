/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // "Afterglow" night palette: near-black ground, cool-white ink
        night: '#060606',
        ink: '#f4f3ff',
      },
      fontFamily: {
        // Pinyon Script = formal calligraphic display (titles, nav words)
        script: ['"Pinyon Script"', '"Nanum Brush Script"', 'cursive'],
        // Cormorant Garamond italic = small numerals / index marks
        display: ['"Cormorant Garamond"', '"Nanum Myeongjo"', 'Georgia', 'serif'],
        // Cormorant Garamond = characterful serif body copy (serif kept as an alias so
        // existing `font-serif` paragraph classes pick up the same face)
        serif: ['"Cormorant Garamond"', '"Nanum Myeongjo"', 'Georgia', 'serif'],
        body: ['"Cormorant Garamond"', '"Nanum Myeongjo"', 'Georgia', 'serif'],
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
