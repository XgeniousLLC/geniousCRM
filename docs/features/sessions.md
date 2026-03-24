# Active Sessions

The Active Sessions panel shows every device and browser where you are currently logged in, so you can spot unexpected access and revoke sessions you don't recognise.

## Viewing Your Sessions

1. Go to **Profile** (click your avatar → Profile)
2. Scroll to the **Active Sessions** section

Each session row shows:
- **IP Address** — the IP the session was created from
- **Device / Browser** — parsed from the user-agent string
- **Last Active** — how long ago the session was last used
- **Current** — the session you are using right now (cannot be revoked here)

## Revoking a Single Session

Click **Revoke** next to any session that isn't your current one. That session will be immediately invalidated — the next request from that device will redirect to the login page.

Use this if you see a session from an unfamiliar IP or device.

## Log Out All Other Devices

Click **Log out all other devices** to revoke every session except your current one in a single action. You'll be asked to confirm your current password.

This is useful if:
- You forgot to log out on a shared computer
- You suspect your account has been accessed by someone else

## Requirement

Active session management requires `SESSION_DRIVER=database` in your `.env` file. This is the default in production.

If `SESSION_DRIVER=file`, the sessions panel will not show individual sessions.
