# Tink Bank Integration Setup Guide

## Error: "Tink credentials not configured"

If you're getting an error when trying to connect your N26 bank account, it means the Tink API credentials haven't been configured in your Supabase environment.

---

## ✅ Step-by-Step Setup

### 1️⃣ Get Tink Credentials

You need to create a Tink developer account and register an application:

1. Go to **https://console.tink.com/**
2. Sign up for a developer account (free)
3. Create a new application
4. Once created, you'll get:
   - **Client ID** - Save this
   - **Client Secret** - Save this (keep it secret!)

### 2️⃣ Add Credentials to Supabase

Now add these credentials to your Supabase project's environment variables:

#### Option A: Using Supabase Dashboard

1. Go to **https://supabase.com** → Your Project
2. Navigate to **Settings → Environment variables** (or **Secrets**)
3. Add two new variables:
   - **Name:** `TINK_CLIENT_ID` → **Value:** `your_client_id_here`
   - **Name:** `TINK_CLIENT_SECRET` → **Value:** `your_client_secret_here`
4. Save/Apply

#### Option B: Using Supabase CLI (Local)

```bash
# In your project directory
supabase secrets set TINK_CLIENT_ID=your_client_id_here
supabase secrets set TINK_CLIENT_SECRET=your_client_secret_here
```

### 3️⃣ Configure Tink Settings

In the Tink Console (https://console.tink.com/):

1. Go to your application settings
2. Set **Redirect URI** to:
   ```
   https://yourdomain.com/bank
   ```
   (If local/testing: `http://localhost:8080/bank`)

3. Under **Markets**, make sure **Germany (DE)** is enabled (since you use N26)
4. Under **Capabilities**, enable:
   - ✅ Account Information Service (AIS)
   - ✅ Payment Initiation Service (PIS) - if you want payment functionality
   - ✅ PSD2 Strong Customer Authentication

### 4️⃣ Test the Connection

1. Restart your Supabase Edge Functions:
   ```bash
   supabase functions serve
   ```

2. In your app, go to **Banking** page
3. Click **"Connect Bank Account"**
4. You should see the Tink Link UI
5. Select **N26** as your bank
6. Authorize the connection
7. Done! Your N26 accounts should now be connected

---

## 🔍 Supported Banks

Tink supports 3,000+ banks in Europe. N26 is fully supported because it's a PSD2-compliant bank.

### For N26 Specifically:
- ✅ Fully supported via PSD2
- ✅ Real-time transaction sync
- ✅ Account balance updates
- ✅ Multi-currency support

---

## 🆘 Troubleshooting

### Error: "Failed to authenticate with Tink"
- **Cause:** Client ID or Secret is incorrect
- **Fix:** Double-check credentials in Supabase and Tink Console

### Error: "Failed to create authorization grant"
- **Cause:** Market not enabled or redirect URI mismatch
- **Fix:** Verify Germany (DE) market is enabled in Tink Console

### Error: "Unauthorized" when clicking Connect
- **Cause:** You're not logged into the app
- **Fix:** Log in first, then try connecting bank

### Redirect Loop After Authorization
- **Cause:** Redirect URI doesn't match in Tink Console
- **Fix:** Ensure Tink Console redirect URI matches your app URL exactly

### N26 Not Showing in Bank List
- **Cause:** Germany market not enabled
- **Fix:** Go to Tink Console → Application Settings → Markets → Enable **Germany**

---

## 📱 What Happens After Connection?

Once connected:

1. **Initial Sync**: All transactions from last 90 days are imported
2. **Automatic Updates**: New transactions sync every 30 minutes
3. **Data Stored**: Accounts and transactions saved in `tink_accounts` and `bank_transactions` tables
4. **Dashboard**: Your account balance and recent transactions appear in the Banking section

---

## 🔐 Security Notes

- ✅ Tink uses OAuth 2.0 and PSD2 Strong Customer Authentication (SCA)
- ✅ Your login credentials are NEVER stored - only access tokens
- ✅ Credentials transmitted via secure HTTPS only
- ✅ Customer data encrypted at rest in Supabase
- ✅ Row-level security (RLS) policies enforce data isolation

---

## 📞 Need Help?

### Check Logs
```bash
# View Edge Function logs
supabase functions logs tink-create-link

# In browser console (F12)
# Check for error messages
```

### Verify Setup
```bash
# Check if credentials are set
supabase secrets list

# Should show:
# TINK_CLIENT_ID = ****
# TINK_CLIENT_SECRET = ****
```

### Test Endpoint
```bash
# Test the function directly
curl -X POST http://localhost:54321/functions/v1/tink-create-link \
  -H "Authorization: Bearer <your_token>"
```

---

## ✨ What's Next?

After connecting your bank:

1. **View Transactions** - See all imported transactions in Banking section
2. **Sync All Banks** - Click "Sync All Banks" to fetch latest data
3. **Use in Reports** - Transactions are now available for financial reports
4. **Export Data** - Export transaction data for accounting software

---

## Helpful Links

- 📚 **Tink Documentation**: https://docs.tink.com/
- 🔗 **Tink Console**: https://console.tink.com/
- 🏦 **Supported Banks**: https://tink.com/en/bank-coverage
- 📖 **PSD2 Info**: https://www.european-banking-authority.europa.eu/banking-topics/payment-services-directive-psd2_en

---

**Status:** You're now ready to connect your N26 account! 🎉
