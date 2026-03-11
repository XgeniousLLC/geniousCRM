<?php

/**
 * NotificationController
 *
 * Serves in-app notifications for the authenticated user.
 * Provides JSON endpoints consumed by the TopHeader bell component.
 *
 * Routes:
 *   GET    /notifications          — recent 20 with unread count
 *   PATCH  /notifications/{id}/read — mark a single notification read
 *   PATCH  /notifications/read-all  — mark all unread as read
 *
 * Module  : Notification
 * Package : Modules\Notification\Http\Controllers
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace Modules\Notification\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Return the latest 20 notifications for the current user plus unread count.
     */
    public function index(): JsonResponse
    {
        $user = Auth::user();

        $notifications = $user->notifications()
            ->latest()
            ->limit(20)
            ->get()
            ->map(fn($n) => [
                'id'         => $n->id,
                'message'    => $n->data['message']    ?? '',
                'url'        => $n->data['url']        ?? null,
                'read_at'    => $n->read_at,
                'created_at' => $n->created_at->diffForHumans(),
            ]);

        return response()->json([
            'unread_count'  => $user->unreadNotifications()->count(),
            'notifications' => $notifications,
        ]);
    }

    /**
     * Mark a single notification as read.
     */
    public function markRead(string $id): JsonResponse
    {
        $notification = Auth::user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return response()->json(['ok' => true]);
    }

    /**
     * Mark all unread notifications as read for the current user.
     */
    public function markAllRead(): JsonResponse
    {
        Auth::user()->unreadNotifications()->update(['read_at' => now()]);

        return response()->json(['ok' => true]);
    }
}
