/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg, #09090b)',
        surface: 'var(--surface, #131316)',
        surface2: 'var(--surface-2, #1a1a1f)',
        border: 'var(--border, #252528)',
        text: 'var(--text, #fafafa)',
        dim: 'var(--dim, #71717a)',
        accent: 'var(--accent, #c4a574)',
        'accent-dim': 'var(--accent-dim, #c4a57426)',
        accent2: '#7bdff2',
        accent3: '#f2b5d4',
        danger: '#f87171',
        success: '#4ade80',
        warning: '#fbbf24',
      },
      fontFamily: {
        sans: ['var(--font-body)', 'DM Sans', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Instrument Serif', 'Georgia', 'serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-up': 'fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)', filter: 'blur(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)', filter: 'blur(0)' },
        }
      }
    },
  },
  plugins: [],
}
