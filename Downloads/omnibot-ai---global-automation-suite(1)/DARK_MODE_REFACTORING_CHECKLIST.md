# Dark Mode Component Refactoring Checklist

## ✅ Completed Components

### Fully Implemented
- [x] **DashboardView** - Stats cards, charts, neural health panel all dark-aware
- [x] **UnifiedInbox** - Sidebar, message threads, input area all styled
- [x] **LiveAssistantView** - Call button, status indicator, routing info
- [x] **MainLayout** - Header with theme toggle, search input, user info
- [x] **LoginForm** - Full auth form with dark mode CSS
- [x] **Sidebar** - Navigation with active state styling
- [x] **ThemeToggle** - Sun/Moon button component

## 🔄 Placeholder Pages (Need Styling)

The following pages show placeholder text and need proper dark mode UI:

```jsx
// Current Implementation (needs styling):
<div className="p-40 text-center font-black text-slate-300 tracking-[0.6em] animate-pulse uppercase">
  Neural Flow Designer...
</div>
```

**Affected Routes:**
- `/automations` - Neural Flow Designer
- `/customers` - Persistence database
- `/creative` - Creative Studio
- `/billing` - Neural Payments Hub
- `/settings` - Security Matrix

### Recommended Styling Pattern

```jsx
<motion.div 
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="p-10 max-w-7xl mx-auto"
>
  <div className="text-center space-y-4">
    <h1 className="text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
      Feature Name
    </h1>
    <p className="text-slate-500 dark:text-slate-400 font-medium text-xl">
      Feature description or coming soon message
    </p>
  </div>
  
  {/* Content or coming soon card */}
  <div className="mt-16 p-12 bg-white dark:bg-slate-800 rounded-[4rem] border border-slate-100 dark:border-slate-700 shadow-sm">
    <p className="text-center text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.4em]">
      Coming Soon
    </p>
  </div>
</motion.div>
```

## 📋 Dark Mode Pattern Reference

### Buttons

```tsx
// Primary Button
<button className="px-8 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-all">
  Action
</button>

// Secondary Button
<button className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-[1.5rem] font-black hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
  Secondary
</button>

// Ghost Button
<button className="px-8 py-4 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-[1.5rem] font-black hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
  Ghost
</button>
```

### Cards/Containers

```tsx
// Primary Card
<div className="p-8 bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-sm">
  {/* Content */}
</div>

// Secondary Card (slight background)
<div className="p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border border-slate-100 dark:border-slate-800">
  {/* Content */}
</div>

// Overlay/Modal
<div className="bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-2xl">
  {/* Content */}
</div>
```

### Text Colors

```tsx
// Primary Text
<p className="text-slate-900 dark:text-white">Primary text</p>

// Secondary Text
<p className="text-slate-600 dark:text-slate-400">Secondary text</p>

// Tertiary Text
<p className="text-slate-500 dark:text-slate-500">Tertiary text</p>

// Muted Text (very light)
<p className="text-slate-400 dark:text-slate-600">Muted text</p>

// Accent Text
<p className="text-indigo-600 dark:text-indigo-400">Accent text</p>
```

### Input Fields

```tsx
// Standard Input
<input 
  type="text" 
  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
  placeholder="Enter text..."
/>

// Search Input
<div className="relative">
  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-slate-600" />
  <input 
    type="text" 
    className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[1.5rem] text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/10"
    placeholder="Search..."
  />
</div>
```

### Badges/Tags

```tsx
// Info Badge
<span className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded-full border border-indigo-100 dark:border-indigo-800">
  Badge
</span>

// Success Badge
<span className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black rounded-full border border-emerald-100 dark:border-emerald-800">
  Success
</span>

// Warning Badge
<span className="px-4 py-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-black rounded-full border border-amber-100 dark:border-amber-800">
  Warning
</span>

// Danger Badge
<span className="px-4 py-1.5 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-[10px] font-black rounded-full border border-rose-100 dark:border-rose-800">
  Danger
</span>
```

### Dividers/Borders

```tsx
// Horizontal Divider
<div className="border-t border-slate-100 dark:border-slate-800" />

// Subtle Divider
<div className="border-t border-slate-100 dark:border-slate-800/50" />

// Strong Divider
<div className="border-t border-slate-200 dark:border-slate-700" />
```

