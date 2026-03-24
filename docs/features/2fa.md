# Two-Factor Authentication (2FA)

Two-factor authentication adds a second layer of security to your account. After entering your password, you'll be asked for a 6-digit code from your authenticator app.

## Setting Up 2FA

1. Go to **Profile** (click your avatar → Profile)
2. Scroll to **Two-Factor Authentication**
3. Click **Enable Two-Factor Authentication**
4. A **QR code** appears — scan it with your authenticator app:
   - [Google Authenticator](https://support.google.com/accounts/answer/1066447)
   - [Authy](https://authy.com/)
   - [Microsoft Authenticator](https://www.microsoft.com/en-us/security/mobile-authenticator-app)
5. Enter the **6-digit code** from the app to confirm
6. Click **Confirm & Enable**

2FA is now active on your account.

## Recovery Codes

After enabling 2FA, Mini CRM shows you **8 recovery codes**. These are single-use backup codes you can enter instead of the authenticator code if you lose access to your phone.

::: danger Save your recovery codes
These are shown **once only**. Copy them to a password manager or a secure document immediately.
:::

Each recovery code can only be used once. After use it is marked as consumed. You can regenerate a new set from the Profile page.

## Logging In with 2FA

1. Enter your email and password as normal
2. You are redirected to the **2FA challenge page**
3. Open your authenticator app and enter the current 6-digit code
4. Click **Verify**

If you don't have your phone, click **Use a recovery code** and enter one of your saved backup codes.

## Disabling 2FA

1. Go to **Profile → Two-Factor Authentication**
2. Click **Disable Two-Factor Authentication**
3. Confirm with your current password

::: tip Admins
Admins can see whether 2FA is enabled for each user on the Users list page, but cannot view or manage another user's 2FA codes.
:::
