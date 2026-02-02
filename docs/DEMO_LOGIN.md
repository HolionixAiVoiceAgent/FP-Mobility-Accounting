# Demo Login (Optional)

When you can’t use normal login (e.g. Supabase down, email not verified), you can enable **demo login** with a hardcoded email and password.

## 1. Enable demo login

In `.env` add or uncomment:

```env
VITE_DEMO_LOGIN_ENABLED=true
VITE_DEMO_EMAIL=admin@example.com
VITE_DEMO_PASSWORD=Admin123!
```

- **Demo login (Supabase):** Create a user in Supabase with that email and password (Dashboard → Authentication → Users, or sign up once). Then use the **“Demo login (admin@example.com)”** button on the login page to sign in with one click.
- **Default credentials** if you don’t set env: `admin@example.com` / `Admin123!` (you must create this user in Supabase for the button to work).

Restart the dev server after changing `.env`.

## 2. Offline demo (no Supabase)

If Supabase is unreachable and you still want to open the app (UI only; data will fail):

```env
VITE_DEMO_LOGIN_ENABLED=true
VITE_DEMO_EMAIL=admin@example.com
VITE_DEMO_PASSWORD=Admin123!
VITE_DEMO_BYPASS_AUTH=true
```

Then on the login page:

- **“Demo login (admin@example.com)”** – tries real Supabase sign-in.
- **“Demo (offline) – no Supabase”** – skips Supabase and logs you in as a fake admin. No real session; lists and data from Supabase will not load.

To exit offline demo: sign out (clears the bypass).

## Security

- **Do not enable in production** (or use strong, unique values and understand the risk).
- Leave `VITE_DEMO_LOGIN_ENABLED` unset or `false` in production builds.
