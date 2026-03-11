---
title: Settings
parent: Features
nav_order: 14
---

# Settings
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }
1. TOC
{:toc}

---

## Overview

The General Settings page lets admins configure application-wide options such as the app name, logo, and meta tags. Settings are stored in a key/value table and shared globally via Inertia.

**Route:** `GET /settings`
**Module:** `Core`
**Access:** Admin only

---

## Available Settings

| Setting Key | Label | Description |
|-------------|-------|-------------|
| `app_name` | Application Name | Displayed in the browser tab and top header |
| `app_description` | Meta Description | `<meta name="description">` tag in the HTML head |
| `app_keywords` | Meta Keywords | `<meta name="keywords">` tag in the HTML head |
| `app_logo` | Logo | Uploaded image shown in the sidebar header |
| `app_favicon` | Favicon | `.ico` or `.png` shown in browser tab |

---

## Updating Settings

1. Navigate to **Settings** in the sidebar.
2. Update any field.
3. Click **Save Settings**.

File uploads (logo, favicon) are stored in `storage/app/public/`. Run `php artisan storage:link` once after installation to make them publicly accessible.

---

## How Settings Are Applied

Settings are loaded once per request in `AppServiceProvider` via `SettingService::all()` and shared with all Inertia pages:

```php
Inertia::share([
    'settings' => SettingService::all(),
]);
```

The root Blade layout (`resources/views/app.blade.php`) reads them for:

```html
<title>{{ $page['props']['settings']['app_name'] ?? 'Mini CRM' }}</title>
<meta name="description" content="...">
<meta name="keywords" content="...">
<link rel="icon" href="...">
```

---

## SettingService

**File:** `Modules/Core/app/Services/SettingService.php`

| Method | Description |
|--------|-------------|
| `get(string $key, $default = null)` | Read a single setting value |
| `set(string $key, string $value)` | Write a setting (upsert) |
| `all(): array` | Return all settings as key→value array |

---

## Database Schema

```
settings
├── id
├── key (unique string)
├── value (nullable text)
├── created_at
└── updated_at
```

---

## Controller Reference

**File:** `Modules/Core/app/Http/Controllers/SettingController.php`

| Method | Route | Description |
|--------|-------|-------------|
| `index` | `GET /settings` | Show settings form |
| `update` | `POST /settings` | Save all settings (file upload + text fields) |
