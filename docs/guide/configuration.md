# Configuration

All configuration is done through the `.env` file and the in-app **General Settings** page.

## Application

```env
APP_NAME="Mini CRM"
APP_ENV=production          # local | production
APP_DEBUG=false             # never true in production
APP_URL=https://your-domain.com
APP_TIMEZONE=UTC
```

## Database

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mini_crm
DB_USERNAME=crm_user
DB_PASSWORD=strong_password
```

## Mail (Email Notifications)

Mini CRM sends emails for:
- Lead assignment
- Deal assignment
- Task assignment
- Daily task-due reminders

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailgun.org
MAIL_PORT=587
MAIL_USERNAME=your@email.com
MAIL_PASSWORD=your_mail_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=crm@your-domain.com
MAIL_FROM_NAME="Mini CRM"
```

::: tip Testing emails locally
Use [Mailpit](https://mailpit.axllent.org/) or set `MAIL_MAILER=log` to write emails to `storage/logs/laravel.log`.
:::

## Queue

The queue processes email notifications in the background.

```env
QUEUE_CONNECTION=database   # use 'redis' for better performance
```

Start the worker:

```bash
php artisan queue:work --sleep=3 --tries=3 --max-time=3600
```

## Session

```env
SESSION_DRIVER=database     # database | file | redis
SESSION_LIFETIME=120        # minutes
```

`database` is recommended — it enables the **Active Sessions** feature on the Profile page so users can see and revoke sessions.

## Cache

```env
CACHE_STORE=file            # file | redis | database
```

## Redis (Optional but Recommended for Production)

```env
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

Set `QUEUE_CONNECTION=redis` and `CACHE_STORE=redis` after configuring Redis.

## Filesystem

Uploaded logos and favicons are stored in `storage/app/public`. After running `php artisan storage:link`, they are accessible at `/storage/`.

```env
FILESYSTEM_DISK=local
```

## General Settings (In-App)

After logging in as admin, go to **Settings → General** to configure:

| Setting | Description |
|---------|-------------|
| Application Title | Shown in the browser tab and login page |
| Meta Description | Used in `<meta name="description">` |
| Meta Keywords | Used in `<meta name="keywords">` |
| Logo | Uploaded image shown in the sidebar |
| Favicon | `.ico` file shown in browser tabs |

These settings are stored in the `settings` table and shared to all pages automatically.
