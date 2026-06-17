# Platform-Specific Installation

Installation guides for Mini CRM on various hosting platforms.

---

## Ubuntu Server (Bare Metal / VPS)

### Prerequisites

```bash
sudo apt update && sudo apt upgrade -y
```

### 1. Install PHP 8.3 with Extensions

```bash
sudo apt install -y php8.3 php8.3-fpm php8.3-mysql php8.3-mbstring \
  php8.3-xml php8.3-curl php8.3-bcmath php8.3-json php8.3-zip \
  php8.3-gd php8.3-intl php8.3-opcache
```

### 2. Install Composer

```bash
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

### 3. Install Node.js & npm (v20+)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### 4. Install MySQL 8.0

```bash
sudo apt install -y mysql-server
sudo mysql_secure_installation
```

Follow prompts to set root password and remove test databases.

### 5. Install Redis (Optional)

```bash
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

### 6. Install nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 7. Install Supervisor (for queue worker)

```bash
sudo apt install -y supervisor
```

### 8. Clone and Configure Mini CRM

```bash
# Create app directory
sudo mkdir -p /var/www/mini-crm
cd /var/www/mini-crm

# Clone repository
sudo git clone https://github.com/XgeniousLLC/geniousCRM.git .

# Set permissions
sudo chown -R $USER:$USER /var/www/mini-crm

# Install dependencies
composer install --no-dev --optimize-autoloader
npm ci && npm run build
```

### 9. Setup Environment

```bash
cp .env.example .env
php artisan key:generate
```

Update `.env` with your database credentials and domain.

### 10. Create Database

```bash
mysql -u root -p << EOF
CREATE DATABASE mini_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'crm_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON mini_crm.* TO 'crm_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
EOF
```

### 11. Run Migrations

```bash
php artisan migrate --force
php artisan db:seed
php artisan storage:link
```

### 12. Configure nginx

