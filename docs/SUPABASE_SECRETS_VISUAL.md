# Adding Tink Credentials to Supabase - Visual Guide

## 🎬 Video Guide (Step-by-Step)

I'll walk you through exactly where to click, using descriptions and reference points.

---

## PART 1: Get Your Tink Credentials First

### Step A: Go to Tink Console
```
1. Open browser
2. Go to: https://console.tink.com/
3. Sign in with your account
4. You should see a dashboard
```

### Step B: Copy Client ID
```
In Tink Console:
1. Look for "Applications" or "API Credentials" 
2. Find your application
3. You'll see:
   - Application Name
   - Client ID ← COPY THIS
   - Client Secret ← COPY THIS NEXT

4. Click the copy icon (📋) next to "Client ID"
5. Paste it somewhere safe (Notepad)
```

### Step C: Copy Client Secret
```
1. Next to "Client Secret", click the copy icon (📋)
2. Paste it somewhere safe (Notepad)

⚠️ KEEP THESE SECRET - Don't share them!

You now have:
- Client ID: abc123def456...
- Client Secret: xyz789qwe456...
```

**✅ Done with Tink Console!**

---

## PART 2: Add to Supabase

### Step 1: Open Supabase Dashboard
```
1. Open a new browser tab
2. Go to: https://supabase.com/
3. At the top right, click "Sign In"
4. Login with your Supabase account
5. You'll see your projects listed
```

### Step 2: Click Your Project
```
You should see a list of projects like:

┌──────────────────────────────────────┐
│ 📦 Complete_Accounting_Software      │
│ 📦 My Other Project                  │
│ 📦 Test Project                      │
└──────────────────────────────────────┘

Click on: "Complete_Accounting_Software"
(or whatever your project is called)
```

### Step 3: Go to Settings
```
After clicking your project, you should see:

┌─────────────────────────────┐
│ LEFT SIDEBAR:               │
│                             │
│ Dashboard        ← Click    │
│ SQL Editor       ← Don't    │
│ Database         ← Don't    │
│ Authentication   ← Don't    │
│ Edge Functions   ← Don't    │
│ Webhooks         ← Don't    │
│ API Docs         ← Don't    │
│                             │
│ ⚙️  Settings     ← CLICK HERE!
└─────────────────────────────┘

Scroll DOWN in the left sidebar if you don't see Settings.
It's usually at the BOTTOM of the menu.
```

**⚠️ IMPORTANT:** Make sure you click on "Settings" (the gear icon ⚙️), not anything else.

### Step 4: Navigate to Secrets/Environment
```
After clicking Settings, you'll see a main area with tabs:

┌──────────────────────────────────────────┐
│ [General] [API] [Secrets] [Other...]     │
│                                          │
│ (main content area below)                │
└──────────────────────────────────────────┘

Look for a tab called:
- "Secrets" ← CLICK THIS
- OR "Environment"  
- OR "Environment Variables"

Click on it.
```

If you don't see "Secrets":
- Try clicking "API" tab first
- Scroll down on the page
- Look for a section titled "Secrets" or "Custom Env Variables"

### Step 5: Add First Secret

```
Once you're in the Secrets section, look for:

[+ New Variable] or [+ Add Secret] button
(usually blue, on the right side)

Click it.

A form will appear:

╔════════════════════════════════════╗
║ Add Environment Variable           ║
╠════════════════════════════════════╣
║ Name:  [____________________]      ║
║        (This is where you type)    ║
║                                    ║
║ Value: [____________________]      ║
║        (This is where you paste)   ║
║                                    ║
║                    [Cancel] [Save] ║
╚════════════════════════════════════╝

Step 5A: In the "Name" field, type:
         TINK_CLIENT_ID
         (exactly as shown, with underscores)

Step 5B: Click in the "Value" field

Step 5C: Right-click and paste your Client ID from Tink
         (or Ctrl+V / Cmd+V)
         Example: abc123def456xyz789...

Step 5D: Click the [Save] button
         (or [Add] or [Create])
```

**✅ First secret added!**

### Step 6: Add Second Secret

```
Repeat the same process:

Click [+ New Variable] again

In the form that appears:

Name:  TINK_CLIENT_SECRET
       (type exactly as shown)

Value: (paste your Client Secret from Tink)
       Example: xyz789qwe456abc123...

Click [Save]
```

**✅ Both secrets added!**

