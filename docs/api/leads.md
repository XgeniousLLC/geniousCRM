# Leads API

## List Leads

```http
GET /api/v1/leads
Authorization: Bearer <token>
```

Query parameters: `search`, `status`, `per_page`, `page`.

## Get Lead

```http
GET /api/v1/leads/{id}
Authorization: Bearer <token>
```

## Create Lead

```http
POST /api/v1/leads
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Prospect Person",
  "email": "prospect@example.com",
  "phone": "555-9999",
  "source": "Website",
  "status": "new",
  "assigned_user_id": 2
}
```

Valid `source` values: `Website`, `Referral`, `LinkedIn`, `Cold Outreach`, `Event`, `Advertisement`, `Other`

Valid `status` values: `new`, `contacted`, `qualified`, `lost`, `converted`

## Update Lead

```http
PUT /api/v1/leads/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "qualified",
  "follow_up_date": "2025-04-15"
}
```

## Delete Lead

```http
DELETE /api/v1/leads/{id}
Authorization: Bearer <token>
```
