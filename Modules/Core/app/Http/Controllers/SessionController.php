<?php

/**
 * SessionController
 *
 * Manages active login sessions for the authenticated user.
 * Lists sessions from the `sessions` table, allows revoking individual
 * sessions or all sessions except the current one.
 *
 * Module  : Core
 * Package : Modules\Core\Http\Controllers
 * Author  : Xgenious (https://xgenious.com)
 * License : MIT
 */

namespace Modules\Core\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SessionController extends Controller
{
    /**
     * Return the list of active sessions for the current user.
     * Used by ProfileController to inject into the Profile page.
     */
    public static function getForUser(Request $request): array
    {
        if (config('session.driver') !== 'database') {
            return [];
        }

        return DB::table('sessions')
            ->where('user_id', $request->user()->id)
            ->orderByDesc('last_activity')
            ->get()
            ->map(function ($session) use ($request) {
                $payload = @unserialize(base64_decode($session->payload));
                return [
                    'id'             => $session->id,
                    'ip_address'     => $session->ip_address,
                    'user_agent'     => $session->user_agent,
                    'last_active'    => \Carbon\Carbon::createFromTimestamp($session->last_activity)->diffForHumans(),
                    'is_current'     => $session->id === $request->session()->getId(),
                ];
            })
            ->toArray();
    }

    /**
     * Revoke a specific session by ID (cannot revoke the current session).
     */
    public function revoke(Request $request, string $sessionId): RedirectResponse
    {
        if ($sessionId === $request->session()->getId()) {
            return back()->with('error', 'You cannot revoke your current session.');
        }

        DB::table('sessions')
            ->where('id', $sessionId)
            ->where('user_id', $request->user()->id)
            ->delete();

        return back()->with('success', 'Session revoked.');
    }

    /**
     * Log out all other devices — deletes all sessions except the current one.
     */
    public function revokeOthers(Request $request): RedirectResponse
    {
        DB::table('sessions')
            ->where('user_id', $request->user()->id)
            ->where('id', '!=', $request->session()->getId())
            ->delete();

        return back()->with('success', 'All other sessions have been logged out.');
    }
}
