# General Settings

Admins can customise the application appearance and metadata from the Settings page.

## Accessing Settings

Go to **Settings → General** in the sidebar (Admin only).

## Available Settings

| Setting | Description |
|---------|-------------|
| **Application Title** | Shown in the browser tab and on the login page |
| **Meta Description** | `<meta name="description">` tag for SEO |
| **Meta Keywords** | `<meta name="keywords">` tag for SEO |
| **Logo** | Image uploaded to storage, shown in the sidebar header |
| **Favicon** | `.ico` or `.png` file shown in browser tabs |

## Updating Settings

1. Fill in or update the fields
2. For logo and favicon: click the file input and select an image from your computer
3. Click **Save Settings**

Changes apply immediately to all users on the next page load.

## Logo and Favicon

- **Logo** — recommended size: 200 × 50px, PNG with transparent background
- **Favicon** — standard `.ico` format, 32 × 32px or 64 × 64px

Uploaded files are stored in `storage/app/public` and served from `/storage/`. The `storage:link` command must have been run for this to work.

## Settings Storage

Settings are stored in a `settings` table as key/value pairs. They are shared globally via Inertia's `share()` mechanism, so every page has access to them without an extra database query.
