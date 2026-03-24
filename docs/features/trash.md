# Trash & Restore

Contacts, leads, and deals are **soft-deleted** — they are not permanently removed when you click Delete. Instead, they move to the Trash where they can be reviewed, restored, or permanently purged.

## Accessing the Trash

Go to the Trash links in the sidebar (Admin only):

- **Contacts → Trash**
- **Leads → Trash**
- **Deals → Trash**

Each Trash page shows only deleted records for that module.

## Restoring a Record

1. Open the Trash for the relevant module
2. Find the record you want to recover
3. Click **Restore**

The record is immediately moved back to the active list and all its linked data (notes, tasks, tags) is restored.

## Permanently Deleting a Record

1. Open the Trash
2. Click **Delete Permanently** next to the record
3. Confirm the dialog

::: danger This cannot be undone
Permanent deletion removes the record and all associated data (notes, tags) from the database completely.
:::

## When Records Get Soft-Deleted

| Action | What happens |
|--------|-------------|
| Delete a contact | `deleted_at` is set; contact is hidden from all lists |
| Delete a lead | `deleted_at` is set; lead is hidden from all lists |
| Delete a deal | `deleted_at` is set; deal is hidden from the pipeline |

Tasks linked to a soft-deleted record remain in the database but are excluded from the My Tasks view.

## Automatic Cleanup

Mini CRM does not automatically purge old trash records. Run this command periodically if you want to clean up:

```bash
# Force-delete all soft-deleted contacts older than 30 days
php artisan tinker
>>> \Modules\Contact\Models\Contact::onlyTrashed()->where('deleted_at', '<', now()->subDays(30))->forceDelete();
```
