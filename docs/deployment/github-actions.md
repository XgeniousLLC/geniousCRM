# GitHub Actions CI

Mini CRM ships with a CI workflow that runs the full test suite on every push to `main` and every pull request.

## Workflow File

`.github/workflows/tests.yml`

## What It Does

1. Checks out the code
2. Sets up PHP 8.2 and 8.3 (matrix)
3. Installs Composer dependencies
4. Copies `.env.example` to `.env` and overrides DB to SQLite in-memory
5. Generates the app key
6. Runs migrations
7. Runs `php artisan test`

## Viewing Results

Go to your GitHub repo → **Actions** tab → **Tests** workflow.

A green badge in `README.md` links to the latest workflow run.

## Adding the Status Badge

The badge is already in the project `README.md`:

```markdown
![Tests](https://github.com/XgeniousLLC/geniousCRM/actions/workflows/tests.yml/badge.svg)
```