### Empty States

```tsx
<div className="text-center py-20 space-y-4">
  <div className="w-20 h-20 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
    <icon className="w-10 h-10 text-slate-400 dark:text-slate-600" />
  </div>
  <h3 className="text-xl font-black text-slate-900 dark:text-white">Nothing here yet</h3>
  <p className="text-sm text-slate-500 dark:text-slate-400">
    Get started by creating your first item
  </p>
  <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all">
    Create
  </button>
</div>
```

### Modals/Overlays

```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-6"
>
  <div className="bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-2xl max-w-md w-full p-12">
    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
      Modal Title
    </h2>
    <p className="text-slate-600 dark:text-slate-400 mb-8">
      Modal content goes here.
    </p>
    <div className="flex gap-4">
      <button className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-2xl font-black hover:bg-slate-200 dark:hover:bg-slate-600 transition-all">
        Cancel
      </button>
      <button className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all">
        Confirm
      </button>
    </div>
  </div>
</motion.div>
```

### Lists

```tsx
{/* List Item */}
<button className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border-b border-slate-100 dark:border-slate-800 last:border-0">
  <img src="..." className="w-12 h-12 rounded-xl" />
  <div className="flex-1 text-left">
    <h4 className="text-sm font-black text-slate-900 dark:text-white">
      Item Title
    </h4>
    <p className="text-xs text-slate-500 dark:text-slate-400">
      Item description
    </p>
  </div>
  <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600" />
</button>
```

### Alerts/Notifications

```tsx
{/* Success Alert */}
<motion.div
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl text-sm text-emerald-600 dark:text-emerald-400 font-medium"
>
  Success message here
</motion.div>

{/* Error Alert */}
<motion.div
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-2xl text-sm text-rose-600 dark:text-rose-400 font-medium"
>
  Error message here
</motion.div>

{/* Warning Alert */}
<motion.div
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-2xl text-sm text-amber-600 dark:text-amber-400 font-medium"
>
  Warning message here
</motion.div>
```

### Tables

```tsx
<div className="overflow-x-auto">
  <table className="w-full">
    <thead>
      <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <th className="px-6 py-4 text-left text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">
          Column
        </th>
      </tr>
    </thead>
    <tbody>
      {/* Rows */}
      <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
        <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">
          Data
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

## 🎨 Color Scheme

### Base Colors
- **Light Mode**: slate-50, slate-100, slate-200, slate-900
- **Dark Mode**: slate-800, slate-900, slate-950

### Accent Colors
- **Primary**: indigo-600 (light) / indigo-400 (dark)
- **Success**: emerald-600 (light) / emerald-400 (dark)
- **Warning**: amber-600 (light) / amber-400 (dark)
- **Danger**: rose-600 (light) / rose-400 (dark)
- **Info**: cyan-600 (light) / cyan-400 (dark)

## 🧪 Testing Checklist

- [ ] Toggle dark mode and verify all text readable
- [ ] Check contrast ratios meet WCAG AA standards
- [ ] Test on different screen sizes (mobile, tablet, desktop)
- [ ] Verify smooth transitions when theme changes
- [ ] Check that images have proper contrast
- [ ] Test with browser DevTools color-blind simulator
- [ ] Ensure no white flashes on page load in dark mode
- [ ] Verify icons are visible in both modes
- [ ] Test modal/overlay contrasts
- [ ] Check button hover states in both modes

## 📸 Component Showcase

To test all components, create a `/showcase` route:

```jsx
<Route path="/showcase" element={<ComponentShowcase />} />
```

This would display all pattern examples with both light and dark modes side-by-side.

## 🚀 Implementation Tips

1. **Use `dark:` prefix consistently** - Don't mix custom CSS and Tailwind
2. **Extract repetitive patterns** - Create component utilities
3. **Test early and often** - Dark mode should be tested alongside light mode
4. **Consider system preferences** - Respect user's OS theme preference
5. **Smooth transitions** - Use `transition-all` for theme changes
6. **Accessibility first** - Ensure color contrast meets standards

## 📚 Resources

- [Tailwind Dark Mode Docs](https://tailwindcss.com/docs/dark-mode)
- [WCAG Color Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)
