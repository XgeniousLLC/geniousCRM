---
title: Contacts API
parent: API Reference
nav_order: 2
---

# Contacts API
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }
1. TOC
{:toc}

---

## List Contacts

```
GET /api/v1/contacts
```

### Query parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Filter by name or email |
| `page` | integer | Page number (default: 1) |
| `per_page` | integer | Results per page (default: 15, max: 100) |

### Response `200 OK`

```json
{
  "data": [
    {
      "id": 1,
      "first_name": "Alice",
      "last_name": "Smith",
      "email": "alice@example.com",
      "phone": "+44 7700 900001",
      "company": "Acme Ltd",
      "tags": ["vip", "partner"],
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "links": { ... },
  "meta": { "total": 52, "current_page": 1, ... }
}
```

---

## Get Contact

```
GET /api/v1/contacts/{id}
```

### Response `200 OK`

```json
{
  "data": {
    "id": 1,
    "first_name": "Alice",
    "last_name": "Smith",
    "email": "alice@example.com",
    "phone": "+44 7700 900001",
    "company": "Acme Ltd",
    "company_id": 3,
    "tags": ["vip"],
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-02-01T09:00:00Z"
  }
}
```

---

## Create Contact

```
POST /api/v1/contacts
```

### Request body

```json
{
  "first_name": "Bob",
  "last_name": "Jones",
  "email": "bob@example.com",
  "phone": "+1 555 0100",
  "company": "Globex",
  "tags": ["prospect"]
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `first_name` | Yes | |
| `last_name` | No | |
| `email` | No | Must be unique if provided |
| `phone` | No | |
| `company` | No | Free-text company name |
| `company_id` | No | FK to companies table |
| `tags` | No | Array of tag names (created if not existing) |

### Response `201 Created`

Returns the created contact resource.

---

## Update Contact

```
PUT /api/v1/contacts/{id}
```

### Request body

Same fields as Create. Only include fields you want to update.

### Response `200 OK`

Returns the updated contact resource.

---

## Delete Contact

```
DELETE /api/v1/contacts/{id}
```

Soft-deletes the contact. The record moves to trash and can be restored.

### Response `200 OK`

```json
{
  "message": "Contact deleted successfully."
}
```
