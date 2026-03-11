---
title: GitHub Actions CI
parent: Deployment
nav_order: 2
---

# GitHub Actions CI
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }
1. TOC
{:toc}

---

## Overview

Mini CRM ships with a GitHub Actions workflow that runs the full test suite on every pull request and push to `main`. It tests against PHP 8.2 and PHP 8.3.

**File:** `.github/workflows/tests.yml`

---

## Workflow Configuration

```yaml
name: Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        php: ['8.2', '8.3']

    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: mini_crm_test
        ports: ['3306:3306']
        options: --health-cmd="mysqladmin ping" --health-interval=5s

    steps:
      - uses: actions/checkout@v4

      - name: Setup PHP ${{ matrix.php }}
        uses: shivammathur/setup-php@v2
        with:
          php-version: ${{ matrix.php }}
          extensions: pdo, pdo_mysql, mbstring, xml, ctype, json

      - name: Install Composer dependencies
        run: composer install --no-progress --prefer-dist

      - name: Copy .env
        run: cp .env.example .env.testing

      - name: Generate app key
        run: php artisan key:generate --env=testing

      - name: Run migrations
        run: php artisan migrate --env=testing --force
        env:
          DB_CONNECTION: mysql
          DB_HOST: 127.0.0.1
          DB_DATABASE: mini_crm_test
          DB_USERNAME: root
          DB_PASSWORD: root

      - name: Run tests
        run: php artisan test
        env:
          DB_CONNECTION: mysql
          DB_HOST: 127.0.0.1
          DB_DATABASE: mini_crm_test
          DB_USERNAME: root
          DB_PASSWORD: root
```

---

## Test Suite

The test suite covers all major modules:

| Test file | Covers |
|-----------|--------|
| `AuthTest.php` | Register, login, logout, password reset |
| `ContactTest.php` | Contact CRUD, tags, CSV import |
| `LeadTest.php` | Lead CRUD, status change, convert to contact, follow-up date |
| `DealTest.php` | Deal CRUD, stage change, Kanban drag |
| `ApiAuthTest.php` | API login, register, logout |
| `ApiContactTest.php` | REST contact endpoints |
| `ApiLeadTest.php` | REST lead endpoints |
| `ApiDealTest.php` | REST deal endpoints |
| `ApiTaskTest.php` | REST task endpoints |

Run locally:

```bash
php artisan test
```

Run a single test file:

```bash
php artisan test --filter ContactTest
```

---

## Status Badge

Add the workflow badge to your `README.md`:

```markdown
![Tests](https://github.com/xgenious/mini-crm/actions/workflows/tests.yml/badge.svg)
```

---

## Adding New Tests

Tests live in `tests/Feature/`. Each module has its own test class. Follow the existing naming convention:

```
tests/
└── Feature/
    ├── AuthTest.php
    ├── ContactTest.php
    ├── LeadTest.php
    └── ...
```

Use Laravel's `RefreshDatabase` trait to reset state between tests.
