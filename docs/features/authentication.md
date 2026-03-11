---
title: Authentication
parent: Features
nav_order: 2
---

# Authentication
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }
1. TOC
{:toc}

---

## Overview

Mini CRM uses Laravel's built-in session authentication with role-based access control via Spatie Permission. The Auth module handles login, registration, password reset, and two-factor authentication.

**Module:** `Auth`

---

## Login

**Route:** `POST /login`
**Page:** `/login`

Users log in with their email and password. After a successful login they are redirected to `/dashboard`. A "Remember me" checkbox extends the session lifetime.

### Login fields

| Field | Type | Required |
|-------|------|----------|
| Email | email | Yes |
| Password | password | Yes |
| Remember me | checkbox | No |

### Failed login behaviour

- Validation errors display inline below the relevant field.
- After too many attempts the IP is rate-limited: `throttle:5,1` (5 attempts per minute).

---

## Registration

**Route:** `POST /register`
**Page:** `/register`

New accounts can be created at `/register`. The first account seeded by the database seeder is always an `admin`. Subsequent registrations receive the `sales_user` role by default; an admin can promote them later from **Users > Roles**.

### Registration fields

| Field | Type | Required |
|-------|------|----------|
| Full Name | text | Yes |
| Email | email | Yes (unique) |
| Password | password | Yes (min 8 chars) |
| Confirm Password | password | Yes |

---

## Password Reset

The standard Laravel password-reset flow:

1. User visits `/forgot-password` and submits their email.
2. A reset link is emailed (requires `MAIL_*` env vars).
3. User clicks the link → `/reset-password?token=...`
4. User enters a new password and is redirected to `/login`.

**Rate limit:** `throttle:3,1` on the forgot-password form (3 attempts per minute).

---

## Two-Factor Authentication (2FA)

Mini CRM supports TOTP-based 2FA using `pragmarx/google2fa-laravel`.

### Enabling 2FA

1. Go to **Profile** (top-right avatar → Profile).
2. In the **Two-Factor Authentication** section click **Enable 2FA**.
3. Scan the QR code with an authenticator app (Google Authenticator, Authy, 1Password, etc.).
4. Enter the 6-digit code to confirm — this activates 2FA.
5. **Save your recovery codes** — they are displayed once and cannot be retrieved again.

### Login with 2FA active

After entering a correct email/password the system redirects to a challenge page (`/two-factor/challenge`) where the user enters the 6-digit TOTP code.

### Recovery codes

If the authenticator device is lost, a recovery code can be used instead of the TOTP code. Recovery codes are single-use.

### Disabling 2FA

Go to **Profile → Two-Factor Authentication** and click **Disable 2FA**. A confirmation prompt prevents accidental removal.

---

## Active Session Management

**Page:** Profile → Active Sessions

Shows all currently logged-in devices for the authenticated user:

| Column | Description |
|--------|-------------|
| IP Address | The remote IP of the session |
| User Agent | Browser / device string |
| Last Active | Timestamp of last request |
| Status | `Current` badge for the current session |

Actions available:
- **Revoke** — log out a single other device.
- **Log out all other devices** — revoke every session except the current one.

---

## Logout

**Route:** `POST /logout`

Clicking the logout button in the top-right header invalidates the current session and redirects to `/login`.

---

## Middleware Reference

| Middleware | Purpose |
|------------|---------|
| `auth` | Requires authentication |
| `ensure.admin` | Restricts route to `admin` role only |
| `ensure.manager` | Restricts route to `admin` or `manager` role |
| `throttle:5,1` | Rate-limits login attempts |
