/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.ts'],
  theme: {
    extend: {
      // Custom color palette for the design system
      colors: {
        // Primary brand colors
        brand: {
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
        
        // Semantic colors for UI states
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
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
        
        // Neutral grays with better contrast ratios
        neutral: {
          0: '#ffffff',
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          850: '#1f1f23',
          900: '#18181b',
          950: '#09090b',
        },

        // Canvas and workspace colors
        canvas: {
          bg: '#ffffff',
          grid: '#f1f5f9',
          border: '#e2e8f0',
        },

        // Toolbar and UI component colors
        toolbar: {
          bg: '#27272a',
          hover: '#3f3f46',
          active: '#0ea5e9',
          border: '#3f3f46',
        },

        // Shape and drawing colors
        shape: {
          fill: '#f8fafc',
          stroke: '#334155',
          selected: '#0ea5e9',
          hover: '#38bdf8',
        },
      },

      // Spacing scale for consistent spacing
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },

      // Typography scale
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
      },

      // Shadow system for depth and elevation
      boxShadow: {
        'toolbar': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'button': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'button-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'button-active': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'panel': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'modal': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },

      // Border radius system
      borderRadius: {
        'toolbar': '0.5rem',
        'button': '0.375rem',
        'panel': '0.75rem',
      },

      // Animation durations
      transitionDuration: {
        '75': '75ms',
        '175': '175ms',
      },

      // Z-index scale
      zIndex: {
        'toolbar': '10',
        'modal': '50',
        'tooltip': '60',
        'dropdown': '40',
      },

      // Custom gradients
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-toolbar': 'linear-gradient(135deg, #27272a 0%, #3f3f46 100%)',
      },
    },
  },
  plugins: [
    // Custom plugin for component utilities
    function({ addUtilities, theme }) {
      const newUtilities = {
        // Button component utilities
        '.btn-base': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.5rem',
          borderRadius: theme('borderRadius.button'),
          fontWeight: '500',
          transition: 'all 150ms ease-in-out',
          cursor: 'pointer',
          userSelect: 'none',
          border: '1px solid transparent',
        },
        '.btn-toolbar': {
          backgroundColor: theme('colors.toolbar.bg'),
          color: theme('colors.neutral.100'),
          border: `1px solid ${theme('colors.toolbar.border')}`,
          '&:hover': {
            backgroundColor: theme('colors.toolbar.hover'),
            boxShadow: theme('boxShadow.button-hover'),
          },
          '&:active': {
            boxShadow: theme('boxShadow.button-active'),
          },
          '&.active': {
            backgroundColor: theme('colors.toolbar.active'),
            borderColor: theme('colors.toolbar.active'),
            color: theme('colors.neutral.0'),
          },
        },

        // Toolbar utilities
        '.toolbar-base': {
          display: 'flex',
          backgroundColor: theme('colors.toolbar.bg'),
          borderRadius: theme('borderRadius.toolbar'),
          boxShadow: theme('boxShadow.toolbar'),
          border: `1px solid ${theme('colors.toolbar.border')}`,
        },

        // Focus utilities for accessibility
        '.focus-ring': {
          '&:focus': {
            outline: 'none',
            boxShadow: `0 0 0 3px ${theme('colors.brand.500')}40`,
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
