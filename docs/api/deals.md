# Deals API

## List Deals

```http
GET /api/v1/deals
Authorization: Bearer <token>
```

Query parameters: `search`, `stage`, `per_page`, `page`.

## Get Deal

```http
GET /api/v1/deals/{id}
Authorization: Bearer <token>
```

## Create Deal

```http
POST /api/v1/deals
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Enterprise Deal",
  "value": 24000,
  "stage": "new_deal",
  "contact_id": 1,
  "assigned_user_id": 2,
  "expected_closing_date": "2025-04-30",
  "probability": 10
}
```

Valid `stage` values: `new_deal`, `proposal_sent`, `negotiation`, `won`, `lost`

## Update Deal

```http
PUT /api/v1/deals/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "stage": "negotiation",
  "probability": 60
}
```

## Delete Deal

```http
DELETE /api/v1/deals/{id}
Authorization: Bearer <token>
```
