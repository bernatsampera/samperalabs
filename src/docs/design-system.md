# Silent Edge Design System

The Silent Edge design system is the visual foundation of SamperaLabs. It prioritizes clarity, intentional minimalism, and confident restraint — interfaces that speak through thoughtful omission rather than excessive addition.

## DaisyUI Theme

The custom DaisyUI theme is named `silentedge` and is defined in `tailwind.config.cjs`:

```js
daisyui: {
  themes: [
    {
      silentedge: {
        "primary": "#ffffff",
        "secondary": "#303030",
        "accent": "#4a7dfc",
        "neutral": "#f7f7f7",
        "base-100": "#ffffff",
        "base-200": "#f7f7f7",
        "base-300": "#e9e9e9",
        "info": "#3abff8",
        "success": "#36d399",
        "warning": "#fbbd23",
        "error": "#f87272",
        "--rounded-box": "0.5rem",
        "--rounded-btn": "0.25rem",
        "--btn-text-case": "none",
        "--animation-btn": "0.15s",
        "--animation-input": "0.15s",
        "--padding-card": "2rem",
      }
    },
  ],
  darkTheme: 'silentedge',
}
```

## Color Palette

### Tailwind Extended Colors

Defined in `tailwind.config.cjs` under `theme.extend.colors`:

| Token | Value | Usage |
|---|---|---|
| `black` | `#111111` | Primary dark color |
| `accent` | `#d6d6d6` | Accent/highlight elements |
| `off-white` | `#f7f7f7` | Subtle background variation |
| `light-gray` | `#e9e9e9` | Light borders and dividers |
| `medium-gray` | `#d4d4d4` | Secondary borders |
| `dark-gray` | `#767676` | Muted text |
| `background` | `rgb(255 255 255)` | Page background |

### CSS Variable Colors (oklch)

Defined in `index.css` for the dark theme variant:

| Variable | Value | Usage |
|---|---|---|
| `--background` | `oklch(20.1% 0.005 285.823)` | Deep black page background |
| `--foreground` | `oklch(0.98 0 0)` | Pure white primary text |
| `--card` | `oklch(0.15 0 0)` | Card/panel surface |
| `--primary` | `oklch(0.98 0 0)` | Primary action elements |
| `--secondary` | `oklch(0.2 0 0)` | Secondary elements |
| `--muted` | `oklch(0.18 0 0)` | Muted backgrounds |
| `--muted-foreground` | `oklch(0.65 0 0)` | Muted/secondary text |
| `--border` | `oklch(0.25 0 0)` | Subtle borders |
| `--destructive` | `oklch(0.6 0.2 25)` | Error/destructive actions |

## Typography

- **Font family**: Inter (loaded via `@fontsource-variable/inter`)
- **Approach**: Bold, confident headings; clear readable body text with generous line height
- **Plugin**: `@tailwindcss/typography` for prose content styling

## Spacing and Layout

- Custom spacing token: `18` = `4.5rem`
- Box rounding: `0.5rem` (boxes), `0.25rem` (buttons)
- Card padding: `2rem`
- Button text: no forced case transformation (`--btn-text-case: none`)
- Animations: `0.15s` for buttons and inputs

## Key Principles

1. **Dark-first**: The system is designed dark-first. Always use CSS theme variables through Tailwind classes, never hardcode colors.
2. **Content-first**: Design serves content. Use intentional negative space for visual hierarchy.
3. **WCAG AAA contrast**: All color combinations maintain high contrast ratios (foreground on background: 21:1).
4. **Minimal interaction**: Subtle hover states and micro-animations, never flashy.

## Usage Rules

- Use Tailwind theme classes (`bg-background`, `text-foreground`, `bg-primary`) instead of hardcoded color values
- Use DaisyUI component classes (`btn`, `card`, `badge`) for standard UI elements
- Apply the typography plugin's `prose` class for rendered Markdown content
