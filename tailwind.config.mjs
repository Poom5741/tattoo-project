/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Bone & Blood color system
        surface: {
          DEFAULT: '#fbf9f3',
          dim: '#dcdad4',
          bright: '#fbf9f3',
          container: {
            lowest: '#ffffff',
            low: '#f5f3ed',
            DEFAULT: '#f0eee8',
            high: '#eae8e2',
            highest: '#e4e2dd',
          },
          variant: '#e4e2dd',
          tint: '#c0001b',
        },
        'on-surface': {
          DEFAULT: '#1b1c18',
          variant: '#5e3f3c',
        },
        'inverse-surface': '#30312d',
        'inverse-on-surface': '#f3f1eb',
        'inverse-primary': '#ffb3ad',
        outline: {
          DEFAULT: '#936e6b',
          variant: '#e8bcb8',
        },
        primary: {
          DEFAULT: '#b7001a',
          container: '#e60023',
          fixed: '#ffdad7',
          'fixed-dim': '#ffb3ad',
        },
        'on-primary': {
          DEFAULT: '#ffffff',
          container: '#fff7f6',
          fixed: '#410004',
          'fixed-variant': '#930012',
        },
        secondary: {
          DEFAULT: '#615e5b',
          container: '#e5dedb',
          fixed: '#e7e1de',
          'fixed-dim': '#cbc5c2',
        },
        'on-secondary': {
          DEFAULT: '#ffffff',
          container: '#65625f',
          fixed: '#1d1b19',
          'fixed-variant': '#494644',
        },
        tertiary: {
          DEFAULT: '#5e5a52',
          container: '#77726a',
          fixed: '#e9e1d8',
          'fixed-dim': '#ccc5bc',
        },
        'on-tertiary': {
          DEFAULT: '#ffffff',
          container: '#fff8f1',
          fixed: '#1e1b15',
          'fixed-variant': '#4a463f',
        },
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
        },
        'on-error': {
          DEFAULT: '#ffffff',
          container: '#93000a',
        },
        background: '#fbf9f3',
        'on-background': '#1b1c18',
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Sora', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg-mobile': ['36px', { lineHeight: '44px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'headline-md': ['32px', { lineHeight: '40px', fontWeight: '600' }],
        'headline-sm': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'label-md': ['14px', { lineHeight: '20px', letterSpacing: '0.02em', fontWeight: '600' }],
        'label-sm': ['12px', { lineHeight: '16px', letterSpacing: '0.02em', fontWeight: '600' }],
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        full: '9999px',
      },
      spacing: {
        'gutter': '24px',
        'margin-desktop': '64px',
        'margin-mobile': '20px',
        'container-max': '1280px',
      },
      maxWidth: {
        'container-max': '1280px',
      },
    },
  },
  plugins: [],
}
