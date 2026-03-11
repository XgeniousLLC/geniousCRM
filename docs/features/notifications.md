---
title: Notifications
parent: Features
nav_order: 10
---

# Notifications
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }
1. TOC
{:toc}

---

## Overview

Mini CRM has a two-channel notification system: in-app bell notifications visible in the top navigation bar, and email notifications dispatched via the queue.

**Module:** `Notification`
**Access:** All roles (receive notifications assigned to them)

---

## In-App Notifications

### Bell icon

A bell icon appears in the top-right header next to your avatar. An orange badge shows the count of unread notifications.

### Notification dropdown

Clicking the bell opens a panel showing the 10 most recent notifications. Each notification shows:

- A blue dot indicator if unread
- The message text
- Relative timestamp (e.g. "2 hours ago")

Clicking a notification:
1. Marks it as read (removes the blue dot and decrements the badge count).
2. Navigates to the relevant entity page (e.g. the deal or task that triggered the notification).

### Mark all as read

A "Mark all read" link at the top of the dropdown marks all notifications as read in one click.

---

## Notification Triggers

| Event | Who is notified |
|-------|-----------------|
| Lead assigned to user | The newly assigned user |
| Lead reassigned to different user | The new assignee |
| Task assigned to user | The newly assigned user |
| Task reassigned to different user | The new assignee |
| Deal assigned to user | The newly assigned user |
| Deal reassigned to different user | The new assignee |

The previous assignee is not notified when a record is taken away from them.

---

## Email Notifications

Email notifications are sent via the Laravel queue (database or Redis driver).

### Requirements

In `.env`:

```env
QUEUE_CONNECTION=database
MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=your-username
MAIL_PASSWORD=your-password
MAIL_FROM_ADDRESS=crm@yourdomain.com
MAIL_FROM_NAME="Mini CRM"
```

Start the queue worker:

```bash
php artisan queue:work
```

### Email types

| Notification Class | Trigger | Subject |
|-------------------|---------|---------|
| `LeadAssigned` | Lead assigned/reassigned | "New lead assigned to you" |
| `TaskAssigned` | Task assigned/reassigned | "New task assigned to you" |
| `DealAssigned` | Deal assigned/reassigned | "New deal assigned to you" |
| `DealStageMail` | Deal moves to Won or Lost | "Deal status update" |
| `TaskDueReminderMail` | Daily digest of tasks due today | "Tasks due today" |

### Task Due Reminder Schedule

A daily command `SendTaskDueReminders` runs via the Laravel scheduler at **08:00 UTC**. It finds all `pending` or `in_progress` tasks with `due_date = today` and emails each assignee.

To run the scheduler:

```bash
php artisan schedule:work
```

Or in production use the Supervisor scheduler process — see [Docker Deployment](../deployment/docker).

---

## Database Schema

Notifications use Laravel's built-in notification system with the `database` channel:

```
notifications
├── id (UUID)
├── type (fully-qualified notification class name)
├── notifiable_type
├── notifiable_id
├── data (JSON: { message, url })
├── read_at (nullable)
└── created_at
```

---

## Notification API Endpoints

These JSON endpoints are used by the bell component in the header:

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/notifications` | Returns `{ unread_count, recent: [...] }` |
| `PATCH` | `/notifications/{id}/read` | Mark one notification as read |
| `PATCH` | `/notifications/read-all` | Mark all notifications as read |
