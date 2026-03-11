---
title: Leads API
parent: API Reference
nav_order: 3
---

# Leads API
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }
1. TOC
{:toc}

---

## List Leads

```
GET /api/v1/leads
```

### Query parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Filter by name or email |
| `status` | string | Filter by status (`new`, `contacted`, `qualified`, `lost`, `converted`) |
| `page` | integer | Page number |

### Response `200 OK`

```json
{
  "data": [
    {
      "id": 5,
      "name": "Bob Jones",
      "email": "bob@example.com",
      "phone": "+1 555 0100",
      "source": "Website",
      "status": "new",
      "follow_up_date": "2024-02-15",
      "assigned_user": { "id": 2, "name": "Alice Smith" },
      "created_at": "2024-01-10T08:00:00Z"
    }
  ],
  "meta": { "total": 23, "current_page": 1, ... }
}
```

---

## Get Lead

```
GET /api/v1/leads/{id}
```

Returns a single lead resource with the same fields as the list response.

---

## Create Lead

```
POST /api/v1/leads
```

### Request body

```json
{
  "name": "Carol White",
  "email": "carol@example.com",
  "phone": "+44 7700 900002",
  "source": "Referral",
  "status": "new",
  "assigned_user_id": 2,
  "follow_up_date": "2024-03-01"
}
```

| Field | Required | Valid values |
|-------|----------|-------------|
| `name` | Yes | |
| `email` | No | Unique if provided |
| `phone` | No | |
| `source` | No | `Website`, `Referral`, `LinkedIn`, `Cold Outreach`, `Event`, `Advertisement`, `Other` |
| `status` | No | `new`, `contacted`, `qualified`, `lost`, `converted` (default: `new`) |
| `assigned_user_id` | No | Must be a valid user ID |
| `follow_up_date` | No | ISO 8601 date string |

### Response `201 Created`

Returns the created lead resource.

---

## Update Lead

```
PUT /api/v1/leads/{id}
```

### Request body

Same fields as Create. Only include fields to update.

### Response `200 OK`

Returns the updated lead resource.

---

## Delete Lead

```
DELETE /api/v1/leads/{id}
```

Soft-deletes the lead.

### Response `200 OK`

```json
{
  "message": "Lead deleted successfully."
}
```
