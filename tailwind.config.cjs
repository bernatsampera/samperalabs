import typographyPlugin from '@tailwindcss/typography';

module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,json,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        ink: '#0d1117',
        'ink-2': '#161b22',
        'ink-3': '#060a10',
        'ink-border': '#1f2630',
        'ink-border-soft': 'rgba(149,168,194,0.16)',
        text: '#d6e1f0',
        'text-strong': '#f3f7ff',
        'text-muted': '#95a8c2',
        'text-faint': '#6b7a90',
        stamp: '#6da0ff',
        marker: '#f0a14a',
        'marker-soft': 'rgba(240,161,74,0.07)',
        'marker-soft-strong': 'rgba(240,161,74,0.14)',
      },
      spacing: {
        '18': '4.5rem',
      },
      fontFamily: {
        sans: ['"PP Neue Montreal"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono Variable"', '"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        display: ['"PP Neue Montreal"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        notebook:
          'repeating-linear-gradient(0deg, transparent 0 31px, rgba(80,120,180,0.06) 31px 32px),' +
          'repeating-linear-gradient(90deg, transparent 0 31px, rgba(80,120,180,0.06) 31px 32px)',
      },
    },
  },
  plugins: [typographyPlugin],
  darkMode: 'class',
};
