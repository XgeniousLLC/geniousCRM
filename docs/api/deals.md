---
title: Deals API
parent: API Reference
nav_order: 4
---

# Deals API
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }
1. TOC
{:toc}

---

## List Deals

```
GET /api/v1/deals
```

### Query parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `stage` | string | Filter by stage |
| `search` | string | Filter by title |
| `page` | integer | Page number |

### Response `200 OK`

```json
{
  "data": [
    {
      "id": 3,
      "title": "Website Redesign",
      "value": 12500.00,
      "probability": 60,
      "stage": "negotiation",
      "expected_closing_date": "2024-03-31",
      "contact": { "id": 1, "name": "Alice Smith" },
      "assigned_user": { "id": 2, "name": "Bob Jones" },
      "created_at": "2024-01-20T14:00:00Z"
    }
  ],
  "meta": { "total": 18, "current_page": 1, ... }
}
```

---

## Get Deal

```
GET /api/v1/deals/{id}
```

Returns a single deal resource including linked products:

```json
{
  "data": {
    "id": 3,
    "title": "Website Redesign",
    "value": 12500.00,
    "probability": 60,
    "stage": "negotiation",
    "products": [
      { "name": "Design", "quantity": 1, "unit_price": 5000.00 },
      { "name": "Development", "quantity": 1, "unit_price": 7500.00 }
    ],
    ...
  }
}
```

---

## Create Deal

```
POST /api/v1/deals
```

### Request body

```json
{
  "title": "CRM Integration",
  "value": 8000.00,
  "stage": "new_deal",
  "contact_id": 1,
  "assigned_user_id": 2,
  "expected_closing_date": "2024-04-30",
  "probability": 10
}
```

| Field | Required | Valid values |
|-------|----------|-------------|
| `title` | Yes | |
| `value` | No | Decimal |
| `stage` | No | `new_deal`, `proposal_sent`, `negotiation`, `won`, `lost` (default: `new_deal`) |
| `contact_id` | No | Valid contact ID |
| `assigned_user_id` | No | Valid user ID |
| `expected_closing_date` | No | ISO 8601 date |
| `probability` | No | Integer 0–100 |

### Response `201 Created`

Returns the created deal resource.

---

## Update Deal

```
PUT /api/v1/deals/{id}
```

Same fields as Create. To move a deal to a new stage update the `stage` field.

### Response `200 OK`

Returns the updated deal resource.

---

## Update Deal Stage

A dedicated endpoint for moving a deal through the pipeline (used by the Kanban board):

```
PATCH /api/v1/deals/{id}/stage
```

### Request body

```json
{
  "stage": "proposal_sent"
}
```

### Response `200 OK`

```json
{
  "data": { "id": 3, "stage": "proposal_sent", "probability": 30, ... }
}
```

---

## Delete Deal

```
DELETE /api/v1/deals/{id}
```

Soft-deletes the deal.

### Response `200 OK`

```json
{
  "message": "Deal deleted successfully."
}
```
