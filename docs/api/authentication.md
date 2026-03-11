---
title: Authentication
parent: API Reference
nav_order: 1
---

# API Authentication
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }
1. TOC
{:toc}

---

## Register

Create a new user account and receive an API token.

```
POST /api/v1/register
```

### Request body

```json
{
  "name": "Alice Smith",
  "email": "alice@example.com",
  "password": "secret123",
  "password_confirmation": "secret123"
}
```

### Response `201 Created`

```json
{
  "data": {
    "user": {
      "id": 1,
      "name": "Alice Smith",
      "email": "alice@example.com"
    },
    "token": "1|abc123xyz..."
  }
}
```

---

## Login

Authenticate with email and password to receive an API token.

```
POST /api/v1/login
```

### Request body

```json
{
  "email": "alice@example.com",
  "password": "secret123"
}
```

### Response `200 OK`

```json
{
  "data": {
    "user": {
      "id": 1,
      "name": "Alice Smith",
      "email": "alice@example.com",
      "role": "admin"
    },
    "token": "2|def456uvw..."
  }
}
```

### Error `401 Unauthorized`

```json
{
  "message": "Invalid credentials."
}
```

---

## Logout

Revoke the current token.

```
POST /api/v1/logout
```

### Headers

```
Authorization: Bearer <token>
```

### Response `200 OK`

```json
{
  "message": "Logged out successfully."
}
```

---

## Using Your Token

Include the token in the `Authorization` header of every subsequent request:

```bash
curl -H "Authorization: Bearer 2|def456uvw..." \
     https://your-domain.com/api/v1/contacts
```

Tokens do not expire automatically. Call `POST /api/v1/logout` to revoke them.
