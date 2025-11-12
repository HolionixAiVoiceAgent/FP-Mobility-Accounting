# Quick Fix: Lexoffice "Nothing Happens" Issue

## The Problem
When you click "Sync to Lexoffice" or toggle the Lexoffice integration, nothing happens. This is usually one of 3 things:

---

## Quick Diagnosis Checklist

### 1. Is Lexoffice Enabled? 🔍
Go to **Settings → Tax Integrations**

Look for the Lexoffice card:
- [ ] Toggle switch is **BLUE/ON**? 
- [ ] API Key field is **FILLED** (shows dots)?

If NO → Follow "Setup Steps" below

### 2. Do You Have Sales Data? 🚗
The Lexoffice sync only includes sales from **the last 30 days**.

- [ ] Have you added any vehicle sales?
- [ ] Are they from the last 30 days?

If NO → Add some test sales first in "Vehicles" section

### 3. Is Your API Key Valid? 🔑
Check if your API key is correct:
- [ ] Did you copy the ENTIRE API key from Lexoffice?
- [ ] No extra spaces before/after?
- [ ] API key hasn't expired?

---

## Setup Steps (5 minutes)

### Step 1: Get Your Lexoffice API Key

1. Go to **https://lexoffice.io** and sign in
2. Click your **profile icon** (top right)
3. Select **"Settings"** or **"API"**
4. Find **"API Access"** or **"API Token"**
5. Click **"Generate"** or copy existing token
6. **Copy the entire key** to clipboard

*Tip: The key will be a long string like: `eyJhbGciOiJIUzI1NiIsInR5...`*

### Step 2: Enter API Key in Your App

1. Go to **Settings** (click Settings in sidebar)
2. Scroll to **"Tax Integrations"** section
3. Find the **Lexoffice** card
4. Click in the **"API Key"** field
5. **Paste** your API key (Ctrl+V or Cmd+V)
6. Click **outside the field** or press Enter
7. Wait for **green "Success"** toast notification

### Step 3: Enable Lexoffice

1. In the **Lexoffice** card
2. Click the **toggle switch** (should turn blue)
3. You should see another **"Success"** toast
4. Optional: Set sync frequency to "Manual" for now

### Step 4: Add Test Sales (if needed)

1. Go to **"Vehicles"** or **"Vehicle Sales"** section
2. Click **"Add Sale"** or **"+ New Sale"**
3. Fill in details:
   - Select a vehicle
   - Enter sale price (e.g., €15,000)
   - Enter customer name
   - Check that sale_date is **today or recent**
4. Click **Save**
5. Repeat 2-3 times if you want multiple test invoices

### Step 5: Test the Sync

1. Go to **Reports** page
2. Look for **"Sync to Lexoffice"** button
3. Click it
4. You should see a **success toast** like:
   ```
   "Lexoffice Sync Complete: Created 3 invoices out of 3 sales"
   ```
5. Log into **Lexoffice dashboard** and verify invoices appeared

---

## What Happens When It Works

### Behind the Scenes:
1. Your app reads your vehicle sales (last 30 days)
2. For each sale, it creates an **invoice in Lexoffice**
3. Invoice includes:
   - Customer name and address
   - Vehicle details (make, model, year, VIN)
   - Sale price with 19% VAT
   - Payment terms (10 days by default)
4. Invoices appear in your Lexoffice dashboard

### In Your App:
- Settings shows "Last synced: [timestamp]"
- Reports page shows sync count
- Lexoffice tab shows "Connected" ✓

---

## Common Issues & Fixes

| Problem | Solution |
|---------|----------|
| **"Nothing Happens" when clicking sync** | Check if toggle is ON and API key is filled |
| **"Sync Failed" error message** | Your API key is wrong. Get a new one from Lexoffice |
| **"No invoices created"** | You don't have sales from last 30 days. Add test sales |
| **"API Key still shows blank"** | Try typing it again, make sure you paste entire key |
| **Browser shows 401 error** | API key is invalid. Regenerate from Lexoffice account |
| **"Contact admin" error** | Your user role might not be "admin". Check with your admin |

---

## Verify It Worked

### In Your App:
1. Go to Settings → Tax Integrations
2. Look at Lexoffice card
3. Should show:
   - ✅ Toggle: ON (blue)
   - ✅ Badge: "Connected" (green)
   - ✅ Last synced: [recent timestamp]

### In Lexoffice:
1. Log into Lexoffice.io
2. Go to "Invoices" or "Documents"
3. Look for newly created invoices with your vehicle sales
4. Each should show customer + vehicle info + price

### Test Sequence:
```
1. Enable Lexoffice ✓
2. Add API Key ✓
3. Toggle ON ✓
4. Click Sync button ✓
5. See success message ✓
6. Check Lexoffice dashboard ✓
→ SUCCESS!
```

---

## Still Not Working?

### Debugging Steps:

**Step A: Check Settings**
1. Go to Settings → Tax Integrations
2. Screenshot the Lexoffice card
3. Verify:
   - Toggle is ON (blue)
   - API Key field shows dots (••••••)
   - Last synced shows a recent date

**Step B: Check Browser Console**
1. Press `F12` to open DevTools
2. Click "Console" tab
3. Click "Sync to Lexoffice" button
4. Look for error messages in red
5. Screenshot any errors

**Step C: Check Database** (Advanced)
1. Go to Supabase dashboard
2. Open "tax_integrations" table
3. Look for a row with `integration_type = 'lexoffice'`
4. Verify:
   - `is_active = true`
   - `api_key` is filled (shows encrypted)
   - `last_sync_at` has a recent timestamp

**Step D: Verify Lexoffice Account**
1. Log into Lexoffice.io
2. Check your API key is still valid
3. Check your account subscription is active
4. Try regenerating a new API key

---

## Key Points

✅ **Both Lexoffice AND Datev are fully implemented in your app**

✅ **No code changes needed - just configuration**

✅ **Lexoffice creates invoices automatically from your sales**

✅ **DATEV exports a CSV for your accountant**

⏱️ **Takes 5 minutes to set up**

---

## Next Steps After Setup

1. **Set up automatic sync**:
   - Go to Settings → Tax Integrations
   - Change Lexoffice "Sync Frequency" from "Manual" to "Daily"

2. **Set up DATEV** (similar process):
   - Enable DATEV toggle
   - Optional: Enter Consultant ID
   - Click "Export to DATEV" in Reports when needed

3. **Monitor**:
   - Regularly check that invoices are syncing
   - Verify "Last synced" timestamp is recent

---

## Still Have Questions?

Check the comprehensive guide: **LEXOFFICE_DATEV_ANALYSIS.md**

Or contact Lexoffice support if:
- Your API key is expired
- You need help creating an API token
- Invoices aren't appearing in your account
