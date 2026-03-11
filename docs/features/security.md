---
title: Security
parent: Features
nav_order: 15
---

# Security
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }
1. TOC
{:toc}

---

## Overview

Mini CRM ships with several security layers including role-based middleware, CSRF protection, rate limiting on the REST API, and an optional two-factor authentication (2FA) flow.

---

## Authentication

All routes except `GET /login`, `POST /login`, and the password-reset flow require an authenticated session.

Authentication uses Laravel's built-in session guard with `bcrypt`-hashed passwords.

---

## Role-Based Middleware

| Middleware Class | Applied To |
|-----------------|------------|
| `EnsureAdmin` | Admin-only routes (users, roles, settings, trash) |
| `EnsureManager` | Manager + admin routes (reports, activities) |

All other authenticated routes are accessible to any logged-in user regardless of role, with UI elements hidden in the frontend based on role.

---

## CSRF Protection

All `POST`, `PUT`, `PATCH`, and `DELETE` web routes are protected by Laravel's CSRF middleware. Inertia automatically reads the `X-XSRF-TOKEN` header from the cookie and includes it in every request — no manual handling required.

---

## Rate Limiting (API)

| Limit | Applies To |
|-------|-----------|
| 60 requests / minute | Public endpoints (login, register) |
| 120 requests / minute | Authenticated API endpoints |

Rate limits are configured in `Modules/Api/app/Http/Controllers` via Laravel's `ThrottleRequests` middleware.

---

## Two-Factor Authentication (2FA)

{: .label .label-yellow }
Phase 13 — Planned

When implemented, 2FA uses time-based one-time passwords (TOTP) compatible with apps like Google Authenticator or Authy.

### Flow

1. User enables 2FA on their Profile page — a QR code is displayed (scan once).
2. On next login, after correct password, the user is redirected to a **2FA challenge** page.
3. They enter the 6-digit code from their authenticator app.
4. If correct, the session is established normally.
5. Recovery codes allow bypass if the device is lost (each code is one-time-use).

### Settings stored on the `users` table

| Column | Description |
|--------|-------------|
| `two_factor_secret` | Encrypted TOTP secret |
| `two_factor_enabled` | Boolean flag |
| `two_factor_recovery_codes` | JSON array of hashed backup codes |

---

## Session Management

{: .label .label-yellow }
Phase 13 — Planned

When implemented, the **Active Sessions** section on the Profile page will list every active login session:

- IP address
- Browser / device detected
- Last activity timestamp

Each session can be individually revoked. A **"Log out all other devices"** button terminates every session except the current one.

---

## Web Route Rate Limiting

{: .label .label-yellow }
Phase 13 — Planned

| Route | Limit |
|-------|-------|
| `POST /login` | 5 attempts / minute / IP |
| `POST /register` | 10 attempts / minute / IP |
| `POST /forgot-password` | 3 attempts / minute / IP |

Exceeding the limit returns a `429 Too Many Requests` response with a user-friendly flash message.

---

## Password Reset

The full password-reset flow is available out of the box:

1. Click **Forgot password?** on the login page.
2. Enter your email address — a reset link is emailed to you.
3. Click the link in the email to open the reset form.
4. Enter and confirm your new password.

Password reset tokens expire after 60 minutes (configurable in `config/auth.php`).

---

## Secure File Uploads

Uploaded files (logo, favicon, CSV imports) are validated by MIME type and stored in `storage/app/public/`. They are never executed — only served as static assets.

CSV files are read server-side and discarded after import.
