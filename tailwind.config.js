/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        scarlet: '#BB0000',
        white: '#FFFFFF',
        text: {
          primary: '#111111',
          secondary: '#555555',
        },
        borderlight: '#E5E5E5',
        success: '#0D7C3F',
      },
      boxShadow: {
        card: '0 1px 8px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        xl: '12px',
      },
      keyframes: {
        fadePop: {
          '0%': { opacity: 0, transform: 'translateY(4px) scale(0.98)' },
          '100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        fadePop: 'fadePop 220ms ease-out',
        shimmer: 'shimmer 1.5s linear infinite',
      },
      maxWidth: {
        app: '1120px',
      },
      transitionDuration: {
        180: '180ms',
      },
    },
  },
  plugins: [],
}