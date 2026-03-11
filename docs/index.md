---
title: Home
nav_order: 1
---

# Mini CRM Documentation
{: .no_toc }

**Developed by [Xgenious](https://xgenious.com) — Free & Open Source under the MIT License**

A fully-featured, modular CRM built with **Laravel 12**, **Inertia.js**, **React 19**, and **Tailwind CSS**. Manage contacts, leads, deals, tasks, companies, and activity — all in one self-hostable package.

---

## Quick Links
{: .no_toc }

| Section | Description |
|---------|-------------|
| [Installation](installation) | Set up Mini CRM locally or via Docker |
| [Features](features/) | Detailed guide for every CRM feature |
| [REST API](api/) | Sanctum-protected API reference |
| [Deployment](deployment/) | Production Docker + CI/CD setup |

---

## What's Inside

### Core CRM
- **[Contacts](features/contacts)** — People and organisations with tags, notes, and CSV import
- **[Leads](features/leads)** — Prospect pipeline with status tracking and follow-up dates
- **[Deals](features/deals)** — Kanban pipeline with drag-and-drop, products, and win probability
- **[Tasks](features/tasks)** — Polymorphic tasks attached to any CRM entity
- **[Companies](features/companies)** — Organisation profiles linked to contacts and deals
- **[Activities](features/activities)** — Auto-logged feed for every create, update, and stage change

### Power Features
- **[Global Search](features/search)** — Instant cross-entity search with keyboard shortcut
- **[Bulk Operations](features/bulk-operations)** — Select and act on multiple records at once
- **[CSV Import](features/csv-import)** — Import contacts and leads from spreadsheets
- **[Trash / Soft Delete](features/trash)** — Restore or permanently delete any record
- **[Notifications](features/notifications)** — In-app bell + email notifications for assignments
- **[Reports](features/reports)** — Charts, conversion rates, and CSV export

### User Experience
- **[Dark Mode](features/dark-mode)** — System-aware dark theme toggle
- **[Keyboard Shortcuts](features/keyboard-shortcuts)** — Speed up navigation with hotkeys
- **[Onboarding](features/onboarding)** — First-time setup wizard for new installs
- **[Timezone Support](features/timezone)** — Per-user IANA timezone preference

### Administration
- **[Users & Roles](features/users-roles)** — Role-based access with Spatie Permission
- **[General Settings](features/settings)** — Logo, favicon, and meta tags from the UI
- **[2FA & Sessions](features/security)** — Two-factor auth and active session management
- **[Deal Enhancements](features/deal-enhancements)** — Line items, close-date alerts, win probability

### Infrastructure
- **[REST API](api/)** — Sanctum-protected v1 API for all resources
- **[Docker Deployment](deployment/docker)** — Production-ready Docker Compose setup
- **[GitHub Actions CI](deployment/github-actions)** — Automated test pipeline on every PR

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Laravel 12 |
| Frontend | Inertia.js + React 19 + Tailwind CSS v4 |
| Auth API | Laravel Sanctum |
| Modules | nwidart/laravel-modules |
| Roles | spatie/laravel-permission |
| Database | MySQL 8 (SQLite for tests) |
| Docker | nginx + php-fpm + mysql + redis |

---

## License

MIT — free to use, modify, and distribute.
Copyright © 2025 [Xgenious](https://xgenious.com)
