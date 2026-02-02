# Email Verification Link – Supabase Setup

If the **email verification link** doesn’t work after sign-up (e.g. “Redirect URL not allowed” or the link doesn’t sign you in), configure Supabase as below.

## 1. Add redirect URLs in Supabase

1. Open **[Supabase Dashboard](https://app.supabase.com)** → your project.
2. Go to **Authentication** → **URL Configuration**.
3. Under **Redirect URLs**, add **each** URL your app runs on:

   **Local development (Vite default port 8080):**
   ```text
   http://localhost:8080/auth/callback
   ```

   **Production (replace with your real domain):**
   ```text
   https://your-domain.com/auth/callback
   ```

4. Click **Save**.

The verification email link will redirect to one of these URLs. They must match **exactly** (including path `/auth/callback` and no trailing slash unless you added it).

## 2. Set Site URL (optional but recommended)

In the same **URL Configuration** page:

- **Site URL**: set to your main app URL, e.g.  
  - Local: `http://localhost:8080`  
  - Production: `https://your-domain.com`  

This is used as the default base for auth redirects.

## 3. Production: set `VITE_APP_URL` (optional)

If your app is served from a different URL than where users sign up (e.g. multiple domains or preview URLs), set the base URL used for the verification link:

In `.env` or your hosting env:

```env
# Base URL of the app (no trailing slash). Used for email verification redirect.
VITE_APP_URL=https://your-domain.com
```

- **Local:** You can leave this unset; the app uses `window.location.origin`.
- **Production:** Set it to your canonical app URL (e.g. `https://your-domain.com`) so the link in the email always points to the right place.

## 4. Check “Confirm email” is enabled

1. **Authentication** → **Providers** → **Email**.
2. Ensure **Confirm email** is ON if you want users to verify before signing in.

## Summary

| Issue | Fix |
|-------|-----|
| “Redirect URL not allowed” | Add `http://localhost:8080/auth/callback` (and your production URL) under **Redirect URLs**. |
| Link opens but user not signed in | Same as above; also ensure **Site URL** matches your app. |
| Link goes to wrong domain | Set `VITE_APP_URL` in production env to your app URL. |

After changing Redirect URLs or Site URL, try signing up again and use the new verification email.
