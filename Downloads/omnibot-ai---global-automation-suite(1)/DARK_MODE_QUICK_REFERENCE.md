# Dark Mode Quick Reference

## TL;DR - Get Started in 30 seconds

### 1. Import and use the theme hook
```typescript
import { useTheme } from './src/hooks/useTheme';

function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  
  return <button onClick={toggleTheme}>Toggle Theme</button>;
}
```

### 2. Use `dark:` prefix in Tailwind classes
```jsx
<div className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
  This changes automatically with theme
</div>
```

### 3. For dynamic styling (like charts)
```typescript
import { useTheme } from './src/hooks/useTheme';

const { theme } = useTheme();
const isDark = theme === 'dark';

// Use isDark boolean to conditionally render or style
const backgroundColor = isDark ? '#1e293b' : '#ffffff';
```

---

## Quick Copy-Paste Templates

### Card Component
```tsx
<div className="p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Card Title</h3>
  <p className="text-slate-600 dark:text-slate-400 mt-2">Content here</p>
</div>
```

### Button Component
```tsx
<button className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-colors">
  Click me
</button>
```

### Input Field
```tsx
<input 
  type="text"
  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
  placeholder="Type here..."
/>
```

### Section with Title
```tsx
<section className="space-y-6">
  <div>
    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Section Title</h2>
    <p className="text-slate-600 dark:text-slate-400">Description</p>
  </div>
  {/* Content here */}
</section>
```

---

## Color Quick Reference

### Text Colors
| Role | Light | Dark |
|------|-------|------|
| Primary | `text-slate-900` | `dark:text-white` |
| Secondary | `text-slate-600` | `dark:text-slate-400` |
| Tertiary | `text-slate-500` | `dark:text-slate-500` |
| Muted | `text-slate-400` | `dark:text-slate-600` |
| Accent | `text-indigo-600` | `dark:text-indigo-400` |

### Background Colors
| Role | Light | Dark |
|------|-------|------|
| Primary | `bg-white` | `dark:bg-slate-800` |
| Secondary | `bg-slate-50` | `dark:bg-slate-900` |
| Tertiary | `bg-slate-100` | `dark:bg-slate-800` |
| Muted | `bg-slate-200` | `dark:bg-slate-700` |
| Accent | `bg-indigo-50` | `dark:bg-indigo-900/30` |

### Border Colors
| Role | Light | Dark |
|------|-------|------|
| Primary | `border-slate-100` | `dark:border-slate-700` |
| Secondary | `border-slate-200` | `dark:border-slate-600` |
| Subtle | `border-slate-100` | `dark:border-slate-800/50` |

---

## Component Checklist

When building a new component, ensure you have dark mode classes for:

- [ ] Background color (`bg-white dark:bg-slate-800`)
- [ ] Text color (`text-slate-900 dark:text-white`)
- [ ] Border color (`border-slate-100 dark:border-slate-700`)
- [ ] Hover states (`hover:bg-slate-100 dark:hover:bg-slate-700`)
- [ ] Focus states (`focus:ring-indigo-500`)
- [ ] Placeholder text (`placeholder-slate-400 dark:placeholder-slate-600`)
- [ ] Icons/SVGs (inherit color or explicit `dark:text-white`)

---

## Common Patterns

### Toggle Button - Classic Dark Mode
```tsx
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './src/hooks/useTheme';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-slate-600" />
      ) : (
        <Sun className="w-5 h-5 text-slate-400" />
      )}
    </button>
  );
}
```

### Conditional Styling Based on Theme
```tsx
import { useTheme } from './src/hooks/useTheme';

function MyChart() {
  const { theme } = useTheme();
  
  const colors = {
    background: theme === 'dark' ? '#1e293b' : '#ffffff',
    text: theme === 'dark' ? '#f1f5f9' : '#0f172a',
    grid: theme === 'dark' ? '#334155' : '#e2e8f0',
  };
  
  return (
    <div style={{ backgroundColor: colors.background }}>
      {/* Use colors object */}
    </div>
  );
}
```

### Icon with Proper Dark Mode
```tsx
// Good - Icon inherits text color
<Info className="w-5 h-5 text-slate-600 dark:text-slate-400" />

// Also good - Explicit both states
<Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
```

### Gradient with Dark Mode
```jsx
<div className="bg-gradient-to-r from-indigo-50 dark:from-indigo-900/20 to-cyan-50 dark:to-cyan-900/20 p-8 rounded-2xl">
  Gradient content
</div>
```

### Shadow with Dark Mode
```jsx
<div className="shadow-lg dark:shadow-slate-900/50">
  Content with shadow
</div>
```

---

## Testing

### Using DevTools
1. Open DevTools (`F12`)
2. Go to Console and type:
   ```javascript
   localStorage.setItem('theme', 'dark');
   location.reload();
   ```
3. Or use the Theme Toggle button in the app header

### Checking localStorage
```javascript
// Check current theme
localStorage.getItem('theme');

// Set theme manually
localStorage.setItem('theme', 'dark');
localStorage.setItem('theme', 'light');

// Clear theme (resets to system preference)
localStorage.removeItem('theme');
```

### Testing Contrast
- Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Browser DevTools → Rendering → Emulate CSS media feature prefers-color-scheme

---

## Troubleshooting

**Q: Theme not applying?**
A: Make sure you're using `dark:` prefix from Tailwind, not custom CSS. Check that layout element has `dark` class (handled automatically by useTheme hook).

**Q: Colors look wrong in dark mode?**
A: Check that you have both light AND dark versions of the color. Example:
```jsx
// ✅ Correct
<p className="text-slate-900 dark:text-white">Text</p>

// ❌ Wrong - will stay light color in dark mode
<p className="text-slate-900">Text</p>
```

**Q: Transition too fast/slow?**
A: Adjust transition timing in your CSS:
```jsx
<div className="transition-colors duration-200">  {/* 200ms */}
  Content
</div>
```

**Q: White flash on page load?**
A: This should be prevented by the script in `index.html`. If you still see it:
1. Check that script runs before React hydration
2. Verify localStorage is enabled in browser
3. Check that the `root-html` element exists in your HTML

---

## Performance Tips

1. **Use `mounted` state** to avoid hydration mismatches:
   ```typescript
   const { mounted, theme } = useTheme();
   if (!mounted) return null;
   ```

2. **Memoize color calculations**:
   ```typescript
   const chartTheme = useMemo(() => getChartTheme(isDark), [isDark]);
   ```

3. **Use CSS `prefers-color-scheme` media query** for system preference:
   ```css
   @media (prefers-color-scheme: dark) {
     /* dark mode styles */
   }
   ```

---

## Quick File Reference

| File | Purpose |
|------|---------|
| `src/hooks/useTheme.ts` | Theme state management hook |
| `src/components/ThemeToggle.tsx` | Reusable toggle button |
| `src/theme/darkMode.ts` | Color schemes and utilities |
| `index.html` | Dark mode initialization script |

---

## Resources

- [Tailwind Dark Mode Documentation](https://tailwindcss.com/docs/dark-mode)
- [Full Dark Mode Guide](./DARK_MODE_GUIDE.md)
- [Component Refactoring Checklist](./DARK_MODE_REFACTORING_CHECKLIST.md)
- [WCAG Color Contrast Guide](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)

---

## Need More Help?

- Check [DARK_MODE_GUIDE.md](./DARK_MODE_GUIDE.md) for comprehensive documentation
- See [DARK_MODE_REFACTORING_CHECKLIST.md](./DARK_MODE_REFACTORING_CHECKLIST.md) for all component patterns
- Review [App.tsx](./App.tsx) for real-world examples in your codebase
