# Dark Mode - Developer Onboarding Guide

## Welcome! 👋

This guide will help you understand and work with the dark mode implementation in OmniBot AI.

---

## 📁 Quick File Map

### Core Files You'll Use
```
src/
├── hooks/
│   └── useTheme.ts              ← Import this to use theme in components
├── components/
│   └── ThemeToggle.tsx          ← Add this to your headers/toolbars
└── theme/
    └── darkMode.ts             ← Customize colors here
```

### Documentation
```
├── README.md                    ← Start here for overview
├── DARK_MODE_GUIDE.md          ← Full reference guide
├── DARK_MODE_QUICK_REFERENCE.md ← Copy-paste code
├── DARK_MODE_REFACTORING_CHECKLIST.md ← Component patterns
├── DARK_MODE_IMPLEMENTATION_STATUS.md ← Project status
└── DARK_MODE_DELIVERY_SUMMARY.md ← What was delivered
```

### Main Application
```
├── index.html                   ← Dark mode init script here
├── App.tsx                      ← Examples of dark mode usage
```

---

## 🎯 The 5-Minute Overview

### What is Dark Mode?
Dark mode is a rendering of the UI with a dark color scheme instead of light. Users can toggle between light and dark themes.

### What We Built
- ✅ **User Toggle**: Button to switch between light/dark modes
- ✅ **Persistence**: User preference saved in browser
- ✅ **Auto Detection**: Respects system dark mode preference
- ✅ **100% Coverage**: All UI components styled for both modes

### How It Works (High Level)
```
User clicks toggle
    ↓
useTheme hook updates state
    ↓
localStorage saves preference
    ↓
"dark" class added to <html>
    ↓
Tailwind CSS applies dark: prefixed classes
    ↓
Entire app theme changes instantly
```

---

## 🔧 How to Use Dark Mode in Your Components

### Option 1: Simple Tailwind Classes (Recommended)
```tsx
<div className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
  This changes automatically when theme switches
</div>
```

**When to use**: 90% of the time. For simple color changes.

### Option 2: Use the Theme Hook
```tsx
import { useTheme } from './src/hooks/useTheme';

function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  );
}
```

**When to use**: When you need to know the current theme like for charts or dynamic colors.

### Option 3: Get Dynamic Colors
```tsx
import { useTheme } from './src/hooks/useTheme';
import { chartColors } from './src/theme/darkMode';

function MyChart() {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? chartColors.dark : chartColors.light;
  
  return (
    <Chart>
      <Line stroke={colors.primary} />
    </Chart>
  );
}
```

**When to use**: For charts, images, or canvas elements that need explicit colors.

---

## 🎨 Color System

### Where Colors Are Defined
**File**: `src/theme/darkMode.ts`

### How to Change Colors
1. Open `src/theme/darkMode.ts`
2. Edit the `chartColors` object:
   ```typescript
   export const chartColors = {
     light: {
       primary: '#4f46e5',      // Change this
       secondary: '#06b6d4',
       // ...
     },
     dark: {
       primary: '#818cf8',      // Change this
       secondary: '#22d3ee',
       // ...
     }
   };
   ```
3. Save and refresh - changes apply everywhere

### Standard Colors by Role

**Text**:
- Primary: `text-slate-900` (light) / `dark:text-white` (dark)
- Secondary: `text-slate-600` (light) / `dark:text-slate-400` (dark)

**Backgrounds**:
- Primary: `bg-white` (light) / `dark:bg-slate-800` (dark)
- Secondary: `bg-slate-50` (light) / `dark:bg-slate-900` (dark)

**Borders**:
- Primary: `border-slate-100` (light) / `dark:border-slate-700` (dark)

---

## ✅ Adding Dark Mode to a New Component

### Step-by-Step

1. **Write your light mode component**
   ```tsx
   <div className="p-8 bg-white rounded-xl shadow">
     <h3 className="text-slate-900">Hello</h3>
     <p className="text-slate-600">World</p>
   </div>
   ```

2. **Add dark: classes**
   ```tsx
   <div className="p-8 bg-white dark:bg-slate-800 rounded-xl shadow">
     <h3 className="text-slate-900 dark:text-white">Hello</h3>
     <p className="text-slate-600 dark:text-slate-400">World</p>
   </div>
   ```

3. **Add borders and hover states**
   ```tsx
   <div className="p-8 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow hover:bg-slate-50 dark:hover:bg-slate-700">
     <h3 className="text-slate-900 dark:text-white">Hello</h3>
     <p className="text-slate-600 dark:text-slate-400">World</p>
   </div>
   ```

4. **Test both modes**: Use the toggle button to verify

---

## 🧪 Testing Your Dark Mode

### Manual Testing
1. Start app: `npm run dev`
2. Click sun/moon icon in header
3. Verify your component looks good
4. Refresh page - theme should persist
5. Toggle again to confirm

### Automated Checks
- Check contrast: Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Browser DevTools: Settings → Rendering → Emulate CSS media feature prefers-color-scheme

### Common Issues
| Problem | Solution |
|---------|----------|
| Colors not changing | Did you add `dark:` prefix? |
| Text not readable | Check color contrast |
| Looks flashed white | Script in index.html may not run |
| Chart colors wrong | Use `getChartTheme(isDark)` helper |

---

## 🎯 Common Patterns

