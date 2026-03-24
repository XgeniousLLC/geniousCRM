# Tasks API

## List Tasks

```http
GET /api/v1/tasks
Authorization: Bearer <token>
```

Query parameters: `status`, `per_page`, `page`.

## Get Task

```http
GET /api/v1/tasks/{id}
Authorization: Bearer <token>
```

## Create Task

```http
POST /api/v1/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Call the client",
  "description": "Follow up on the proposal sent last week.",
  "due_date": "2025-04-10",
  "assigned_user_id": 2,
  "status": "pending",
  "taskable_type": "Modules\\Contact\\Models\\Contact",
  "taskable_id": 1
}
```

Valid `status` values: `pending`, `in_progress`, `done`

Leave `taskable_type` and `taskable_id` null for a standalone task.

## Update Task

```http
PUT /api/v1/tasks/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "done"
}
```

## Delete Task

```http
DELETE /api/v1/tasks/{id}
Authorization: Bearer <token>
```
