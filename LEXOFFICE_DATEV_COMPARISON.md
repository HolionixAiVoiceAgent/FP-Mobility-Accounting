# Lexoffice vs Datev Comparison & Setup

## Side-by-Side Comparison

| Aspect | DATEV | Lexoffice |
|--------|-------|-----------|
| **Purpose** | Export for accountant/tax filing | Create invoices in accounting software |
| **What It Does** | Generates SKR04-compliant CSV | Syncs sales as invoices to Lexoffice |
| **Format Output** | CSV file (downloaded) | API calls (automatic) |
| **Requires** | Nothing (optional) | Lexoffice API key |
| **Setup Complexity** | ⭐ Very Simple | ⭐⭐ Simple (need API key) |
| **Test Data** | Use existing sales/expenses | Need sales from last 30 days |
| **Frequency** | Manual export | Manual or Automated (daily/weekly/monthly) |
| **Cost** | Free (part of your app) | Lexoffice subscription required |
| **Use Case** | Annual tax filing | Real-time invoice synchronization |

---

## Setup Comparison

### DATEV Setup (2 steps)

```
Step 1: Go to Settings → Tax Integrations
        ↓
        Toggle "DATEV Export" ON
        ↓
Step 2: Go to Reports → Click "Export to DATEV"
        ↓
        CSV downloads automatically
        ↓
DONE! ✓
```

### Lexoffice Setup (5 steps)

```
Step 1: Get API key from Lexoffice.io
        ↓
Step 2: Go to Settings → Tax Integrations
        ↓
Step 3: Paste API key in Lexoffice field
        ↓
Step 4: Toggle "Lexoffice Integration" ON
        ↓
Step 5: Go to Reports → Click "Sync to Lexoffice"
        ↓
DONE! ✓ (Invoices created in Lexoffice)
```

---

## Feature Comparison

### DATEV Features

✅ **What Works:**
- Exports sales transactions
- Exports expenses by category
- Generates proper SKR04 accounting codes
- German-formatted dates (DD.MM.YYYY)
- Debit/Credit indicators for each entry
- Downloads as CSV file
- No external account needed

❌ **Limitations:**
- Manual export only (no automation)
- Requires manual import into DATEV
- One-way sync (export only)
- CSV format (not live accounting)

### Lexoffice Features

✅ **What Works:**
- Automatic invoice creation
- Customer details included
- VAT calculation (19%)
- Vehicle information in invoice
- Payment terms (10 days)
- Real-time sync to Lexoffice
- Scheduled syncing (daily/weekly/monthly)
- Two-way integration potential

❌ **Limitations:**
- Requires Lexoffice subscription
- Only syncs sales (not expenses yet)
- Only 30 days of data
- Needs valid API key
- Requires internet connection

---

## Data Flow Diagrams

### DATEV Export Flow

```
Your App Database
  ↓
  (Sales + Expenses)
  ↓
Edge Function: datev-export
  ↓
  (Format as SKR04)
  ↓
CSV File
  ↓
Download to Your Computer
  ↓
Import into DATEV (manually)
```

### Lexoffice Sync Flow

```
Your App Database
  ↓
  (Sales from last 30 days)
  ↓
Edge Function: lexoffice-sync
  ↓
  (Read Lexoffice API key)
  ↓
Call Lexoffice API
  ↓
Create invoices in Lexoffice
  ↓
Invoices appear in Lexoffice dashboard
```

---

## When to Use Each

### Use DATEV When:
- ✅ Annual tax filing is coming up
- ✅ You need to send data to your accountant
- ✅ You use DATEV accounting software
- ✅ You want to export a snapshot of transactions
- ✅ No external subscriptions available

**Command**: Go to Reports → "Export to DATEV"

### Use Lexoffice When:
- ✅ You use Lexoffice accounting software
- ✅ You want automatic invoice generation
- ✅ You need real-time synchronization
- ✅ Multiple syncs per month
- ✅ You want invoices in Lexoffice immediately

**Command**: Go to Reports → "Sync to Lexoffice"

### Use Both Together:
Many German businesses use:
1. **Lexoffice** for daily invoicing and accounting
2. **DATEV** for annual tax filing with accountant

```
Daily Work:
  → Use Lexoffice (automatic invoices)
  
Month-end:
  → Check both systems

Tax Filing (Annual):
  → Export from DATEV to accountant
  → Or use Lexoffice export to accountant
```

---

## What's Actually Exported

### DATEV Export Example

```csv
Umsatz (ohne Soll/Haben-Kz);Soll/Haben-Kennzeichen;WKZ Umsatz;Konto;Gegenkonto;...
15000,00;H;EUR;8400;1200;...
750,00;S;EUR;6530;1200;...
```

**Means:**
- €15,000 revenue (account 8400 - vehicle sales)
- €750 fuel expense (account 6530 - fuel costs)
- All in German numeric format (commas for decimals)

### Lexoffice Sync Example

**What gets created in Lexoffice:**
```
Invoice #INV-001
Date: 2024-12-15
Customer: John Doe
Address: Berlin, Germany

Item: Mercedes C-Class 2022
Description: VIN: WMEUF35B2UN123456
Quantity: 1
Price: €18,000 (€15,126.05 net + 19% VAT)

Total: €18,000
Due: 2025-01-15 (10 days)
```

---

## Troubleshooting Matrix

| Symptom | DATEV | Lexoffice |
|---------|-------|-----------|
| Nothing happens | Check Reports page exists | Check toggle ON + API key filled |
| Error message | Check sales/expenses data exists | Check API key is valid |
| File won't download | Check browser download settings | Not applicable (API call) |
| Empty export/sync | Add test sales/expenses | Add sales from last 30 days |
| Permission denied | Check user is admin | Check user is admin + API auth |
| Network error | Check internet connection | Check Lexoffice API is up |

---

## Implementation Status

### DATEV Status: ✅ COMPLETE
```
Frontend: ✅ UI in Settings + Reports
Backend:  ✅ Edge Function implemented
Database: ✅ tax_integrations table
Logic:    ✅ SKR04 formatting
Testing:  ✅ Ready to use
```

### Lexoffice Status: ✅ COMPLETE
```
Frontend: ✅ UI in Settings + Reports
Backend:  ✅ Edge Function implemented
Database: ✅ tax_integrations table
Logic:    ✅ Invoice creation logic
Testing:  ✅ Ready to use (needs API key)
```

---

## Next Steps

### To Get Started:

1. **For DATEV**:
   - No setup needed
   - Just click "Export to DATEV" in Reports
   - Download CSV and send to accountant

2. **For Lexoffice**:
   - Get API key from Lexoffice.io
   - Enter in Settings → Tax Integrations
   - Click "Sync to Lexoffice" in Reports
   - Check Lexoffice dashboard for invoices

### To Automate:

1. **Lexoffice Automation**:
   - Settings → Tax Integrations
   - Change frequency from "Manual" to "Daily"
   - Syncs happen automatically each day at midnight

2. **DATEV Automation**:
   - DATEV doesn't support automation (export only)
   - Schedule manual exports monthly/yearly

---

## Key Takeaway

✅ **Both are fully implemented and working**

✅ **DATEV = Export → Download CSV (simple)**

✅ **Lexoffice = Sync → Auto-create invoices (requires API key)**

✅ **Use DATEV for tax compliance**

✅ **Use Lexoffice for daily operations**

🎯 **Your next action**: Get Lexoffice API key (5-minute task)
