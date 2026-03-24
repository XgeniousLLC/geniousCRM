# Introduction

**Mini CRM** is a free, open-source customer relationship manager built and maintained by [Xgenious](https://xgenious.com). It is licensed under the MIT License — meaning you can use it, self-host it, modify it, and even build commercial products on top of it, all at no cost.

## What is Mini CRM?

Mini CRM gives small and medium-sized sales teams everything they need to manage their pipeline:

- A contact book with tags, notes, and company links
- A lead tracker with status management and follow-up reminders
- A deal pipeline with a Kanban board and win probability
- Tasks assigned to any CRM record
- Company profiles linking contacts and deals
- Automatic activity logging
- Reports and CSV exports
- A full REST API
- Role-based access for your entire team

## Who is it for?

| User | How they use it |
|------|----------------|
| **Solo founder** | Replace spreadsheets with a real CRM — free forever |
| **Small sales team** | Shared pipeline, assigned leads, tasks, and email alerts |
| **Agency / developer** | Fork it, add modules, or white-label it for clients |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Laravel 12 |
| Frontend | Inertia.js + React 19 + Tailwind CSS v4 |
| Database | MySQL 8 (SQLite for tests) |
| Auth | Laravel Sanctum + Spatie Permission |
| Modules | nwidart/laravel-modules (12 modules) |
| Queue | Laravel Queue (database driver) |
| Docker | nginx + php-fpm + mysql + redis |

## License

MIT — free forever. See the [LICENSE](https://github.com/XgeniousLLC/geniousCRM/blob/main/LICENSE) file.

## Next Steps

- [Quick Start](/guide/quick-start) — running locally in 5 minutes
- [Installation](/guide/installation) — full manual setup
- [Docker Setup](/guide/docker) — production-ready containers
