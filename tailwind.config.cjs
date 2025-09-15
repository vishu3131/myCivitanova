/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontSize: {
        'xxs': '0.65rem',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        dark: {
          100: '#333333',
          200: '#252525',
          300: '#1e1e1e',
          400: '#121212',
        },
        accent: '#C6FF00',
        textSecondary: '#a0a0a0',
      },
      backgroundColor: {
        'accent': '#C6FF00',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scroll-loop': 'scroll-loop 40s linear infinite',
        'pulse-fast': 'pulse-fast 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'scroll-loop': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'pulse-fast': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.3 },
        }
      }
    },
  },
  plugins: [],
  safelist: [
    // Dynamic color classes for quartieri
    'text-blue-100', 'text-blue-200', 'text-blue-300', 'text-blue-400',
    'text-cyan-100', 'text-cyan-200', 'text-cyan-300', 'text-cyan-400',
    'text-green-100', 'text-green-200', 'text-green-300', 'text-green-400',
    'text-orange-100', 'text-orange-200', 'text-orange-300', 'text-orange-400',
    'text-purple-100', 'text-purple-200', 'text-purple-300', 'text-purple-400',
    'text-pink-100', 'text-pink-200', 'text-pink-300', 'text-pink-400',
    
    'bg-blue-500', 'bg-blue-500/10', 'bg-blue-500/20', 'bg-blue-500/30',
    'bg-cyan-500', 'bg-cyan-500/10', 'bg-cyan-500/20', 'bg-cyan-500/30',
    'bg-green-500', 'bg-green-500/10', 'bg-green-500/20', 'bg-green-500/30',
    'bg-orange-500', 'bg-orange-500/10', 'bg-orange-500/20', 'bg-orange-500/30',
    'bg-purple-500', 'bg-purple-500/10', 'bg-purple-500/20', 'bg-purple-500/30',
    'bg-pink-500', 'bg-pink-500/10', 'bg-pink-500/20', 'bg-pink-500/30',
    
    'border-blue-400', 'border-blue-500', 'border-cyan-400', 'border-cyan-500',
    'border-green-400', 'border-green-500', 'border-orange-400', 'border-orange-500',
    'border-purple-400', 'border-purple-500', 'border-pink-400', 'border-pink-500',
    
    'shadow-blue-500/20', 'shadow-blue-500/30', 'shadow-cyan-500/20', 'shadow-cyan-500/30',
    'shadow-green-500/20', 'shadow-green-500/30', 'shadow-orange-500/20', 'shadow-orange-500/30',
    'shadow-purple-500/20', 'shadow-purple-500/30', 'shadow-pink-500/20', 'shadow-pink-500/30',
    
    'from-blue-900', 'from-blue-800', 'via-blue-800', 'to-blue-900',
    'from-cyan-900', 'from-cyan-800', 'via-cyan-800', 'to-cyan-900',
    'from-green-900', 'from-green-800', 'via-green-800', 'to-green-900',
    'from-orange-900', 'from-orange-800', 'via-orange-800', 'to-orange-900',
    'from-purple-900', 'from-purple-800', 'via-purple-800', 'to-purple-900',
    'from-pink-900', 'from-pink-800', 'via-pink-800', 'to-pink-900',
  ],
}
