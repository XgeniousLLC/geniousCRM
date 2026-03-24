# Contacts API

## List Contacts

```http
GET /api/v1/contacts
Authorization: Bearer <token>
```

Query parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Filter by name or email |
| `per_page` | integer | Results per page (default 15) |
| `page` | integer | Page number |

**Response `200`:**

```json
{
  "data": [
    {
      "id": 1,
      "first_name": "James",
      "last_name": "Morrison",
      "email": "james@acme.com",
      "phone": "+1-555-101-0001",
      "company": "Acme Corporation",
      "created_at": "2025-03-01T10:00:00Z"
    }
  ],
  "meta": { "current_page": 1, "last_page": 2, "total": 15 }
}
```

## Get Contact

```http
GET /api/v1/contacts/{id}
Authorization: Bearer <token>
```

## Create Contact

```http
POST /api/v1/contacts
Authorization: Bearer <token>
Content-Type: application/json

{
  "first_name": "Jane",
  "last_name": "Doe",
  "email": "jane@example.com",
  "phone": "555-1234",
  "company": "Acme Corp"
}
```

**Response `201`** — returns the created contact resource.

## Update Contact

```http
PUT /api/v1/contacts/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "first_name": "Jane",
  "last_name": "Smith"
}
```

**Response `200`** — returns the updated contact.

## Delete Contact

```http
DELETE /api/v1/contacts/{id}
Authorization: Bearer <token>
```

**Response `200`:**

```json
{ "message": "Contact deleted." }
```

The contact is soft-deleted and can be restored via the UI.
