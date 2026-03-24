# REST API Overview

Mini CRM exposes a versioned REST API for all core resources. The API is protected by Laravel Sanctum tokens.

## Base URL

```
https://your-domain.com/api/v1
```

## Authentication

All API endpoints (except login and register) require a Bearer token in the `Authorization` header:

```http
Authorization: Bearer <your-token>
```

See [Authentication](/api/authentication) for how to obtain a token.

## Rate Limiting

| Endpoint group | Limit |
|---------------|-------|
| Public (login, register) | 60 requests / minute |
| Authenticated | 120 requests / minute |

Exceeding the limit returns `429 Too Many Requests`.

## Response Format

All responses are JSON. Successful responses follow this structure:

```json
{
  "data": { ... }
}
```

Or for lists:

```json
{
  "data": [ ... ],
  "meta": { "current_page": 1, "last_page": 3, "per_page": 15, "total": 42 }
}
```

Error responses:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."]
  }
}
```

## Available Endpoints

| Resource | Endpoints |
|----------|-----------|
| Auth | [POST /login, POST /register, POST /logout](/api/authentication) |
| Contacts | [CRUD](/api/contacts) |
| Leads | [CRUD](/api/leads) |
| Deals | [CRUD](/api/deals) |
| Tasks | [CRUD](/api/tasks) |
