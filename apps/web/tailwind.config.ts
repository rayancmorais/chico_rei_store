import type { Config } from 'tailwindcss'

// Tokens da direção visual "Ateliê HQ". O contraste de cada cor está no README do design.
export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        paper: '#EFE7DA',
        surface: '#F7F2E9',
        ink: '#2A1F17',
        muted: '#6B5B4D',
        line: { DEFAULT: '#D9CDB9', strong: '#B8A991' },
        sand: '#E6DCCB',
        skeleton: '#E0D4C1',
        accent: { DEFAULT: '#A9472A', hover: '#8E3A21', soft: '#FBEDE6' },
        // Mostarda só passa no contraste com texto `ink`.
        mustard: '#E3A93B',
        success: '#4F5A3A',
        danger: '#B42318',
      },
      fontFamily: {
        display: ['"Young Serif"', 'Georgia', 'serif'],
        sans: ['"Instrument Sans"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        eyebrow: ['11px', { lineHeight: '1.2', letterSpacing: '0.12em', fontWeight: '700' }],
        xs: ['12px', '1.4'],
        sm: ['13px', '1.45'],
        base: ['15px', '1.55'],
        lg: ['17px', '1.55'],
        'title-sm': ['21px', '1.15'],
        'title-md': ['28px', '1.1'],
        'title-lg': ['46px', '1.06'],
        'title-xl': ['64px', '1.04'],
      },
      borderRadius: { panel: '8px', control: '6px', chip: '5px', pill: '999px' },
      borderWidth: { 2.5: '2.5px', 3: '3px' },
      boxShadow: {
        // Sombra sólida "de HQ". `press` é o estado afundado do clique; `raised`, o do hover.
        'hq-press': '1px 1px 0 #2A1F17',
        'hq-sm': '2px 2px 0 #2A1F17',
        'hq-md': '3px 3px 0 #2A1F17',
        hq: '4px 4px 0 #2A1F17',
        'hq-frame': '5px 5px 0 #2A1F17',
        'hq-raised': '6px 6px 0 #2A1F17',
        'hq-lg': '8px 8px 0 #2A1F17',
        // O carrinho entra pela direita, então a sombra cai para a esquerda.
        'hq-drawer': '-6px 6px 0 #2A1F17',
        'hq-accent': '4px 4px 0 #A9472A',
        'hq-hover': '9px 9px 0 #A9472A',
        'ring-accent': '0 0 0 3px #F7F2E9, 0 0 0 6px #A9472A',
      },
      // `header`: altura do cabeçalho fixo (py-3 + botão de 44px + borda), para o que gruda abaixo dele.
      spacing: { 4.5: '18px', 13: '52px', 15: '60px', header: '69px' },
      backgroundImage: {
        halftone: 'radial-gradient(#2A1F17 1.1px, transparent 1.5px)',
        'halftone-accent': 'radial-gradient(#A9472A 1.2px, transparent 1.6px)',
      },
      backgroundSize: { dots: '8px 8px' },
      keyframes: {
        'slide-in-right': {
          from: { transform: 'translateX(60px)', opacity: '0' },
          to: { transform: 'none', opacity: '1' },
        },
        'sheet-up': {
          from: { transform: 'translateY(80px)', opacity: '.5' },
          to: { transform: 'none', opacity: '1' },
        },
        pop: {
          '0%': { opacity: '0', transform: 'scale(.6) rotate(-6deg)' },
          '60%': { opacity: '1', transform: 'scale(1.05) rotate(1.5deg)' },
          '100%': { transform: 'none' },
        },
        zap: {
          '0%': { opacity: '0', transform: 'scale(.2) rotate(-25deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(-8deg)' },
        },
        stamp: {
          '0%': { opacity: '0', transform: 'scale(2.4) rotate(20deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(-12deg)' },
        },
        shake: {
          '0%,100%': { transform: 'none' },
          '20%': { transform: 'translateX(-6px)' },
          '40%': { transform: 'translateX(6px)' },
          '60%': { transform: 'translateX(-4px)' },
          '80%': { transform: 'translateX(4px)' },
        },
        shimmer: { from: { backgroundPosition: '200% 0' }, to: { backgroundPosition: '-200% 0' } },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'none' },
        },
      },
      animation: {
        'slide-in-right': 'slide-in-right 350ms cubic-bezier(.3,1.4,.5,1) both',
        'sheet-up': 'sheet-up 400ms cubic-bezier(.2,.7,.2,1) both',
        pop: 'pop 700ms cubic-bezier(.3,1.6,.5,1) both',
        zap: 'zap 450ms cubic-bezier(.3,1.8,.5,1) both',
        stamp: 'stamp 550ms cubic-bezier(.3,1.8,.5,1) both',
        shake: 'shake 500ms ease',
        shimmer: 'shimmer 1.3s linear infinite',
        'fade-up': 'fade-up 550ms ease both',
      },
    },
  },
  plugins: [],
} satisfies Config
