---
title: Tasks & Notes
parent: Features
nav_order: 6
---

# Tasks & Notes
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }
1. TOC
{:toc}

---

## Overview

Tasks are polymorphic — they can be attached to any CRM entity (Contact, Lead, Deal, or Company). Notes are inline text entries stored per-entity and separate from tasks.

**Route prefix:** `/tasks`
**Module:** `Task`
**Access:** All roles

---

## Task Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Title | text | Yes | Short description of the task |
| Description | textarea | No | Detailed instructions or context |
| Due Date | date | No | When the task should be completed |
| Status | select | Yes | Current state of the task |
| Assigned To | select | No | User responsible for completing the task |

---

## Task Statuses

| Status | Meaning |
|--------|---------|
| `pending` | Not yet started |
| `in_progress` | Work has begun |
| `done` | Completed |

---

## My Tasks

**Route:** `GET /tasks`

The "My Tasks" view shows all tasks assigned to the currently logged-in user. Tasks are sorted by:

1. Status priority: `in_progress` first, `pending` second, `done` last.
2. Due date ascending within each status group.

Filters available:
- **Status** — filter by pending, in_progress, or done.

---

## Task Panels on Entity Pages

Tasks appear as embedded panels on the detail pages of:

- Contact detail (`/contacts/{id}`)
- Lead detail (`/leads/{id}`)
- Deal detail (`/deals/{id}`)
- Company detail (`/companies/{id}`)

Each panel shows the tasks attached to that specific record. You can add new tasks directly from the panel without navigating away.

### Adding a task from a panel

1. Click **+ Add Task** within the task panel.
2. Fill in the title, description, due date, status, and assignee.
3. The task is created and appears immediately in the panel.

### Changing task status

Click the status badge on any task card to cycle through `pending → in_progress → done`. The change is saved immediately via a `PATCH` request.

---

## Notes

Notes are inline text entries scoped to a single entity. They are simpler than tasks — no due date, no status, just body text.

### Note fields

| Field | Description |
|-------|-------------|
| Body | Free-text content |

### Adding a note

Click **+ Add Note** in the Notes panel on any entity detail page. The note is saved and displayed immediately.

### Deleting a note

Click the delete icon on any note. Only the note's author or an admin can delete it.

---

## Task Assignment Notifications

When a task is assigned or reassigned to a user, they receive:

- An **in-app notification** (bell icon in the top header).
- An **email** (if mail is configured and the queue worker is running).

---

## Controller Reference

**File:** `Modules/Task/app/Http/Controllers/TaskController.php`

| Method | Route | Description |
|--------|-------|-------------|
| `index` | `GET /tasks` | My Tasks list with status filter |
| `store` | `POST /tasks` | Create task attached to any entity |
| `update` | `PATCH /tasks/{id}` | Update task fields or status |
| `destroy` | `DELETE /tasks/{id}` | Delete task |
