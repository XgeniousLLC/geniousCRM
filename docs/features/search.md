---
title: Global Search
parent: Features
nav_order: 17
---

# Global Search
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }
1. TOC
{:toc}

---

## Overview

Global Search lets you find contacts, leads, and deals in one unified input without navigating between modules.

**Route:** `GET /search?q=...`
**Module:** `Core` (`SearchController`)
**Access:** All roles

---

## Using the Search Bar

The search bar sits in the top header. Press `/` anywhere in the app to focus it, or click it directly.

- Start typing — results appear after **2 characters**.
- Results are **debounced** by 300 ms to avoid excessive requests while typing.
- Press `Escape` to close the results panel.

---

## Results Panel

Results are grouped by entity type with coloured badges:

| Group | Badge colour | Fields searched |
|-------|-------------|-----------------|
| Contacts | Blue | Name, email |
| Leads | Amber | Name, email |
| Deals | Green | Title |

Each result shows the record name and a small entity badge. Clicking a result navigates directly to that record's detail page.

---

## API Endpoint

```
GET /search?q=acme
```

Returns:

```json
{
  "contacts": [
    { "id": 1, "name": "Alice Smith", "email": "alice@acme.com", "url": "/contacts/1" }
  ],
  "leads": [
    { "id": 5, "name": "Acme Deal Lead", "email": "bob@acme.com", "url": "/leads/5" }
  ],
  "deals": [
    { "id": 3, "title": "Acme Website Redesign", "url": "/deals/3" }
  ]
}
```

- Results are limited to 5 per group.
- Requires at least 2 characters.

---

## Keyboard Shortcut

| Key | Action |
|-----|--------|
| `/` | Focus the search bar |
| `Escape` | Close results dropdown |

---

## Controller Reference

**File:** `Modules/Core/app/Http/Controllers/SearchController.php`

| Method | Route | Description |
|--------|-------|-------------|
| `search` | `GET /search` | Returns grouped JSON results for contacts, leads, and deals |
