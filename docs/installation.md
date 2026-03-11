---
title: Installation
nav_order: 2
---

# Installation
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

## Requirements

| Requirement | Version |
|-------------|---------|
| PHP | 8.2 or higher |
| Composer | 2.x |
| Node.js | 20 or higher |
| npm | 10 or higher |
| MySQL | 8.0 (or MariaDB 10.6+) |

---

## Local Installation

### 1. Clone the repository

```bash
git clone https://github.com/xgenious/mini-crm.git
cd mini-crm
```

### 2. Install PHP dependencies

```bash
composer install
```

### 3. Install JavaScript dependencies

```bash
npm install
```

### 4. Configure environment

```bash
cp .env.example .env
php artisan key:generate
```

Open `.env` and set your database credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mini_crm
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### 5. Run migrations and seed default data

```bash
php artisan migrate --seed
```

This creates all tables and seeds:
- Default admin user (`admin@minicrm.test` / `password`)
- Three roles: `admin`, `manager`, `sales_user`
- 22 permissions across all CRM modules

### 6. Build frontend assets

```bash
npm run build
```

### 7. Create storage symlink

```bash
php artisan storage:link
```

### 8. Start the development server

```bash
php artisan serve
```

Visit `http://localhost:8000` and log in with:

| Field | Value |
|-------|-------|
| Email | `admin@minicrm.test` |
| Password | `password` |

---

## Docker Quick-Start

Mini CRM ships with a development Docker Compose configuration.

```bash
# Copy environment file
cp .env.example .env

# Start all services (app, nginx, mysql, redis)
docker-compose up -d

# Run migrations and seed
docker-compose exec app php artisan migrate --seed

# Build frontend
docker-compose exec app npm run build
```

Access the app at `http://localhost:8080`.

---

## Queue Worker (Optional)

Email notifications require a running queue worker:

```bash
php artisan queue:work
```

Or using the scheduler for due-date reminders:

```bash
php artisan schedule:work
```

---

## Running Tests

Tests use SQLite in-memory — no extra database setup required.

```bash
php artisan test
```

Expected output: **32 tests, 68 assertions, all green**.

---

## Environment Variables Reference

| Key | Description | Default |
|-----|-------------|---------|
| `APP_NAME` | Application display name | `Mini CRM` |
| `APP_ENV` | Environment (`local`, `production`) | `local` |
| `APP_DEBUG` | Show detailed errors | `true` |
| `APP_URL` | Full application URL | `http://localhost` |
| `DB_*` | MySQL connection settings | — |
| `MAIL_*` | SMTP settings for email notifications | — |
| `QUEUE_CONNECTION` | Queue driver (`sync`, `database`, `redis`) | `sync` |
| `REDIS_HOST` | Redis host (for caching/queues) | `127.0.0.1` |
