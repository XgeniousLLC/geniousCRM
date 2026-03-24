# Installation

Full manual installation guide for Mini CRM on a Linux/macOS server.

## System Requirements

| Requirement | Minimum |
|-------------|---------|
| PHP | 8.2 or 8.3 |
| Composer | 2.x |
| Node.js | 20+ |
| MySQL | 8.0+ |
| Redis | 6+ (optional, for queues/cache) |
| Web server | nginx or Apache |
| Disk space | 500 MB (including vendor) |

## 1. Clone the Repository

```bash
git clone https://github.com/XgeniousLLC/geniousCRM.git /var/www/mini-crm
cd /var/www/mini-crm
```

## 2. Install Dependencies

```bash
composer install --no-dev --optimize-autoloader
npm ci && npm run build
```

## 3. Environment Setup

```bash
cp .env.example .env
php artisan key:generate
```

### Key environment variables

```env
APP_NAME="Mini CRM"
APP_URL=https://your-domain.com
APP_ENV=production
APP_DEBUG=false

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mini_crm
DB_USERNAME=crm_user
DB_PASSWORD=strong_password

# Mail (for email notifications)
MAIL_MAILER=smtp
MAIL_HOST=smtp.yourprovider.com
MAIL_PORT=587
MAIL_USERNAME=your@email.com
MAIL_PASSWORD=your_mail_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=crm@your-domain.com
MAIL_FROM_NAME="Mini CRM"

# Queue (use database for simplicity, redis for performance)
QUEUE_CONNECTION=database

# Session (database recommended for multi-server)
SESSION_DRIVER=database
SESSION_LIFETIME=120
```

## 4. Database Setup

Create the database, then run migrations and the base seeder:

```bash
mysql -u root -p -e "CREATE DATABASE mini_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

php artisan migrate --force
php artisan db:seed
```

This seeds:
- 3 roles: `admin`, `manager`, `sales_user`
- 22 permissions
- Default admin user: `admin@minicrm.test` / `password`
- Base application settings

::: warning Change default credentials
Log in immediately and change the default admin password from the [Profile page](/features/profile).
:::

## 5. Storage Link

```bash
php artisan storage:link
```

This creates `public/storage → storage/app/public` for uploaded logos and favicons.

## 6. Queue Worker

Start the queue worker to process email notifications:

```bash
php artisan queue:work --sleep=3 --tries=3
```

For production, use Supervisor to keep the worker running. A `supervisor.conf` is included in the repo root.

## 7. Scheduler

Add a cron entry to run the Laravel scheduler every minute:

```bash
crontab -e
# Add:
* * * * * cd /var/www/mini-crm && php artisan schedule:run >> /dev/null 2>&1
```

The scheduler handles:
- Daily task-due reminder emails (08:00)
- Demo data reset every 4 hours (if `demo:reset` is enabled)

## 8. nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/mini-crm/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;
    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

## 9. File Permissions

```bash
chown -R www-data:www-data /var/www/mini-crm
chmod -R 755 /var/www/mini-crm/storage
chmod -R 755 /var/www/mini-crm/bootstrap/cache
```

## 10. Optimise for Production

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

---

## Verify the Installation

Open your domain in a browser. You should see the Mini CRM login page. Log in with `admin@minicrm.test` / `password`.

If you see a blank page or 500 error, check `storage/logs/laravel.log`.
