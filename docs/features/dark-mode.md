# Dark Mode

Mini CRM ships with full dark mode support. Every page, modal, sidebar, and chart respects the active theme.

## Toggling Dark Mode

Click the **sun/moon icon** (☀️ / 🌙) in the top-right header to switch between light and dark mode.

Your preference is saved to `localStorage` and persists across browser sessions — you won't need to switch it again after reloading.

## How It Works

The theme is applied by adding or removing the `dark` class on the `<html>` element. All colours use CSS variables, so the switch is instant with no page reload.

The preference is restored before the first paint to prevent a white flash on dark-mode users:

```html
<!-- Runs before body renders -->
<script>
  if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.classList.add('dark');
  }
</script>
```

## System Preference

The current implementation uses an explicit toggle only — it does not auto-detect your OS dark mode preference. Set your preferred theme manually using the toggle.
