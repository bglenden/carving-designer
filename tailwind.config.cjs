/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.ts'],
  theme: {
    extend: {
      // Custom color palette - Warm, craftsmanship-inspired design
      colors: {
        // Primary brand colors - Warm Amber/Copper
        brand: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },

        // Accent colors - Teal for secondary actions
        accent: {
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
        },

        // Semantic colors for UI states
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },

        // Warm neutral grays with subtle brown undertones
        neutral: {
          0: '#ffffff',
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          850: '#1c1917',
          900: '#171412',
          950: '#0c0a09',
        },

        // Canvas and workspace colors
        canvas: {
          bg: '#fefdfb',
          grid: '#f0ebe4',
          'grid-major': '#e0d6ca',
          border: '#d4c8b8',
          axis: '#78716c',
        },

        // Toolbar and UI component colors
        toolbar: {
          bg: '#252220',
          'bg-light': '#2d2a26',
          hover: '#3d3833',
          active: '#f59e0b',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-bottom': 'rgba(0, 0, 0, 0.3)',
        },

        // Shape and drawing colors
        shape: {
          fill: '#faf8f5',
          stroke: '#44403c',
          selected: '#f59e0b',
          hover: '#fbbf24',
        },
      },

      // Spacing scale for consistent spacing
      spacing: {
        18: '4.5rem',
        88: '22rem',
        112: '28rem',
        128: '32rem',
      },

      // Typography scale
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
      },

      // Shadow system for depth and elevation
      boxShadow: {
        toolbar: '0 4px 20px -2px rgba(23, 20, 18, 0.25), 0 2px 8px -2px rgba(23, 20, 18, 0.15)',
        'toolbar-button':
          'inset 0 1px 0 0 rgba(255, 255, 255, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.2)',
        button: '0 1px 3px 0 rgba(23, 20, 18, 0.12), 0 1px 2px -1px rgba(23, 20, 18, 0.08)',
        'button-hover':
          '0 4px 6px -1px rgba(23, 20, 18, 0.12), 0 2px 4px -2px rgba(23, 20, 18, 0.08)',
        'button-active': 'inset 0 2px 4px 0 rgba(23, 20, 18, 0.1)',
        panel: '0 10px 15px -3px rgba(23, 20, 18, 0.15), 0 4px 6px -4px rgba(23, 20, 18, 0.1)',
        modal: '0 25px 50px -12px rgba(23, 20, 18, 0.35)',
        'glow-brand': '0 0 20px -5px rgba(245, 158, 11, 0.4)',
        'glow-subtle': '0 0 15px -3px rgba(245, 158, 11, 0.2)',
      },

      // Border radius system
      borderRadius: {
        toolbar: '0.75rem',
        button: '0.5rem',
        panel: '0.75rem',
      },

      // Animation durations
      transitionDuration: {
        75: '75ms',
        175: '175ms',
      },

      // Z-index scale
      zIndex: {
        toolbar: '10',
        modal: '50',
        tooltip: '60',
        dropdown: '40',
      },

      // Custom gradients
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-toolbar': 'linear-gradient(180deg, #2d2a26 0%, #1c1917 100%)',
        'gradient-button-active': 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)',
        'gradient-button-highlight':
          'linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, transparent 50%)',
      },
    },
  },
  plugins: [
    // Custom plugin for component utilities
    function ({ addUtilities, theme }) {
      const newUtilities = {
        // Button component utilities
        '.btn-base': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.5rem',
          borderRadius: theme('borderRadius.button'),
          fontWeight: '500',
          transition: 'all 150ms cubic-bezier(0, 0, 0.2, 1)',
          cursor: 'pointer',
          userSelect: 'none',
          border: '1px solid transparent',
          position: 'relative',
          overflow: 'hidden',
        },
        '.btn-toolbar': {
          background: theme('colors.toolbar.bg'),
          color: theme('colors.neutral.300'),
          border: `1px solid ${theme('colors.toolbar.border')}`,
          boxShadow: theme('boxShadow.toolbar-button'),
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: '0',
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, transparent 50%)',
            pointerEvents: 'none',
            borderRadius: 'inherit',
          },
          '&:hover': {
            background: theme('colors.toolbar.hover'),
            color: theme('colors.neutral.100'),
            borderColor: 'rgba(255, 255, 255, 0.12)',
            transform: 'translateY(-1px)',
            boxShadow: `${theme('boxShadow.button-hover')}, ${theme('boxShadow.glow-subtle')}`,
          },
          '&:active': {
            transform: 'translateY(0)',
            boxShadow: theme('boxShadow.button-active'),
          },
          '&.active': {
            background: 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)',
            borderColor: theme('colors.brand.600'),
            color: theme('colors.neutral.950'),
            boxShadow: `${theme('boxShadow.glow-brand')}, ${theme('boxShadow.button')}`,
            '&::before': {
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, transparent 50%)',
            },
          },
          '&.active:hover': {
            background: 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%)',
          },
        },

        // Toolbar utilities
        '.toolbar-base': {
          display: 'flex',
          background: 'linear-gradient(180deg, #2d2a26 0%, #1c1917 100%)',
          borderRadius: theme('borderRadius.toolbar'),
          boxShadow: theme('boxShadow.toolbar'),
          border: `1px solid ${theme('colors.toolbar.border')}`,
          borderBottomColor: theme('colors.toolbar.border-bottom'),
        },

        // Focus utilities for accessibility
        '.focus-ring': {
          '&:focus': {
            outline: 'none',
            boxShadow: `0 0 0 2px ${theme('colors.neutral.950')}, 0 0 0 4px ${theme(
              'colors.brand.500',
            )}`,
          },
        },

        // Icon utilities
        '.icon-base': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: '0',
        },
      };

      addUtilities(newUtilities);
    },
  ],
};
