# API Authentication

Mini CRM uses Laravel Sanctum for API token authentication.

## Register

Create a new user account and receive an API token.

```http
POST /api/v1/register
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123",
  "password_confirmation": "secret123"
}
```

**Response `201`:**

```json
{
  "token": "1|abc123...",
  "user": {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
}
```

## Login

Exchange credentials for an API token.

```http
POST /api/v1/login
Content-Type: application/json

{
  "email": "jane@example.com",
  "password": "secret123"
}
```

**Response `200`:**

```json
{
  "token": "2|xyz456...",
  "user": {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
}
```

**Response `422` — invalid credentials:**

```json
{
  "message": "The provided credentials are incorrect."
}
```

## Logout

Revoke the current token.

```http
POST /api/v1/logout
Authorization: Bearer <token>
```

**Response `200`:**

```json
{
  "message": "Logged out successfully."
}
```

## Using the Token

Pass the token in every authenticated request:

```http
GET /api/v1/contacts
Authorization: Bearer 2|xyz456...
Accept: application/json
```
