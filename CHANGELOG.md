# Changelog

All notable API changes to Mini CRM are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
API versioning follows [Semantic Versioning](https://semver.org/).

---

## [v1.0.0] — 2026-03-11

Initial public release of the Mini CRM REST API (`/api/v1`).

### Added — Authentication
- `POST /api/v1/login` — exchange credentials for a Sanctum token
- `POST /api/v1/register` — create account and receive a token
- `POST /api/v1/logout` — revoke the current bearer token

### Added — Contacts
- `GET    /api/v1/contacts`      — paginated list (search by name/email)
- `POST   /api/v1/contacts`      — create a contact
- `GET    /api/v1/contacts/{id}` — single contact detail
- `PUT    /api/v1/contacts/{id}` — full update
- `DELETE /api/v1/contacts/{id}` — soft-delete

### Added — Leads
- `GET    /api/v1/leads`         — paginated list (filter by status)
- `POST   /api/v1/leads`         — create a lead
- `GET    /api/v1/leads/{id}`    — single lead detail
- `PUT    /api/v1/leads/{id}`    — full update (includes status, follow_up_date)
- `DELETE /api/v1/leads/{id}`    — soft-delete

### Added — Deals
- `GET    /api/v1/deals`         — paginated list (filter by stage)
- `POST   /api/v1/deals`         — create a deal
- `GET    /api/v1/deals/{id}`    — single deal detail
- `PUT    /api/v1/deals/{id}`    — full update (includes stage, probability)
- `DELETE /api/v1/deals/{id}`    — soft-delete

### Added — Tasks
- `GET    /api/v1/tasks`         — paginated list (filter by status)
- `POST   /api/v1/tasks`         — create a task
- `GET    /api/v1/tasks/{id}`    — single task detail
- `PUT    /api/v1/tasks/{id}`    — full update
- `DELETE /api/v1/tasks/{id}`    — delete

### Rate Limits
| Scope           | Limit         |
|-----------------|---------------|
| Public routes   | 60 req / min  |
| Authenticated   | 120 req / min |

---

## Versioning Policy

### URI versioning
All API endpoints are prefixed with `/api/v{n}` (e.g. `/api/v1/contacts`).
A new major version prefix is introduced only for **breaking changes**.

### Backwards compatibility
Within a major version (e.g. v1), we guarantee:
- No removal of existing fields from response bodies
- No changes to existing field types
- No removal of existing endpoints

Non-breaking additions (new fields, new endpoints) are released without a version bump.

### Deprecation process
When a field or endpoint is scheduled for removal:
1. A `Deprecated` response header is added **at least two minor versions** before removal:
   ```
   Deprecated: true
   Sunset: Sat, 01 Jan 2027 00:00:00 GMT
   Link: <https://github.com/xgenious/mini-crm/blob/main/CHANGELOG.md>; rel="deprecation"
   ```
2. The deprecation is documented in this `CHANGELOG.md` under a `### Deprecated` section.
3. After the sunset date the endpoint/field is removed and documented under `### Removed`.

### Example — adding a `Deprecated` header in a controller
```php
return response()->json($data)
    ->header('Deprecated', 'true')
    ->header('Sunset', 'Sat, 01 Jan 2027 00:00:00 GMT')
    ->header('Link', '<'.url('/').'/CHANGELOG.md>; rel="deprecation"');
```
