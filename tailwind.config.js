/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg, #07070a)',
        surface:    'var(--surface, #0f0e0c)',
        surface2:   'var(--surface-2, #161410)',
        border:     'var(--border, #1f1d19)',
        text:       'var(--text, #f5f0e8)',
        dim:        'var(--dim, #6b6560)',
        dim2:       'var(--dim-2, #4a4540)',
        accent:     'var(--accent, #c4a574)',
        'accent-hover': '#d4b88a',
        accent2:    '#d4654a',
        accent3:    'var(--accent-dim, #c4a57420)',
        danger:     '#f87171',
        success:    '#4ade80',
        warning:    '#fbbf24',
      },
      fontFamily: {
        sans:    ['Space Grotesk', 'system-ui', 'sans-serif'],
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        mono:    ['Space Mono', 'monospace'],
      },
      animation: {
        'fade-up':    'fadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'clip-reveal':'clipReveal 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'shimmer':    'shimmer 1.6s ease-in-out infinite',
        'spin-slow':  'spin 8s linear infinite',
        'marquee':    'marquee 22s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(28px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        clipReveal: {
          '0%':   { clipPath: 'inset(0 100% 0 0)' },
          '100%': { clipPath: 'inset(0 0% 0 0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        spin: {
          to: { transform: 'rotate(360deg)' }
        },
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      },
    },
  },
  plugins: [],
}
