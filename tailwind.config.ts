module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Background layers
        bg:        { DEFAULT: '#0a0b0f', surface: '#111318', surface2: '#16191f' },
        // Brand
        primary:   {
          50:  'rgba(79,142,247,0.08)',
          100: 'rgba(79,142,247,0.14)',
          200: 'rgba(79,142,247,0.20)',
          400: '#7aadff',
          500: '#5b9af8',
          600: '#4f8ef7',
          700: '#3a76e8',
          DEFAULT: '#4f8ef7',
        },
        indigo: {
          400: '#9d7fff',
          500: '#8b6bfc',
          600: '#7c5cfc',
          DEFAULT: '#7c5cfc',
        },
        cyan: {
          400: '#38e8ff',
          500: '#22d3ee',
          DEFAULT: '#22d3ee',
        },
        secondary: {
          50:  '#f0f2f8',
          100: 'rgba(255,255,255,0.07)',
          200: 'rgba(255,255,255,0.14)',
          300: '#6b7280',
          400: '#8b91a7',
          500: '#9ca3af',
          600: '#8b91a7',
          700: '#d1d5db',
          900: '#f0f2f8',
          DEFAULT: '#8b91a7',
        },
        accent: {
          teal:   '#34d399',
          indigo: '#7c5cfc',
          rose:   '#fb7185',
          amber:  '#fbbf24',
        },
        // Keep brand for backwards compat
        brand: {
          blue:     '#4f8ef7',
          gold:     '#fbbf24',
          bronze:   '#f97316',
          cyan:     '#22d3ee',
          offwhite: '#111318',
          white:    '#16191f',
          darkgray: '#8b91a7',
        },
      },
      fontFamily: {
        display: ['Syne', 'system-ui', 'sans-serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        soft:     '0 2px 16px rgba(0,0,0,0.35)',
        elevated: '0 10px 50px rgba(0,0,0,0.5)',
        glow:     '0 0 40px rgba(79,142,247,0.20)',
        'glow-indigo': '0 0 40px rgba(124,92,252,0.20)',
        premium:  '0 8px 40px rgba(0,0,0,0.6)',
      },
      animation: {
        'fade-in':   'fadeIn 0.45s ease-out both',
        'slide-up':  'slideUp 0.55s ease-out both',
        'scale-in':  'scaleIn 0.4s ease-out both',
        'spin-slow': 'spin-slow 4s linear infinite',
        'shimmer':   'shimmer 1.8s ease-in-out infinite',
        'glow-pulse':'glow-pulse 2s ease-in-out infinite',
        'orb-float': 'orb-float 12s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:   { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:  { '0%': { opacity: '0', transform: 'translateY(18px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:  { '0%': { opacity: '0', transform: 'scale(0.96)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        shimmer:  { '0%': { backgroundPosition: '-200% center' }, '100%': { backgroundPosition: '200% center' } },
        'spin-slow': { to: { transform: 'rotate(360deg)' } },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(79,142,247,.15)' },
          '50%':       { boxShadow: '0 0 40px rgba(79,142,247,.30)' },
        },
        'orb-float': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%':       { transform: 'translate(30px, -20px) scale(1.05)' },
          '66%':       { transform: 'translate(-20px, 15px) scale(.97)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
