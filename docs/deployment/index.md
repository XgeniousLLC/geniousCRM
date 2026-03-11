---
title: Deployment
nav_order: 4
has_children: true
---

# Deployment
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }
1. TOC
{:toc}

---

## Overview

Mini CRM can be deployed in two ways:

| Method | Best for |
|--------|----------|
| [Docker](docker) | Production servers, VPS, cloud VMs — zero dependency conflicts |
| [Traditional / shared hosting](docker#manual-server-deployment) | cPanel, Plesk, or bare servers with PHP already installed |

---

## Minimum Requirements

| Component | Version |
|-----------|---------|
| PHP | 8.2 or 8.3 |
| MySQL | 8.0+ |
| Node.js | 18+ (for building frontend assets) |
| Composer | 2.x |
| Laravel | 12 |

Optional but recommended for production:

| Component | Purpose |
|-----------|---------|
| Redis | Fast queue and cache driver |
| Supervisor | Keep queue worker and scheduler alive |
| Nginx | Web server (included in Docker setup) |

---

## Quick Start (Docker)

```bash
git clone https://github.com/xgenious/mini-crm.git
cd mini-crm
cp .env.example .env
# Edit .env: set DB_PASSWORD, APP_URL, MAIL_* etc.
docker compose up -d
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate --seed
docker compose exec app php artisan storage:link
```

Visit `http://localhost` and log in with:

- **Email:** `admin@minicrm.dev`
- **Password:** `password`

See the [Docker deployment guide](docker) for full details including SSL, production tuning, and Supervisor setup.

---

## CI / CD

See [GitHub Actions](github-actions) for automated testing on every push and pull request.
