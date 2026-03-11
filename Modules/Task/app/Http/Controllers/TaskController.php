<?php

/**
 * TaskController
 *
 * Handles all HTTP actions for the Task module.
 * Tasks are polymorphic CRM to-dos that can be attached
 * to a Lead, Contact, or Deal, or exist standalone.
 *
 * Module  : Task
 * Package : Modules\Task\Http\Controllers
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace Modules\Task\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Task\Models\Task;
use Modules\Notification\Notifications\TaskAssigned;

class TaskController extends Controller
{
    /**
     * Display "My Tasks" — all tasks assigned to the current user.
     * Supports filter by status.
     */
    public function index(Request $request): Response
    {
        $tasks = Task::with(['assignedUser', 'createdBy'])
            ->where('assigned_user_id', Auth::id())
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->orderByRaw("CASE WHEN status='in_progress' THEN 1 WHEN status='pending' THEN 2 WHEN status='done' THEN 3 ELSE 4 END")
            ->orderBy('due_date')
            ->get()
            ->map(fn($t) => $this->format($t));

        return Inertia::render('Task/MyTasks', [
            'tasks'      => $tasks,
            'statuses'   => Task::$statuses,
            'salesUsers' => User::role(['admin', 'manager', 'sales_user'])->orderBy('name')->get(['id', 'name']),
            'filters'    => [
                'status' => $request->status,
            ],
        ]);
    }

    /**
     * Store a new task. Accepts optional taskable_type + taskable_id to link to an entity.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'title'            => 'required|string|max:191',
            'description'      => 'nullable|string',
            'due_date'         => 'nullable|date',
            'assigned_user_id' => 'nullable|exists:users,id',
            'status'           => 'nullable|in:pending,in_progress,done',
            'taskable_type'    => 'nullable|in:Lead,Contact,Deal',
            'taskable_id'      => 'nullable|integer',
        ]);

        $task = Task::create(array_merge($data, [
            'created_by' => Auth::id(),
            'status'     => $data['status'] ?? 'pending',
        ]));

        // Notify assigned user (skip self-assignment)
        if ($task->assigned_user_id && $task->assigned_user_id !== Auth::id()) {
            $task->load('assignedUser');
            $task->assignedUser->notify(new TaskAssigned($task));
        }

        return back()->with('success', 'Task created.');
    }

    /**
     * Update an existing task's fields.
     */
    public function update(Request $request, Task $task)
    {
        $data = $request->validate([
            'title'            => 'required|string|max:191',
            'description'      => 'nullable|string',
            'due_date'         => 'nullable|date',
            'assigned_user_id' => 'nullable|exists:users,id',
            'status'           => 'required|in:pending,in_progress,done',
        ]);

        $oldAssigneeId = $task->assigned_user_id;
        $task->update($data);

        // Notify new assignee when assignment changes (skip self-assignment)
        if ($task->assigned_user_id
            && $task->assigned_user_id !== $oldAssigneeId
            && $task->assigned_user_id !== Auth::id()
        ) {
            $task->load('assignedUser');
            $task->assignedUser->notify(new TaskAssigned($task));
        }

        return back()->with('success', 'Task updated.');
    }

    /**
     * Cycle the task status: pending → in_progress → done → pending.
     */
    public function updateStatus(Task $task)
    {
        $task->update(['status' => $task->nextStatus()]);

        return back();
    }

    /**
     * Permanently delete a task.
     */
    public function destroy(Task $task)
    {
        $task->delete();

        return back()->with('success', 'Task deleted.');
    }

    /** Format a task for Inertia props. */
    private function format(Task $t): array
    {
        return [
            'id'               => $t->id,
            'title'            => $t->title,
            'description'      => $t->description,
            'due_date'         => $t->due_date?->format('Y-m-d'),
            'due_date_label'   => $t->due_date?->format('M j, Y'),
            'assigned_user_id' => $t->assigned_user_id,
            'assigned_user'    => $t->assignedUser ? ['id' => $t->assignedUser->id, 'name' => $t->assignedUser->name] : null,
            'created_by'       => $t->createdBy ? ['name' => $t->createdBy->name] : null,
            'status'           => $t->status,
            'taskable_type'    => $t->taskable_type,
            'taskable_id'      => $t->taskable_id,
            'created_at'       => $t->created_at->diffForHumans(),
        ];
    }
}
