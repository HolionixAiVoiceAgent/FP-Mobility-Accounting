# How to Add Tink Credentials to Supabase - Step by Step

## 📍 Before You Start

You should have:
- ✅ Tink Console open (https://console.tink.com/)
- ✅ Your **Client ID** copied
- ✅ Your **Client Secret** copied
- ✅ Supabase project access

---

## 🎯 Method 1: Using Supabase Web Dashboard (EASIEST)

### Step 1: Open Supabase Dashboard
```
1. Go to https://supabase.com/
2. Click "Sign In" (top right)
3. Login with your account
4. You should see your projects listed
5. Click on your project name (Complete_Accounting_Software)
```

### Step 2: Navigate to Project Settings
```
After clicking your project:

1. Look at the LEFT SIDEBAR
2. Scroll down to find "Settings" 
3. Click on "Settings" (gear icon)
```

📸 **Visual:** The Settings option is at the bottom of the left sidebar, below all other options.

---

### Step 3: Find Environment Variables / Secrets Section

In Settings page:

```
1. Click on "Configuration" (or "Environment")
   - Location: Look for tabs at the top of the Settings page
   
2. Look for "Local Development" or "Environment Variables" section
   
3. Scroll down to find the section labeled:
   - "Environment variables"
   - OR "Secrets"
   - OR "Custom Env Variables"
```

If you can't find it easily:
- Click the **"API"** tab in Settings
- Scroll down to find "Environment" or "Secrets" section

---

### Step 4: Add First Secret (TINK_CLIENT_ID)

```
In the Secrets/Environment Variables section:

1. Click the "+ New Variable" button 
   (usually blue button on the right)

2. A form will appear with two fields:
   ┌─────────────────────────┐
   │ Name: [_____________]   │
   │ Value: [_____________]  │
   └─────────────────────────┘

3. In the "Name" field, type exactly:
   TINK_CLIENT_ID

4. In the "Value" field, paste your Client ID from Tink Console
   (copy from: https://console.tink.com/ → Your App → Client ID)

5. Click "Save" or "Add" button
```

✅ **First secret added!**

---

### Step 5: Add Second Secret (TINK_CLIENT_SECRET)

```
Repeat the process:

1. Click "+ New Variable" again

2. In the "Name" field, type exactly:
   TINK_CLIENT_SECRET

3. In the "Value" field, paste your Client Secret from Tink
   (copy from: https://console.tink.com/ → Your App → Client Secret)

4. Click "Save" or "Add" button
```

✅ **Both secrets added!**

---

## 🎯 Method 2: Using Supabase CLI (If You Have It Installed)

If you have the Supabase CLI set up locally:

```bash
# Open your terminal/PowerShell in the project folder
cd p:\FP Mobility GmbH\Software\Complete_Accounting_Software

# Set the Tink Client ID
supabase secrets set TINK_CLIENT_ID=your_actual_client_id_here

# Set the Tink Client Secret  
supabase secrets set TINK_CLIENT_SECRET=your_actual_client_secret_here

# Verify they were added
supabase secrets list
```

**Output should show:**
```
TINK_CLIENT_ID = ****
TINK_CLIENT_SECRET = ****
```

---

## 📸 Screenshots / Where to Find Each Step

### If you're in the wrong place:

**❌ WRONG:** You're in "Database" or "SQL Editor"
- Click "Settings" in the left sidebar instead

**❌ WRONG:** You're in "Authentication" settings
- Go to main "Settings" first, then find "Secrets"

**✅ CORRECT:** You should see:
- Left sidebar with "Settings" (gear icon)
- Main area showing configuration options
- Section with "Environment variables" or "Secrets"

---

## 🔐 Security Reminder

When you paste your Client Secret:
- ⚠️ DO NOT share it with anyone
- ⚠️ DO NOT commit it to Git
- ⚠️ DO NOT paste it in public chats
- ✅ It's safe to paste here in Supabase dashboard (it's encrypted)

---

## ✅ Verify It Worked

### Via Supabase Dashboard:
1. Go back to Settings → Secrets
2. You should see both variables listed:
   - `TINK_CLIENT_ID` = (value hidden)
   - `TINK_CLIENT_SECRET` = (value hidden)

### Via Supabase CLI:
```bash
supabase secrets list
```

Should show both variables present.

---

## 🎉 Next Steps

Once secrets are added:

1. **Restart your dev server:**
   ```bash
   npm run dev
   ```

2. **Go to Banking page** in your app

3. **Click "Connect Bank Account"**

4. **Select N26** from the bank list

5. **Authorize** the connection

6. **Done!** Your N26 accounts are now connected

---

## ❓ What If I Still Can't Find It?

### In Supabase, look for:
- ⚙️ Settings (gear icon)
- 🔒 Secrets, Environment Variables, or Configuration
- 📝 Local Development, Production, or Custom Environment section

### Alternative: Contact Supabase Support
- Go to https://supabase.com/docs/guides/local-development/env-variables
- Or ask Supabase support (? icon in dashboard)

---

## 🆘 Troubleshooting

### "I can't find Settings"
- Click your project name at the top
- Look for ⚙️ icon in the left sidebar
- Or look at the top-right of your screen for a menu

### "I don't see Secrets section"
- You might be in the wrong tab
- Look for tabs like: API, Secrets, Environment, Configuration
- Click each tab until you find the secrets section

### "There's no + button to add"
- Scroll down on the page
- The button might be below the visible area
- Or look for an "Edit" button to enable editing

---

## 📋 Checklist

- [ ] Opened Supabase dashboard
- [ ] Went to Project Settings
- [ ] Found Secrets/Environment Variables section
- [ ] Added TINK_CLIENT_ID
- [ ] Added TINK_CLIENT_SECRET
- [ ] Verified both variables are listed
- [ ] Restarted dev server (`npm run dev`)
- [ ] Tried connecting bank again

---

## 🎯 Quick Reference

| Step | Action | Details |
|------|--------|---------|
| 1 | Go to Supabase | https://supabase.com/ |
| 2 | Open Your Project | Click your project name |
| 3 | Click Settings | Left sidebar, gear icon |
| 4 | Find Secrets | Look for "Secrets" or "Environment" section |
| 5 | Add TINK_CLIENT_ID | Name: `TINK_CLIENT_ID`, Value: your_id |
| 6 | Add TINK_CLIENT_SECRET | Name: `TINK_CLIENT_SECRET`, Value: your_secret |
| 7 | Save Both | Click Save/Add for each |
| 8 | Restart Dev | Run `npm run dev` |
| 9 | Test Bank Connect | Go to Banking page, click "Connect" |

---

**Still stuck? Screenshot the page and I'll help guide you!** 📸
