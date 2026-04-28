module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Core dark palette - pure black with subtle depth
        black:      '#000000',
        charcoal:   '#121212',
        surface:    '#0a0a0a',
        surface2:   '#111111',
        border:     'rgba(255, 255, 255, 0.08)',
        borderHover:'rgba(255, 255, 255, 0.15)',

        // Primary Royal Blue accent
        royalblue: {
          DEFAULT: '#2563EB',
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },

        // Text colors
        text: {
          primary:   '#FFFFFF',
          secondary: 'rgba(255, 255, 255, 0.7)',
          muted:     'rgba(255, 255, 255, 0.4)',
        },

        // Keep backwards compatibility for brand colors
        brand: {
          blue:     '#2563EB',
          gold:     '#F59E0B',
          bronze:   '#f97316',
          cyan:     '#22d3ee',
        },

        // Indigo for supporting accents
        indigo: {
          400: '#9d7fff',
          500: '#8b6bfc',
          600: '#7c5cfc',
          DEFAULT: '#7c5cfc',
        },
      },
      fontFamily: {
        display: ['Syne', 'system-ui', 'sans-serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        soft:       '0 2px 16px rgba(0,0,0,0.35)',
        elevated:   '0 10px 50px rgba(0,0,0,0.5)',
        glowBlue:   '0 0 40px rgba(37,99,235,0.20)',
        glow:       '0 0 60px rgba(37,99,235,0.30)',
        premium:    '0 8px 40px rgba(0,0,0,0.6)',
        glass:      '0 8px 32px rgba(0,0,0,0.24), 0 2px 8px rgba(0,0,0,0.12)',
      },
      animation: {
        'fade-in':      'fadeIn 0.45s ease-out both',
        'slide-up':     'slideUp 0.55s ease-out both',
        'scale-in':     'scaleIn 0.4s ease-out both',
        'spin-slow':    'spinSlow 4s linear infinite',
        'shimmer':      'shimmer 1.8s ease-in-out infinite',
        'pulse-glow':   'pulseGlow 2s ease-in-out infinite',
        'orb-float':    'orbFloat 12s ease-in-out infinite',
        'parallax-up':  'parallaxUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
      keyframes: {
        fadeIn:   { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:  { '0%': { opacity: '0', transform: 'translateY(18px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:  { '0%': { opacity: '0', transform: 'scale(0.96)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        shimmer:  { '0%': { backgroundPosition: '-200% center' }, '100%': { backgroundPosition: '200% center' } },
        'spin-slow': { to: { transform: 'rotate(360deg)' } },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(37,99,235,0.15)' },
          '50%':       { boxShadow: '0 0 40px rgba(37,99,235,0.30)' },
        },
        'orb-float': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%':       { transform: 'translate(30px, -20px) scale(1.05)' },
          '66%':       { transform: 'translate(-20px, 15px) scale(.97)' },
        },
        parallaxUp: {
          '0%': { opacity: 0, transform: 'translateY(40px) scale(1.02)' },
          '100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
        },
      },
      backgroundImage: {
        'gradient-radial':  'radial-gradient(var(--tw-gradient-stops))',
        'gradient-radial-subtle': 'radial-gradient(ellipse 80% 50% at 50% 20%, rgba(37,99,235,0.06) 0%, transparent 60%)',
      },
    },
  },
  plugins: [],
}
