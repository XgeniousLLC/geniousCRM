---
title: Tasks API
parent: API Reference
nav_order: 5
---

# Tasks API
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }
1. TOC
{:toc}

---

## List Tasks

```
GET /api/v1/tasks
```

Returns tasks assigned to the authenticated user.

### Query parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by `pending`, `in_progress`, or `done` |
| `page` | integer | Page number |

### Response `200 OK`

```json
{
  "data": [
    {
      "id": 7,
      "title": "Follow up with Alice",
      "description": "Call to discuss renewal",
      "due_date": "2024-02-20",
      "status": "pending",
      "assigned_user": { "id": 2, "name": "Bob Jones" },
      "taskable_type": "Contact",
      "taskable_id": 1,
      "created_at": "2024-01-25T09:00:00Z"
    }
  ],
  "meta": { ... }
}
```

---

## Get Task

```
GET /api/v1/tasks/{id}
```

Returns a single task resource.

---

## Create Task

```
POST /api/v1/tasks
```

### Request body

```json
{
  "title": "Send proposal",
  "description": "Attach pricing PDF",
  "due_date": "2024-02-28",
  "status": "pending",
  "assigned_user_id": 2,
  "taskable_type": "Deal",
  "taskable_id": 3
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `title` | Yes | |
| `description` | No | |
| `due_date` | No | ISO 8601 date |
| `status` | No | `pending`, `in_progress`, `done` (default: `pending`) |
| `assigned_user_id` | No | Triggers in-app + email notification |
| `taskable_type` | No | `Contact`, `Lead`, `Deal`, or `Company` |
| `taskable_id` | No | ID of the parent entity |

### Response `201 Created`

Returns the created task resource.

---

## Update Task

```
PUT /api/v1/tasks/{id}
```

Same fields as Create. Commonly used to update the `status` field.

### Response `200 OK`

Returns the updated task resource.

---

## Delete Task

```
DELETE /api/v1/tasks/{id}
```

Soft-deletes the task.

### Response `200 OK`

```json
{
  "message": "Task deleted successfully."
}
```

---

## Task Status Values

| Value | Meaning |
|-------|---------|
| `pending` | Not yet started |
| `in_progress` | Work has begun |
| `done` | Completed |
