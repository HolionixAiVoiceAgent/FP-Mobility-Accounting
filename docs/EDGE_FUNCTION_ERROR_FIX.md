# 🔴 Fix: "Edge Function returned a non-2xx status code"

## What This Error Means

Your Tink credentials are likely **not set in Supabase's production environment**.

When you added secrets to Supabase dashboard, they might only be set for **local development**, not for the cloud deployment.

---

## 🔧 Solution

### Step 1: Verify Secrets in Supabase Dashboard

1. Go to: https://supabase.com/
2. Login and click your project
3. Go to: Settings → Secrets
4. Check if both are there:
   - ✅ TINK_CLIENT_ID = ••••••••
   - ✅ TINK_CLIENT_SECRET = ••••••••

If **missing**, add them again (follow SUPABASE_SECRETS_EXACT.md).

---

### Step 2: Deploy Edge Functions

If secrets are there, you need to **deploy the functions**:

#### Using Supabase CLI:
```bash
# Navigate to project folder
cd p:\FP Mobility GmbH\Software\Complete_Accounting_Software

# Deploy functions
supabase functions deploy

# You should see:
# ✓ Function deployed successfully: tink-create-link
# ✓ Function deployed successfully: tink-fetch-accounts
# etc.
```

#### Or via Supabase Dashboard:
1. Go to Edge Functions in Supabase dashboard
2. You should see a "Deploy" button
3. Click to deploy latest version

---

### Step 3: Verify Deployment

After deploying:

```bash
# Check function status
supabase functions list

# Should show your functions with status "Active"
```

---

### Step 4: Try Again

After deploying:
1. Go back to Banking page
2. Click "Connect Bank Account" again
3. Should work now! ✅

---

## 🆘 Still Getting Error?

### Check 1: Are Secrets Actually Added?

In terminal, run:
```bash
supabase secrets list
```

Should show:
```
TINK_CLIENT_ID = ****
TINK_CLIENT_SECRET = ****
```

If **missing**: Add them again in Supabase dashboard.

---

### Check 2: Is Function Deployed?

In terminal, run:
```bash
supabase functions list
```

Should show:
```
tink-create-link      (Active)
tink-fetch-accounts   (Active)
tink-sync-all         (Active)
etc.
```

If showing "Inactive": Deploy with `supabase functions deploy`

---

### Check 3: Check Function Logs

To see what error the function is getting:

```bash
# View logs for the function
supabase functions logs tink-create-link

# Or via dashboard:
# Go to Edge Functions → tink-create-link → Logs tab
```

Look for error messages like:
- "Tink credentials missing"
- "Failed to authenticate with Tink"
- "Tink API error"

---

### Check 4: Verify Tink Credentials

Go back to https://console.tink.com/:
1. Login
2. Check your app
3. Verify Client ID and Secret
4. Make sure they're correct (not expired, etc.)

---

## 📋 Troubleshooting Checklist

- [ ] Secrets added to Supabase dashboard (Settings → Secrets)
- [ ] Both TINK_CLIENT_ID and TINK_CLIENT_SECRET present
- [ ] Functions deployed with `supabase functions deploy`
- [ ] Functions show as "Active" in `supabase functions list`
- [ ] Tink credentials are correct and not expired
- [ ] Restarted dev server (`npm run dev`)

---

## 🎯 Quick Fix Summary

**Most likely fix:**
```bash
# In terminal, navigate to project:
cd p:\FP Mobility GmbH\Software\Complete_Accounting_Software

# Deploy functions:
supabase functions deploy

# Restart dev server:
npm run dev

# Try connecting bank again
```

---

## 🚀 After Fixing

1. Go to Banking page
2. Click "Connect Bank Account"
3. Select N26
4. Authorize
5. ✅ Done!

---

## 📞 If Still Stuck

Tell me:
1. Does `supabase secrets list` show both secrets?
2. Does `supabase functions list` show functions as Active?
3. What's in the function logs (`supabase functions logs tink-create-link`)?
4. Any other error messages?

With this info, I can help debug further!
