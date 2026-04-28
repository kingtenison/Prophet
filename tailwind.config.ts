module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F2F4F8',
          100: '#E1E7F0',
          300: '#8AABDF',
          400: '#5A8BD1',
          600: '#1A4FAD',
          700: '#143D85',
          DEFAULT: '#1A4FAD',
        },
        secondary: {
          50: '#F2F4F8',
          100: '#E1E7F0',
          300: '#C1CADB',
          400: '#A1ADC7',
          600: '#3D3D3D',
          900: '#3D3D3D',
          DEFAULT: '#F2F4F8',
        },
        brand: {
          blue: '#1A4FAD',
          gold: '#E8B830',
          bronze: '#B07820',
          cyan: '#00C8E8',
          offwhite: '#F2F4F8',
          white: '#FFFFFF',
          darkgray: '#3D3D3D',
        }
      },
      fontFamily: {
        display: ['"Codec Warm"', 'system-ui', 'sans-serif'],
        sans: ['"Nexa"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'elevated': '0 10px 40px -10px rgba(0,0,0,0.12)',
        'glow': '0 0 40px rgba(14, 165, 233, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      }
    },
  },
  plugins: [],
}
