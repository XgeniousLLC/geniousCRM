---
title: API Reference
nav_order: 3
has_children: true
---

# REST API Reference
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }
1. TOC
{:toc}

---

## Overview

Mini CRM exposes a versioned REST API secured with **Laravel Sanctum** token authentication. The API is designed for building integrations, mobile apps, or third-party automations.

**Base URL:** `/api/v1`
**Module:** `Api`
**Authentication:** Bearer token (Sanctum)

---

## Authentication

All API endpoints except `POST /api/v1/login` and `POST /api/v1/register` require an `Authorization` header:

```
Authorization: Bearer <your-token>
```

Tokens are obtained via the login endpoint and remain valid until explicitly revoked.

---

## Rate Limits

| Client type | Limit |
|-------------|-------|
| Unauthenticated (login, register) | 60 requests / minute |
| Authenticated | 120 requests / minute |

When a rate limit is exceeded the API returns `429 Too Many Requests`.

---

## Response Format

All responses are JSON. Successful responses follow this envelope:

```json
{
  "data": { ... },
  "message": "Optional success message"
}
```

Paginated list responses use Laravel's pagination wrapper:

```json
{
  "data": [...],
  "links": { "first": "...", "last": "...", "prev": null, "next": "..." },
  "meta": { "current_page": 1, "last_page": 4, "per_page": 15, "total": 52 }
}
```

---

## Error Responses

| HTTP Status | Meaning |
|-------------|---------|
| `400` | Bad Request — validation failed |
| `401` | Unauthenticated — token missing or invalid |
| `403` | Forbidden — insufficient role |
| `404` | Not Found |
| `422` | Unprocessable Entity — validation errors (with field details) |
| `429` | Too Many Requests |
| `500` | Internal Server Error |

Validation errors return a `422` with an `errors` key:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."]
  }
}
```

---

## Available Endpoints

| Section | Prefix |
|---------|--------|
| [Authentication](authentication) | `/api/v1` |
| [Contacts](contacts) | `/api/v1/contacts` |
| [Leads](leads) | `/api/v1/leads` |
| [Deals](deals) | `/api/v1/deals` |
| [Tasks](tasks) | `/api/v1/tasks` |
