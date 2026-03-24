# Docker Setup

Mini CRM ships with Docker Compose files for both development and production.

## Development

```bash
git clone https://github.com/XgeniousLLC/geniousCRM.git
cd geniousCRM
cp .env.example .env
```

Start all services:

```bash
docker compose up -d
```

This starts:
- **app** — PHP-FPM container
- **nginx** — web server on port 80
- **mysql** — MySQL 8 on port 3306
- **redis** — Redis on port 6379

Run first-time setup inside the container:

```bash
docker compose exec app composer install
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate --seed
docker compose exec app npm ci && npm run build
docker compose exec app php artisan storage:link
```

Open [http://localhost](http://localhost).

---

## Production

Use the production compose file which adds SSL termination and Supervisor:

```bash
cp .env.example .env
# Edit .env with your production values
docker compose -f docker-compose.prod.yml up -d
```

Production services:
- **nginx** — HTTPS with self-signed cert (replace with your real cert in `docker/nginx/prod.conf`)
- **php-fpm** — PHP application
- **mysql** — MySQL 8
- **redis** — Cache and queue backend
- **worker** — Supervisor managing `queue:work` and the scheduler

### First deploy

```bash
docker compose -f docker-compose.prod.yml exec app php artisan migrate --force
docker compose -f docker-compose.prod.yml exec app php artisan db:seed --force
docker compose -f docker-compose.prod.yml exec app php artisan config:cache
docker compose -f docker-compose.prod.yml exec app php artisan route:cache
docker compose -f docker-compose.prod.yml exec app php artisan storage:link
```

### Replace the SSL certificate

Edit `docker/nginx/prod.conf` and point `ssl_certificate` and `ssl_certificate_key` to your real cert paths (e.g. Let's Encrypt):

```nginx
ssl_certificate     /etc/letsencrypt/live/your-domain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
```

---

## Useful Commands

| Task | Command |
|------|---------|
| View logs | `docker compose logs -f app` |
| Open a shell | `docker compose exec app bash` |
| Run artisan | `docker compose exec app php artisan <cmd>` |
| Stop all | `docker compose down` |
| Rebuild | `docker compose build --no-cache` |

---

## Environment Variables in Docker

The `.env` file is mounted into the container at startup. Key variables to update for Docker:

```env
APP_URL=https://your-domain.com
DB_HOST=mysql          # service name, not localhost
REDIS_HOST=redis       # service name
QUEUE_CONNECTION=redis # use redis in production
```
