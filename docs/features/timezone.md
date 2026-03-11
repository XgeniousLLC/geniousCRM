---
title: Timezone Support
parent: Features
nav_order: 22
---

# Timezone Support
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }
1. TOC
{:toc}

---

## Overview

Each user can set their own timezone. All relative timestamps and formatted dates in the UI are displayed in the user's local timezone.

---

## Setting Your Timezone

1. Click your avatar in the top header.
2. Select **Profile**.
3. Scroll to the **Personal Information** form.
4. Choose your timezone from the **Timezone** dropdown.
5. Click **Save Changes**.

The dropdown lists all valid PHP timezone identifiers (e.g. `Europe/London`, `America/New_York`, `Asia/Dhaka`).

---

## How It Works

When a user is authenticated, `AppServiceProvider` reads their `timezone` setting and applies it to the running PHP process:

```php
$this->app->booted(function () {
    if ($user = auth()->user()) {
        if ($user->timezone) {
            config(['app.timezone' => $user->timezone]);
            date_default_timezone_set($user->timezone);
        }
    }
});
```

This means all PHP date operations (Carbon instances, `diffForHumans()`, formatted timestamps) use the user's timezone for the duration of that request.

---

## Affected Dates

| Display | Example |
|---------|---------|
| Relative timestamps | "2 hours ago", "3 days ago" |
| Notification timestamps | Dropdown in bell icon |
| Activity feed timestamps | Per-entity feeds |
| Task due dates | Shown in user's local day |
| Follow-up date badges | Overdue detection based on user timezone |

---

## Default Timezone

If no timezone is set on the user's profile, the application falls back to the `APP_TIMEZONE` value in `.env` (default `UTC`).

---

## Database Storage

All timestamps in the database are stored in **UTC**. The conversion to the user's timezone happens at the presentation layer only, never affecting stored data.

---

## Database Column

```
users
└── timezone (nullable string, e.g. "Europe/London")
```

Added via migration `2026_03_11_400000_add_timezone_to_users_table.php`.

---

## Profile Page Reference

**File:** `Modules/Core/resources/js/Pages/Profile.jsx`

The timezone dropdown is populated server-side:

```php
// ProfileController::edit()
'timezones' => DateTimeZone::listIdentifiers(),
```

This returns the full list of ~430 PHP timezone identifiers, passed as an Inertia prop and rendered in a `<select>` element.
