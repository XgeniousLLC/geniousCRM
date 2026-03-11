<?php

/**
 * TaskApiController
 *
 * REST API controller for Task resources.
 * Supports list (with status/entity filter), show, create, update, delete.
 * Protected by auth:sanctum middleware.
 *
 * Module  : Api
 * Package : Modules\Api\Http\Controllers
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace Modules\Api\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Auth;
use Modules\Api\Http\Resources\TaskResource;
use Modules\Task\Models\Task;

class TaskApiController extends Controller
{
    /**
     * Return a paginated list of tasks.
     * Supports ?status=, ?entity_type=, ?entity_id=, ?assigned_to_me=1.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $tasks = Task::with(['assignedUser', 'createdBy'])
            ->when($request->status,      fn ($q, $s) => $q->where('status', $s))
            ->when($request->entity_type, fn ($q, $et) => $q->where('taskable_type', $et))
            ->when($request->entity_id,   fn ($q, $id) => $q->where('taskable_id', $id))
            ->when($request->assigned_to_me, fn ($q) => $q->where('assigned_user_id', Auth::id()))
            ->orderByRaw("FIELD(status, 'in_progress', 'pending', 'done')")
            ->orderBy('due_date')
            ->paginate(15)
            ->withQueryString();

        return TaskResource::collection($tasks);
    }

    /**
     * Return a single task.
     */
    public function show(Task $task): TaskResource
    {
        $task->load(['assignedUser', 'createdBy']);

        return new TaskResource($task);
    }

    /**
     * Store a new task linked to a polymorphic entity.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'            => 'required|string|max:191',
            'description'      => 'nullable|string',
            'due_date'         => 'nullable|date',
            'assigned_user_id' => 'nullable|exists:users,id',
            'status'           => 'nullable|in:pending,in_progress,done',
            'taskable_type'    => 'required|string|in:Lead,Contact,Deal',
            'taskable_id'      => 'required|integer',
        ]);

        $task = Task::create(array_merge($data, [
            'created_by' => Auth::id(),
            'status'     => $data['status'] ?? 'pending',
        ]));

        $task->load(['assignedUser', 'createdBy']);

        return (new TaskResource($task))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Update an existing task.
     */
    public function update(Request $request, Task $task): TaskResource
    {
        $data = $request->validate([
            'title'            => 'required|string|max:191',
            'description'      => 'nullable|string',
            'due_date'         => 'nullable|date',
            'assigned_user_id' => 'nullable|exists:users,id',
            'status'           => 'required|in:pending,in_progress,done',
        ]);

        $task->update($data);
        $task->load(['assignedUser', 'createdBy']);

        return new TaskResource($task);
    }

    /**
     * Permanently delete a task.
     */
    public function destroy(Task $task): JsonResponse
    {
        $task->delete();

        return response()->json(['message' => 'Task deleted.']);
    }
}
