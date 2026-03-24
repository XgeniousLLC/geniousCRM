# Notifications

Mini CRM notifies you of important events in two ways: **in-app** (the bell icon) and **email** (via your mail server).

## In-App Notifications

The bell icon (🔔) in the top header shows a badge with your unread notification count.

Click the bell to open the notification dropdown. The last 10 notifications are shown, each with:
- A message describing the event
- A relative timestamp
- A link to the relevant record

### Marking as Read

- Click a notification to mark it as read and navigate to the linked record
- Click **Mark all as read** to clear all unread notifications at once

### What Triggers an In-App Notification

| Event | Who is notified |
|-------|----------------|
| Lead assigned to you | The assigned user |
| Deal assigned to you | The assigned user |
| Task assigned to you | The assigned user |

## Email Notifications

Email notifications are sent via the queue. Make sure `QUEUE_CONNECTION` and `MAIL_*` variables are configured (see [Configuration](/guide/configuration)).

### Lead Assigned Email

When a lead is assigned to a user, they receive an email with:
- Lead name and contact details
- A link to open the lead in Mini CRM

### Deal Assigned Email

When a deal is assigned to a user, they receive an email with deal title, value, and a direct link.

### Task Assigned Email

When a task is assigned to a user, they receive an email with task title, due date, and a link.

### Daily Task Reminder

Every day at **08:00** the scheduler sends each user a digest email listing all their tasks due today (status ≠ Done).

## Queue Worker Required

Email notifications are sent via the Laravel queue. Make sure the queue worker is running:

```bash
php artisan queue:work --sleep=3 --tries=3
```

Or use Supervisor (a `supervisor.conf` is included in the repo root).

If emails are not arriving, check `storage/logs/laravel.log` for queue errors.