### Step 7: Verify They're Added

```
You should now see in the Secrets section:

✓ TINK_CLIENT_ID     = ••••••••••••••••
✓ TINK_CLIENT_SECRET = ••••••••••••••••

(The values are hidden for security)

If you see both, you're done!
```

---

## PART 3: Restart Your App

### Step 1: Stop Dev Server
```
In your PowerShell terminal:

Press: Ctrl + C

(This stops the currently running dev server)
```

### Step 2: Restart Dev Server
```
In PowerShell, type:

npm run dev

Press Enter

You should see:
  ✓ Vite ready in XXX ms
  ➜ Local: http://localhost:8080/
```

---

## PART 4: Test Bank Connection

### Step 1: Open Your App
```
1. Go to http://localhost:8080/
2. Login if needed
3. Navigate to "Banking" page (in the menu)
```

### Step 2: Click "Connect Bank Account"
```
You should see a blue button that says:
[🔗 Connect Bank Account]

Click it.

(If it says "Tink credentials not configured", 
 the secrets weren't added correctly. Try again.)
```

### Step 3: Select N26
```
A Tink Link window will open showing banks.

Type: N26

Select N26 from the list.

Click Continue.
```

### Step 4: Authorize
```
You'll be asked to login to N26.

Login with your N26 credentials.

Authorize access to your accounts.

You'll be redirected back to your app.
```

### Step 5: Done!
```
Your N26 accounts are now connected!

You should see:
- Your account balance
- Recent transactions
- A list of connected accounts
```

---

## 🆘 Troubleshooting

### Problem 1: "I can't find Settings"
```
Solution:
- Make sure you clicked on your project first
- Look in the LEFT sidebar
- Scroll down if you don't see it
- It should have a gear icon (⚙️)
```

### Problem 2: "I don't see a Secrets tab"
```
Solution:
- Look for these tabs: General, API, Secrets, etc.
- Click "API" first
- Scroll down to find "Secrets" section
- If still missing, you might be in the wrong place
  (go back to Step 3 and try again)
```

### Problem 3: "The + New Variable button is missing"
```
Solution:
- Scroll down on the page
- The button might be below the visible area
- Look for a blue button on the right side
- Or look for an "Edit" button to enable editing
```

### Problem 4: "I still get 'Tink credentials not configured'"
```
Solution:
1. Verify the names are EXACTLY:
   - TINK_CLIENT_ID (not TINK_ID)
   - TINK_CLIENT_SECRET (not TINK_SECRET)

2. Verify the values are correct:
   - Copy again from Tink Console
   - Make sure no extra spaces
   - Paste carefully

3. Restart dev server:
   - Press Ctrl+C to stop
   - Type: npm run dev
   - Press Enter

4. Try again:
   - Go to Banking page
   - Click Connect Bank Account
```

### Problem 5: "Bank connection started but nothing happens"
```
Solution:
1. Make sure you're using http://localhost:8080/bank
   as the redirect URI in Tink Console

2. Check browser console (F12):
   - Look for error messages
   - Screenshot the error
```

---

## 📋 Summary Checklist

- [ ] I have my Tink Client ID (from Tink Console)
- [ ] I have my Tink Client Secret (from Tink Console)
- [ ] I opened Supabase dashboard
- [ ] I clicked my project
- [ ] I went to Settings
- [ ] I found the Secrets section
- [ ] I added TINK_CLIENT_ID
- [ ] I added TINK_CLIENT_SECRET
- [ ] I restarted my dev server (npm run dev)
- [ ] I tried connecting bank again
- [ ] It worked! ✅

---

## 💡 Tips & Tricks

### Tip 1: Finding Your Credentials Again
```
If you need to find your credentials later:
1. Go to https://console.tink.com/
2. Login
3. Look for "Applications" 
4. Click your app
5. Copy ID and Secret again
```

### Tip 2: Resetting Credentials
```
If you want to change credentials:
1. In Supabase Settings → Secrets
2. Click the X button next to the variable
3. Confirm deletion
4. Click + New Variable again
5. Add the new values
```

### Tip 3: Testing Without Browser
```
You can verify secrets are set using CLI:
  supabase secrets list

Should show:
  TINK_CLIENT_ID = ****
  TINK_CLIENT_SECRET = ****
```

---

**You're all set! Let me know if you get stuck at any step.** 🎉