Create `/etc/nginx/sites-available/mini-crm`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
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
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/mini-crm /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 13. Setup SSL (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 14. Configure Supervisor for Queue Worker

Create `/etc/supervisor/conf.d/mini-crm.conf`:

```ini
[program:mini-crm-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/mini-crm/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
numprocs=1
redirect_stderr=true
stdout_logfile=/var/www/mini-crm/storage/logs/worker.log
user=www-data

[program:mini-crm-scheduler]
command=php /var/www/mini-crm/artisan schedule:run
process_name=%(program_name)s
autostart=true
autorestart=true
startsecs=0
redirect_stderr=true
stdout_logfile=/var/www/mini-crm/storage/logs/scheduler.log
user=www-data
```

Enable and start:

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start mini-crm-worker
sudo supervisorctl start mini-crm-scheduler
```

### 15. Final Permissions

```bash
sudo chown -R www-data:www-data /var/www/mini-crm
chmod -R 755 /var/www/mini-crm/storage /var/www/mini-crm/bootstrap/cache
```

### 16. Optimize for Production

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

---

## cPanel Installation

### Prerequisites
- cPanel account with root or WHM access
- PHP 8.3 installed (via WHM > Manage PHP Installations)

### 1. Access Terminal

Login to WHM → Terminal (or SSH into your server)

### 2. Install PHP Extensions (via WHM)

1. Navigate to **WHM > Manage PHP Installations**
2. Select PHP 8.3
3. Click **Configure PHP extensions**
4. Ensure installed: `curl`, `gd`, `intl`, `json`, `mbstring`, `mysqli`, `openssl`, `xml`, `zip`, `bcmath`
5. Click **Save**

### 3. Install Composer

```bash
cd /home/username/public_html
curl -sS https://getcomposer.org/installer | php
mv composer.phar composer
```

### 4. Create MySQL Database (via cPanel)

1. Login to cPanel
2. Go to **MySQL® Databases**
3. Create new database: `username_mini_crm`
4. Create user: `username_crm_user` with strong password
5. Add user to database with all privileges

### 5. Clone Repository

```bash
cd /home/username/public_html
git clone https://github.com/XgeniousLLC/geniousCRM.git .
```

Or if git not available, download and extract ZIP file in cPanel File Manager.

### 6. Install Dependencies

```bash
cd /home/username/public_html
php composer install --no-dev --optimize-autoloader
npm ci && npm run build
```

### 7. Configure Environment

```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env` and update:
```env
DB_HOST=localhost
DB_DATABASE=username_mini_crm
DB_USERNAME=username_crm_user
DB_PASSWORD=your_password
APP_URL=https://your-domain.com
```

### 8. Run Migrations or Import Existing Database

**Option A: Fresh Installation**

```bash
php artisan migrate --force
php artisan db:seed
php artisan storage:link
```

**Option B: Import Existing Database File**

If you have an existing database dump (`.sql` file):

1. Upload `.sql` file via cPanel **File Manager** to `/home/username/public_html/`

2. Import via MySQL command (via cPanel Terminal or SSH):

```bash
# Using mysql command
mysql -h localhost -u username_crm_user -p username_mini_crm < /home/username/public_html/database.sql

# Or using cPanel phpmyadmin
# Login to phpMyAdmin > select database > Import tab > Choose file > Execute
```

3. If database is older version, run pending migrations:

```bash
php artisan migrate --force
php artisan storage:link
```

4. Skip `db:seed` (your existing data is already in database)

**Verify Import:**

```bash
php artisan tinker
# In tinker shell:
>>> DB::select('SELECT COUNT(*) as count FROM users;')
>>> exit
```

### 9. Set File Permissions

```bash
chmod -R 755 /home/username/public_html/storage
chmod -R 755 /home/username/public_html/bootstrap/cache
```

### 10. Create Public HTML Entry Point

If Mini CRM is in subdirectory, create `/home/username/public_html/index.php`:

```php
<?php
require __DIR__.'/mini-crm/public/index.php';
```

Or point domain directly to `mini-crm/public` folder in cPanel Addon Domains.

### 11. Configure Cron Jobs

1. Login to cPanel
2. Go to **Cron Jobs**
3. Add cron: `php /home/username/public_html/artisan schedule:run`
4. Run every minute (`* * * * *`)

### 12. Setup Queue Worker

Create long-running queue via cPanel Cron:

```bash
php /home/username/public_html/artisan queue:work --sleep=3 --tries=3 &
```

Or use SSH for persistent worker in screen/tmux:

```bash
screen -d -m -S mini-crm-queue bash -c "cd /home/username/public_html && php artisan queue:work"
```

### 13. Setup SSL (AutoSSL)

1. Go to **cPanel > SSL/TLS Status**
2. Your domain should auto-renew via AutoSSL
3. If manual: **SSL/TLS Manager > Manage SSL sites**

### 14. Optimize

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## Plesk Installation

### Prerequisites
- Plesk 18.0+ installed
- PHP 8.3 enabled on your subscription
- SSH access or Plesk Terminal

### 1. Enable PHP 8.3

1. Login to Plesk Panel
2. Go to **Subscriptions**
3. Select your domain
4. Click **PHP Settings**
5. Select **PHP 8.3** and ensure `curl`, `gd`, `intl`, `json`, `mbstring`, `mysqli`, `openssl`, `xml`, `zip`, `bcmath` are enabled
6. Save

### 2. Access Terminal

**Plesk Panel > Tools & Settings > Terminal** or SSH into your server.

### 3. Install Composer

```bash
cd /var/www/vhosts/your-domain.com/httpdocs
curl -sS https://getcomposer.org/installer | php
mv composer.phar composer
```

### 4. Create Database (via Plesk)

1. **Plesk Panel > Databases**
2. Click **Add Database**
3. Set name: `mini_crm` and user credentials
4. Save

### 5. Clone Repository

```bash
cd /var/www/vhosts/your-domain.com/httpdocs
git clone https://github.com/XgeniousLLC/geniousCRM.git .
```

If no git, download ZIP and extract via Plesk File Manager.

### 6. Install Dependencies

```bash
cd /var/www/vhosts/your-domain.com/httpdocs
./composer install --no-dev --optimize-autoloader
npm ci && npm run build
```

### 7. Configure Environment

```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env`:
```env
DB_HOST=localhost
DB_DATABASE=mini_crm
DB_USERNAME=mini_crm_user
DB_PASSWORD=your_password
APP_URL=https://your-domain.com
```

### 8. Run Migrations or Import Existing Database

**Option A: Fresh Installation**

```bash
php artisan migrate --force
php artisan db:seed
php artisan storage:link
```

**Option B: Import Existing Database File**

If you have existing database dump (`.sql` file):

1. Upload `.sql` file via Plesk **File Manager** to `/httpdocs/`

2. Import via MySQL command (via Plesk Terminal or SSH):

```bash
# Using mysql command
mysql -h localhost -u mini_crm_user -p mini_crm < /var/www/vhosts/your-domain.com/httpdocs/database.sql

# Or using Plesk phpMyAdmin
# Databases > mini_crm > phpMyAdmin > Import tab > Choose file > Execute
```

3. If database is older version, run pending migrations:

```bash
php artisan migrate --force
php artisan storage:link
```

4. Skip `db:seed` (your existing data is already in database)

**Verify Import:**

```bash
php artisan tinker
>>> DB::select('SELECT COUNT(*) as count FROM users;')
>>> exit
```

### 9. Fix Permissions

```bash
chmod -R 755 /var/www/vhosts/your-domain.com/httpdocs/storage
chmod -R 755 /var/www/vhosts/your-domain.com/httpdocs/bootstrap/cache
```

### 10. Adjust Document Root (if needed)

1. **Plesk Panel > Domains > your-domain.com > Hosting Settings**
2. Change **Document Root** to `/httpdocs/public` (if Mini CRM is in root)
3. Save

### 11. Setup Scheduled Tasks (Cron)

1. **Plesk Panel > Scheduled Tasks**
2. Add task:
   - **Command**: `php /var/www/vhosts/your-domain.com/httpdocs/artisan schedule:run`
   - **Schedule**: Every minute (`* * * * *`)

### 12. Queue Worker

Run persistent queue via SSH:

```bash
cd /var/www/vhosts/your-domain.com/httpdocs
screen -d -m -S mini-crm-queue bash -c "php artisan queue:work"
```

Or configure via Plesk Scheduled Task with longer timeout.

### 13. SSL Certificate

Plesk auto-renews Let's Encrypt certificates:
1. **Domains > your-domain.com > SSL/TLS Certificates**
2. Certificate should auto-renew every 90 days

### 14. Optimize

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## CloudPanel Installation

### Prerequisites
- CloudPanel account active
- SSH access enabled
- Ubuntu 20.04+ or Debian 11+ server (CloudPanel standard)

### 1. Access SSH Terminal

Login to CloudPanel → **Servers > SSH Terminal** or use external SSH client.

### 2. Add Application

1. **CloudPanel > Applications > Create Application**
2. Set domain, PHP version (8.3), enable SSL
3. CloudPanel auto-installs Nginx, PHP-FPM, MySQL, Redis

### 3. Clone Repository

```bash
cd /home/cloudpanel-user/htdocs/your-domain.com
git clone https://github.com/XgeniousLLC/geniousCRM.git .
```

Or download ZIP and extract via CloudPanel File Manager.

### 4. Install Dependencies

```bash
cd /home/cloudpanel-user/htdocs/your-domain.com
composer install --no-dev --optimize-autoloader
npm ci && npm run build
```

### 5. Setup Environment

```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env`:
```env
DB_HOST=127.0.0.1
DB_DATABASE=cloudpanel_app
DB_USERNAME=cloudpanel_app
DB_PASSWORD=your_password
APP_URL=https://your-domain.com
```

### 6. Create Database (via CloudPanel)

1. **CloudPanel > Databases > MySQL**
2. Create new database with credentials
3. Note username/password

### 7. Run Migrations or Import Existing Database

**Option A: Fresh Installation**

```bash
php artisan migrate --force
php artisan db:seed
php artisan storage:link
```

**Option B: Import Existing Database File**

If you have existing database dump (`.sql` file):

1. Upload `.sql` file via CloudPanel **File Manager** to `/htdocs/your-domain.com/`

2. Import via MySQL command (SSH):

```bash
# Using mysql command
mysql -h 127.0.0.1 -u cloudpanel_app -p cloudpanel_app < /home/cloudpanel-user/htdocs/your-domain.com/database.sql

# Or using CloudPanel phpMyAdmin (if available)
# Databases > cloudpanel_app > phpMyAdmin > Import tab > Choose file > Execute
```

3. If database is older version, run pending migrations:

```bash
php artisan migrate --force
php artisan storage:link
```

4. Skip `db:seed` (your existing data is already in database)

**Verify Import:**

```bash
php artisan tinker
>>> DB::select('SELECT COUNT(*) as count FROM users;')
>>> exit
```

### 8. Fix Permissions

CloudPanel manages most permissions, but ensure:

```bash
chmod -R 755 /home/cloudpanel-user/htdocs/your-domain.com/storage
chmod -R 755 /home/cloudpanel-user/htdocs/your-domain.com/bootstrap/cache
```

### 9. Configure Webroot

1. **CloudPanel > Applications > your-domain.com > Settings**
2. Set **Document Root** to `/public` folder if needed
3. Save

### 10. Add Cron Job

1. **CloudPanel > Crons**
2. Add cron:
   - **Command**: `php /home/cloudpanel-user/htdocs/your-domain.com/artisan schedule:run`
   - **Schedule**: Every minute
3. Save

### 11. Run Queue Worker

Via SSH:

```bash
cd /home/cloudpanel-user/htdocs/your-domain.com
php artisan queue:work --sleep=3 --tries=3
```

CloudPanel recommends keeping SSH persistent or using background process manager.

### 12. SSL Certificate

CloudPanel auto-manages Let's Encrypt:
1. **Applications > your-domain.com > SSL/TLS**
2. Certificate auto-renews (no action needed)

### 13. Optimize

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## Troubleshooting by Platform

### Ubuntu / VPS
- **PHP-FPM socket not found**: Check `/run/php/php8.3-fpm.sock` path in nginx config
- **Permission denied on storage**: Run `sudo chown -R www-data:www-data /var/www/mini-crm`
- **Queue worker not running**: Check supervisor status with `sudo supervisorctl status`

### cPanel
- **Composer not found**: Use full path `/home/username/public_html/composer` or install globally
- **MySQL connection refused**: Verify DB user/password in cPanel MySQL section
- **Cron not executing**: Check **WHM > Process Manager > cron** is running

### Plesk
- **Document root issues**: Ensure Plesk path is `/var/www/vhosts/domain.com/httpdocs/public`
- **PHP version mismatch**: Verify **PHP Settings** has 8.3 selected, not 7.x
- **Database access denied**: Check Plesk Databases user permissions

### CloudPanel
- **Storage permission denied**: CloudPanel uses non-root user; ensure paths owned by `cloudpanel-user`
- **Queue worker hanging**: Use `timeout` wrapper or systemd service for auto-restart
- **Nginx config conflicts**: CloudPanel manages nginx; avoid manual edits to `/etc/nginx`

---

## Email Configuration by Platform

Update `MAIL_*` in `.env` for your email provider:

### Gmail (App Password)
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your@gmail.com
```

### SendGrid
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=your_sendgrid_api_key
MAIL_ENCRYPTION=tls
```

### AWS SES
```env
MAIL_MAILER=aws
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_DEFAULT_REGION=us-east-1
MAIL_FROM_ADDRESS=verified@domain.com
```

---

## Next Steps

1. Verify installation: Visit `https://your-domain.com`
2. Log in with default credentials: `admin@minicrm.test` / `password`
3. Change password immediately from Profile page
4. Configure app settings under **Settings** tab
5. Import your contacts via **CSV Import** feature
