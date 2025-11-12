# 🏦 Tink Bank Integration - Quick Setup

## 🔴 Error When Connecting Bank?

Your Tink API credentials aren't configured. Follow these 5 steps:

---

## ⚡ Quick Setup (5 Minutes)

### Step 1: Get Credentials
1. Go to **https://console.tink.com/**
2. Sign up (free)
3. Create new application
4. Copy **Client ID** and **Client Secret**

### Step 2: Add to Supabase
1. Go to **Supabase Dashboard** → Your Project
2. **Settings → Secrets** (or Environment variables)
3. Add two secrets:
   ```
   TINK_CLIENT_ID = your_client_id
   TINK_CLIENT_SECRET = your_client_secret
   ```
4. Save

### Step 3: Configure Tink
In Tink Console (https://console.tink.com/):
- Set **Redirect URI**: `http://localhost:8080/bank` (or your domain)
- Enable **Germany** market (for N26)
- Enable **Account Information** capability

### Step 4: Restart Dev Server
```bash
npm run dev
```

### Step 5: Try Again
- Go to **Banking** page
- Click **"Connect Bank Account"**
- Select N26
- Authorize

**Done!** ✅

---

## 📋 Checklist

- [ ] Created Tink developer account at console.tink.com
- [ ] Got Client ID and Secret
- [ ] Added to Supabase Secrets (TINK_CLIENT_ID & TINK_CLIENT_SECRET)
- [ ] Configured redirect URI in Tink Console
- [ ] Enabled Germany market in Tink Console
- [ ] Restarted dev server
- [ ] Tried connecting bank again

---

## ❓ Still Not Working?

Read **TINK_SETUP_GUIDE.md** for detailed troubleshooting:
- Authorization errors
- Bank not showing in list
- Redirect loop issues
- Credential verification

---

## ✨ After Setup Works

Once connected, you can:
- View all N26 transactions automatically
- Sync transactions on demand
- Use data in financial reports
- Export transaction history

---

**Need Tink docs?** → https://docs.tink.com/
