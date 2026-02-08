# Dark Mode Implementation Guide

## Overview

Your OmniBot app now has full dark mode support with:
- ✅ Persistent localStorage theme
- ✅ System preference detection
- ✅ Smooth transitions between light and dark modes
- ✅ Dark mode aware Recharts
- ✅ Custom color themes for charts

## How It Works

### 1. Theme Hook (`src/hooks/useTheme.ts`)

```typescript
import { useTheme } from './src/hooks/useTheme';

function MyComponent() {
  const { theme, toggleTheme, mounted } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  );
}
```

**Properties:**
- `theme`: 'light' | 'dark' - Current theme
- `toggleTheme()`: Function to toggle between light and dark
- `mounted`: Boolean - Ensures hydration safety

### 2. Theme Toggle Component (`src/components/ThemeToggle.tsx`)

Drop-in component with sun/moon icons:

```typescript
import { ThemeToggle } from './src/components/ThemeToggle';

function Header() {
  return <ThemeToggle />;  // Automatically handles theme switching
}
```

## Using Dark Mode Classes

### Option 1: Tailwind `dark:` Prefix

```tsx
<div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
  Content that changes in dark mode
</div>
```

### Option 2: Pre-built Class Sets

```typescript
import { darkModeClasses } from './src/theme/darkMode';

<div className={darkModeClasses.bg.primary}>  {/* white / slate-900 */}
  <p className={darkModeClasses.text.primary}>Text</p>  {/* slate-900 / white */}
</div>
```

Available classes:
- `darkModeClasses.bg.primary` - Main background
- `darkModeClasses.bg.secondary` - Secondary background
- `darkModeClasses.text.primary` - Main text
- `darkModeClasses.text.secondary` - Secondary text
- `darkModeClasses.border.primary` - Main border
- `darkModeClasses.hover.bg` - Hover background

### Option 3: Custom Hook for Dynamic Colors

```typescript
import { useTheme } from './src/hooks/useTheme';
import { chartColors } from './src/theme/darkMode';

function ChartComponent() {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? chartColors.dark : chartColors.light;
  
  return (
    <div style={{ backgroundColor: colors.background }}>
      {/* Use colors.primary, colors.secondary, etc. */}
    </div>
  );
}
```

## Dark Mode Charts (Recharts)

### Using getChartTheme Helper

```typescript
import { getChartTheme } from './src/theme/darkMode';
import { useTheme } from './src/hooks/useTheme';

function MyChart() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const chartTheme = getChartTheme(isDark);
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid {...chartTheme.cartesianGridStyles} />
        <XAxis {...chartTheme.cartesianAxisStyles} />
        <YAxis {...chartTheme.cartesianAxisStyles} />
        <Tooltip contentStyle={chartTheme.tooltipStyle} />
        <Line 
          dataKey="value" 
          stroke={chartTheme.colors[0]}
          dot={{ fill: chartTheme.colors[0] }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

### Color Palette

**Light Mode:**
- Primary: #4f46e5 (indigo-600)
- Secondary: #06b6d4 (cyan-500)
- Success: #10b981 (emerald-500)
- Warning: #f59e0b (amber-500)
- Danger: #ef4444 (red-500)

**Dark Mode:**
- Primary: #818cf8 (indigo-400)
- Secondary: #22d3ee (cyan-400)
- Success: #34d399 (emerald-400)
- Warning: #fbbf24 (amber-400)
- Danger: #f87171 (red-400)

## Storage & Persistence

Theme is automatically saved to `localStorage` with key `'theme'`:

```javascript
// Get stored theme
const theme = localStorage.getItem('theme');  // 'light' | 'dark'

// Manually set theme
localStorage.setItem('theme', 'dark');
```

## System Preference Fallback

If no theme is set in localStorage, the app respects system preferences:

```javascript
const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
```

## File Structure

```
src/
├── hooks/
│   └── useTheme.ts              # Theme state management
├── components/
│   └── ThemeToggle.tsx          # Sun/Moon toggle button
└── theme/
    └── darkMode.ts             # Color schemes & utilities
```

## CSS Variables (Optional)

You can extend the theme with CSS variables:

```css
:root {
  --color-primary: #4f46e5;
  --color-text: #0f172a;
}

html.dark :root {
  --color-primary: #818cf8;
  --color-text: #f1f5f9;
}
```

Then use in components:

```tsx
<div style={{ color: 'var(--color-text)' }}>Text</div>
```

## Browser Support

- ✅ Chrome/Edge 76+
- ✅ Firefox 67+
- ✅ Safari 12.1+
- ✅ iOS Safari 13+

## Troubleshooting

**Theme not persisting?**
- Check browser localStorage is enabled
- Clear localStorage and refresh: `localStorage.clear()`

**Charts not updating?**
- Ensure `useTheme()` is called in the chart component
- Re-render component when theme changes

**Flash on page load?**
- The `<script>` tag in `index.html` runs before React hydrates
- This prevents white flash in dark mode

## Best Practices

1. **Always handle mounting state** to avoid hydration mismatches:
   ```typescript
   const { mounted } = useTheme();
   if (!mounted) return null;
   ```

2. **Use semantic class names**:
   ```tsx
   // ✅ Good
   <div className="bg-slate-900 dark:bg-slate-950">
   
   // ❌ Avoid magic numbers
   <div style={{ backgroundColor: isDark ? '#020617' : '#0f172a' }}>
   ```

3. **Extract repeated patterns into components**:
   ```typescript
   // Instead of duplicating dark: prefixes
   export const Card = ({ children }) => (
     <div className="bg-white dark:bg-slate-800 rounded-lg">
       {children}
     </div>
   );
   ```

4. **Test in dark mode** during development:
   - Use browser DevTools: Ctrl+Shift+M (or Cmd+Shift+M)
   - Toggle theme with ThemeToggle button
   - Check both automatic and manual transitions

## Extending the Theme

To add more colors or customize the theme:

1. Edit `src/theme/darkMode.ts`
2. Update `chartColors` object:
   ```typescript
   export const chartColors = {
     light: {
       customColor: '#123456',
       // ... more colors
     },
     dark: {
       customColor: '#abcdef',
       // ... more colors
     }
   };
   ```

3. Use in your components:
   ```typescript
   const { theme } = useTheme();
   const customColor = theme === 'dark' 
     ? chartColors.dark.customColor 
     : chartColors.light.customColor;
   ```
