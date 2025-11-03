/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Core theme colors - only black and white with gradients
        black: '#000000',
        white: '#ffffff',
        // Refined gray scale for subtle variations
        gray: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
      },
      backgroundImage: {
        // Primary gradients - black to gray variations
        'gradient-primary': 'linear-gradient(135deg, #000000 0%, #404040 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #171717 0%, #525252 100%)',
        'gradient-tertiary': 'linear-gradient(135deg, #262626 0%, #737373 100%)',
        
        // Light gradients - white to gray variations
        'gradient-light': 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
        'gradient-light-secondary': 'linear-gradient(135deg, #fafafa 0%, #e5e5e5 100%)',
        
        // Dark gradients - deep black variations
        'gradient-dark': 'linear-gradient(135deg, #000000 0%, #171717 100%)',
        'gradient-dark-secondary': 'linear-gradient(135deg, #0a0a0a 0%, #262626 100%)',
        
        // Radial gradients
        'gradient-radial': 'radial-gradient(circle, #000000 0%, #404040 100%)',
        'gradient-radial-light': 'radial-gradient(circle, #ffffff 0%, #f5f5f5 100%)',
        
        // Directional gradients
        'gradient-to-r': 'linear-gradient(to right, #000000 0%, #ffffff 100%)',
        'gradient-to-l': 'linear-gradient(to left, #000000 0%, #ffffff 100%)',
        'gradient-to-t': 'linear-gradient(to top, #000000 0%, #ffffff 100%)',
        'gradient-to-b': 'linear-gradient(to bottom, #000000 0%, #ffffff 100%)',
        
        // Diagonal gradients
        'gradient-diagonal': 'linear-gradient(45deg, #000000 0%, #ffffff 100%)',
        'gradient-diagonal-reverse': 'linear-gradient(-45deg, #000000 0%, #ffffff 100%)',
      },
      boxShadow: {
        'elegant': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'elegant-md': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'elegant-lg': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'elegant-xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'elegant-2xl': '0 35px 60px -12px rgba(0, 0, 0, 0.3)',
        'inner-elegant': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'glow': '0 0 20px rgba(0, 0, 0, 0.15)',
        'glow-lg': '0 0 40px rgba(0, 0, 0, 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-out': 'fadeOut 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-left': 'slideLeft 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'scale-out': 'scaleOut 0.2s ease-in',
        'pulse-subtle': 'pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounceSubtle 1s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'gradient-shift': 'gradientShift 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
        '160': '40rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
        '3xs': ['0.5rem', { lineHeight: '0.625rem' }],
      },
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
};