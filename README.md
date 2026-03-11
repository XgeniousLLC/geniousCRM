# Mini CRM

[![Tests](https://github.com/xgenious/mini-crm/actions/workflows/tests.yml/badge.svg)](https://github.com/xgenious/mini-crm/actions/workflows/tests.yml)

**Developed by [Xgenious](https://xgenious.com) — Free & Open Source under the MIT License**

A fully-featured, modular CRM built with Laravel 12, Inertia.js, React, and Tailwind CSS. Manage contacts, leads, deals, tasks, and activity tracking — all in one clean, self-hostable package.

---

## Features

- **Contacts** — manage people and organisations with tags and notes
- **Leads** — track prospects through qualification stages, convert to contacts
- **Deals** — pipeline Kanban board with drag-and-drop stage management
- **Tasks** — polymorphic tasks attached to any CRM entity
- **Activity Tracking** — auto-logged feed for every create, update, and stage change
- **Reports** — pipeline charts, lead conversion rate, CSV export
- **REST API** — Sanctum-protected API for all resources
- **Role-based access** — admin, manager, sales_user via Spatie Permission
- **General Settings** — logo, favicon, meta tags managed from the UI

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Backend    | Laravel 12                          |
| Frontend   | Inertia.js + React 19 + Tailwind 4  |
| Auth API   | Laravel Sanctum                     |
| Modules    | nwidart/laravel-modules             |
| Roles      | spatie/laravel-permission           |
| Database   | MySQL 8 (SQLite for tests)          |
| Docker     | nginx + php-fpm + mysql + redis     |

---

## Module Structure

> Companies, Notifications, and all roadmap modules are included.


```
Modules/
├── Auth/       — login, register, password reset
├── Core/       — dashboard, settings, profile, layout
├── User/       — user management, role assignment
├── Contact/    — contact CRUD with tags and notes
├── Lead/       — lead pipeline with status management
├── Deal/       — deal pipeline with Kanban board
├── Task/       — polymorphic tasks and notes
├── Activity/   — auto-logged activity feed
├── Report/     — charts, stats, CSV export
└── Api/        — REST API layer (Sanctum-protected)
```

---

## Self-Hosting

### Requirements

- PHP 8.2+
- Composer 2
- Node.js 20+ and npm
- MySQL 8 (or MariaDB 10.6+)

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/xgenious/mini-crm.git
cd mini-crm

# 2. Install PHP dependencies
composer install

# 3. Install JS dependencies
npm install

# 4. Copy and configure environment
cp .env.example .env
php artisan key:generate

# 5. Configure .env with your database credentials
# DB_DATABASE=mini_crm  DB_USERNAME=...  DB_PASSWORD=...

# 6. Run migrations and seed default data
php artisan migrate --seed

# 7. Build frontend assets
npm run build

# 8. (Optional) Create storage symlink
php artisan storage:link

# 9. Serve
php artisan serve
```

**Default admin login:** `admin@minicrm.test` / `password`

---

## Docker Quick-Start

```bash
# Copy env
cp .env.example .env

# Start all services (app, nginx, mysql, redis)
docker-compose up -d

# Run migrations and seed
docker-compose exec app php artisan migrate --seed

# Build frontend
docker-compose exec app npm run build
```

Access the app at `http://localhost:8080`

---

## REST API

Base URL: `/api/v1`

### Authentication

| Method | Endpoint             | Description                  |
|--------|----------------------|------------------------------|
| POST   | `/api/v1/login`      | Get a Sanctum token          |
| POST   | `/api/v1/register`   | Register and get a token     |
| POST   | `/api/v1/logout`     | Revoke current token         |

All other endpoints require `Authorization: Bearer {token}`.

### Resources

| Resource      | Endpoints                                  |
|---------------|--------------------------------------------|
| Contacts      | GET/POST `/contacts`, PATCH/DELETE `/{id}` |
| Leads         | GET/POST `/leads`, PATCH/DELETE `/{id}`    |
| Deals         | GET/POST `/deals`, PATCH/DELETE `/{id}`    |
| Tasks         | GET/POST `/tasks`, PATCH/DELETE `/{id}`    |

Rate limits: 60 req/min (public) · 120 req/min (authenticated)

### API Versioning Policy

- All endpoints are prefixed with `/api/v{n}` (currently `/api/v1`).
- A new major version is introduced **only for breaking changes**.
- Non-breaking additions (new fields, new endpoints) ship without a version bump.
- Deprecated fields/endpoints receive a `Deprecated` response header at least two releases before removal.
- All API changes are documented in [CHANGELOG.md](CHANGELOG.md).

---

## Production Deployment (Docker)

```bash
# 1. Copy and configure environment
cp .env.example .env
# Set: APP_ENV=production, APP_DEBUG=false, DB_*, MAIL_*, APP_URL

# 2. Generate self-signed TLS certs (replace with real certs for production)
mkdir -p docker/certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout docker/certs/key.pem \
  -out docker/certs/cert.pem \
  -subj "/CN=localhost"

# 3. Start all services (nginx, php-fpm, mysql, redis, worker, scheduler)
docker-compose -f docker-compose.prod.yml up -d

# 4. Run migrations and seed
docker-compose -f docker-compose.prod.yml exec app php artisan migrate --force --seed

# 5. Link storage and build assets
docker-compose -f docker-compose.prod.yml exec app php artisan storage:link
docker-compose -f docker-compose.prod.yml exec app npm run build
```

For real HTTPS, replace `docker/certs/cert.pem` and `docker/certs/key.pem` with certificates
from [Let's Encrypt](https://letsencrypt.org/) (via Certbot) or your SSL provider.

The queue worker and scheduler run as dedicated containers (`mini_crm_worker`, `mini_crm_scheduler`).
Alternatively, use `docker/supervisor.conf` inside a single container with Supervisor.

---

## Running Tests

```bash
php artisan test
```

Tests use SQLite in-memory — no database setup required.

---

## Contributing

We welcome contributions! This is a free and open source project maintained by Xgenious.

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/your-feature`)
3. Write tests for your changes
4. Submit a pull request with a clear description

Please follow the code standards documented in `CLAUDE.md`:
- Every controller, model, and React component requires a docblock
- All features live in a dedicated module under `Modules/`
- No business logic in `app/` (except core bootstrapping)

---

## License

MIT — Free to use, modify, and distribute.

Copyright (c) 2025 [Xgenious](https://xgenious.com)

See [LICENSE](LICENSE) for the full text.
