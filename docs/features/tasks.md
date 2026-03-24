# Tasks

Tasks are to-do items that can be attached to any CRM record — a contact, a lead, or a deal — or left as standalone reminders.

## Task Statuses

| Status | Description |
|--------|-------------|
| **Pending** | Not yet started (amber) |
| **In Progress** | Being worked on (blue) |
| **Done** | Completed (green) |

## My Tasks View

Go to **Tasks → My Tasks** in the sidebar. This shows all tasks assigned to you, sorted by due date. Overdue tasks (due date in the past, not done) appear at the top in red.

## Tasks on Entity Pages

Tasks linked to a specific contact, lead, or deal appear on that entity's detail page in a **Tasks panel**. You can create new tasks directly from there without leaving the page.

## Creating a Task

Click **New Task** from any Tasks panel or from **My Tasks → New Task**:

| Field | Required | Notes |
|-------|----------|-------|
| Title | Yes | Short task description |
| Description | No | More detail |
| Due Date | No | Date picker |
| Assigned To | No | Defaults to you |
| Status | Yes | Defaults to Pending |
| Linked to | No | Contact, Lead, or Deal (auto-filled when created from entity page) |

## Updating a Task

Click the task title or the edit icon. You can change the status, reassign, or update the due date.

To cycle the status quickly, click the **status badge** — it moves: Pending → In Progress → Done → Pending.

## Completing a Task

Click the task's status badge and select **Done**, or edit the task and set status to Done.

## Task Reminders

The scheduler sends a **daily email digest at 08:00** to each user listing their tasks due today. Make sure your mail configuration is set up in [Configuration](/guide/configuration).

## Deleting a Task

Click the delete icon on any task. Deleted tasks are soft-deleted and can be restored from the database if needed (no UI trash view for tasks — contact your admin).

## Tips

- Create a task immediately when you take action on a lead or deal — it keeps your pipeline accountable
- Use the **Due Date** field and check **My Tasks** each morning
- Assign tasks to specific team members from the deal or lead page to delegate work