### Navigation Item (Active/Inactive)
```tsx
<button className={`
  px-4 py-2 rounded transition-all
  ${isActive 
    ? 'bg-indigo-600 text-white' 
    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
  }
`}>
  Nav Item
</button>
```

### Card Container
```tsx
<div className="p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
  {/* content */}
</div>
```

### Input Field
```tsx
<input 
  className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
  placeholder="Type something..."
/>
```

### Empty State
```tsx
<div className="text-center py-12">
  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto flex items-center justify-center mb-4">
    <Icon className="text-slate-400" />
  </div>
  <h3 className="text-slate-900 dark:text-white font-bold mb-2">Nothing here</h3>
  <p className="text-slate-500 dark:text-slate-400 mb-4">Get started</p>
  <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Create</button>
</div>
```

---

## 🔍 Real-World Examples

See these files for working examples:

| File | Component | Lines |
|------|-----------|-------|
| App.tsx | DashboardView | 60-180 |
| App.tsx | UnifiedInbox | 184-405 |
| App.tsx | LiveAssistantView | 409-490 |
| App.tsx | LoginForm | 500-560 |

---

## 📊 Charts with Dark Mode

### Using Recharts
```tsx
import { useTheme } from './src/hooks/useTheme';
import { getChartTheme } from './src/theme/darkMode';
import { ResponsiveContainer, LineChart, Line } from 'recharts';

function MyChart({ data }) {
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

---

## 🚀 Deployment Checklist

Before deploying your updated component:

- [ ] Added `dark:` classes for all colors
- [ ] Tested in both light and dark modes
- [ ] Text is readable (good contrast)
- [ ] No hardcoded colors that break in dark mode
- [ ] Hover/focus states work in both modes
- [ ] Images/icons visible in both modes
- [ ] Mobile responsive in both themes
- [ ] No console errors

---

## 📚 When You Need More Info

| Question | Ask Here |
|----------|----------|
| "How do I..." | DARK_MODE_QUICK_REFERENCE.md |
| "What colors should I..." | DARK_MODE_GUIDE.md |
| "Show me a pattern for..." | DARK_MODE_REFACTORING_CHECKLIST.md |
| "What's the status of..." | DARK_MODE_IMPLEMENTATION_STATUS.md |
| "I need to understand..." | README.md |
| "Show me real code..." | App.tsx |

---

## 💡 Pro Tips

### 1. Consistent Spacing
Use the same spacing for all components:
```tsx
// Cards: p-8
// Buttons: px-6 py-3
// Inputs: px-4 py-3
```

### 2. Color Hierarchy
Always use a consistent color scheme:
```tsx
// Primary button
bg-indigo-600 dark:bg-indigo-500

// Secondary button
bg-slate-100 dark:bg-slate-800

// Danger button
bg-rose-600 dark:bg-rose-500
```

### 3. Test on Real Devices
Don't just test in browser - check on:
- Phone in low light
- Tablet landscape mode
- Desktop with different monitor brightness

### 4. Respect User Preference
Always include the theme toggle prominently so users can choose their preference.

---

## 🆘 Troubleshooting

### My colors don't change
```
Issue: Used color without dark: prefix
Fix: Add dark: prefix
BGefore: className="bg-white"
After: className="bg-white dark:bg-slate-800"
```

### Text not readable
```
Issue: Bad color contrast
Fix: Test with contrast checker or try lighter/darker color
Before: dark:text-slate-600    (too dark on dark background)
After: dark:text-slate-300     (better contrast)
```

### Chart colors look wrong
```
Issue: Not using getChartTheme helper
Fix: Use proper theme helper
Before: stroke="#4f46e5"  (always light blue)
After: stroke={chartTheme.colors[0]}  (changes with theme)
```

### Weird behavior with toggle
```
Issue: Component not using useTheme hook
Fix: Add hook to track theme changes
Before: const isDark = localStorage.getItem('theme') === 'dark';
After: const { theme } = useTheme(); const isDark = theme === 'dark';
```

---

## 🎓 Learning Resources

### Tailwind Dark Mode
- Official docs: https://tailwindcss.com/docs/dark-mode
- Using `dark:` prefix
- Class strategy vs media query

### React Hooks
- useState for local state
- useEffect for side effects
- useContext for global state (not used here, but good to know)

### localStorage API
- `localStorage.getItem(key)`
- `localStorage.setItem(key, value)`
- `localStorage.removeItem(key)`

### Color Theory
- WCAG contrast guidelines
- Color blindness considerations
- Saturation and brightness in light vs dark

---

## 🎯 Your First Task

Ready to get started?

1. Open `src/hooks/useTheme.ts` - Understand how it works
2. Open `App.tsx` - Find examples of dark mode usage
3. Find a component that needs updating
4. Add `dark:` classes following the patterns
5. Test in both light and dark modes
6. Submit for review

---

## 🤝 Questions?

Check the docs in this order:
1. **DARK_MODE_QUICK_REFERENCE.md** - For quick answers
2. **DARK_MODE_GUIDE.md** - For deeper understanding
3. **DARK_MODE_REFACTORING_CHECKLIST.md** - For patterns
4. **App.tsx** - For real working examples

---

## ✅ You're Ready!

You now understand:
- ✅ How dark mode works
- ✅ Where files are located  
- ✅ How to use the theme hook
- ✅ How to add dark mode to components
- ✅ Where to find help

**Go build something amazing! 🚀**
