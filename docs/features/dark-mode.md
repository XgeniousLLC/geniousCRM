---
title: Dark Mode
parent: Features
nav_order: 19
---

# Dark Mode
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }
1. TOC
{:toc}

---

## Overview

Mini CRM ships with a full dark mode that covers every page and component. The preference is stored in `localStorage` and applied instantly on page load without any flash of unstyled content (FOUC).

---

## Toggling Dark Mode

Click the **sun / moon icon** in the top-right header (next to your avatar).

- Sun icon = currently in light mode → click to switch to dark.
- Moon icon = currently in dark mode → click to switch to light.

The change is applied immediately to the entire UI.

---

## Preference Persistence

Your preference is saved in `localStorage` under the key `theme`:

| Value | Mode |
|-------|------|
| `"dark"` | Dark mode active |
| `"light"` (or absent) | Light mode active |

The preference persists across page reloads, browser restarts, and new tabs on the same device. It is **not** stored on the server — each browser / device has its own setting.

---

## Flash-Free Loading

To prevent a white flash on dark-mode users, an inline script in the HTML `<head>` reads `localStorage` and applies the `dark` class to `<html>` before any CSS or React loads:

```html
<script>
  (function () {
    try {
      if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.classList.add('dark');
      }
    } catch (e) {}
  })();
</script>
```

This runs synchronously, so the correct theme is applied before the first paint.

---

## How Dark Mode is Implemented

The design uses **Tailwind CSS v4 CSS custom properties**. All colours are defined as CSS variables (design tokens) on `:root`. Dark mode overrides them under `html.dark`:

```css
/* Light mode (default) */
:root {
  --color-background: 0 0% 100%;
  --color-foreground: 240 10% 3.9%;
  --color-card: 0 0% 100%;
  /* ... 15 more tokens ... */
}

/* Dark mode overrides */
@layer base {
  html.dark {
    --color-background: 240 10% 3.9%;
    --color-foreground: 0 0% 98%;
    --color-card: 240 10% 3.9%;
    /* ... */
  }
}
```

Because every component uses these tokens (e.g. `bg-background`, `text-foreground`), the entire UI switches automatically when the class toggles — no component-level dark variants needed.

---

## `useDarkMode` Hook

Located in `TopHeader.jsx`, the hook manages the React state and side effects:

```js
function useDarkMode() {
    const [dark, setDark] = useState(() => {
        try { return localStorage.getItem('theme') === 'dark'; } catch (_) { return false; }
    });

    const toggle = () => {
        const next = !dark;
        setDark(next);
        document.documentElement.classList.toggle('dark', next);
        try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch (_) {}
    };

    return [dark, toggle];
}
```

---

## Files Involved

| File | Role |
|------|------|
| `resources/css/app.css` | Dark mode CSS token overrides in `@layer base` |
| `resources/views/app.blade.php` | Inline script to restore dark class before paint |
| `Modules/Core/resources/js/Components/Layout/TopHeader.jsx` | Toggle button and `useDarkMode` hook |
