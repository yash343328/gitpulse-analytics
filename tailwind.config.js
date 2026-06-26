/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      colors: {
        ink: {
          950: '#06070a',
          900: '#0b0d12',
          800: '#11141b',
          700: '#181c26',
          600: '#232836'
        },
        pulse: {
          violet: '#7c5cff',
          cyan: '#33e0c4',
          amber: '#ffb648',
          rose: '#ff5c8a',
          blue: '#5b8cff'
        }
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(124,92,255,0.45)',
        card: '0 8px 32px -8px rgba(0,0,0,0.35)'
      },
      backgroundImage: {
        aurora: 'radial-gradient(60% 50% at 20% 0%, rgba(124,92,255,0.25), transparent), radial-gradient(50% 40% at 90% 10%, rgba(51,224,196,0.18), transparent)'
      },
      animation: {
        'fade-up': 'fadeUp .6s ease forwards',
        'shimmer': 'shimmer 1.6s infinite linear',
        'float': 'float 6s ease-in-out infinite'
      },
      keyframes: {
        fadeUp: { '0%': { opacity: 0, transform: 'translateY(12px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-400px 0' }, '100%': { backgroundPosition: '400px 0' } },
        float: { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-8px)' } }
      }
    }
  },
  plugins: []
}
