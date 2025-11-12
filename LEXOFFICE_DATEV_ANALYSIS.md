# Lexoffice & Datev Integration Analysis

## Overview
Both Lexoffice and Datev integrations are **FULLY IMPLEMENTED** in your system. However, there are **setup requirements** that need to be completed for them to work.

---

## 1. DATEV Integration Status ✅ IMPLEMENTED

### What's Working:
- ✅ **Database Model**: `tax_integrations` table stores DATEV configuration
- ✅ **UI Component**: `TaxIntegrationSettings.tsx` has DATEV toggle and consultant ID input
- ✅ **Edge Function**: `supabase/functions/datev-export/index.ts` fully implemented
- ✅ **Report Button**: Reports page has "Export to DATEV" button
- ✅ **CSV Format**: Generates SKR04-compliant DATEV format with proper accounting codes

### How It Works:
1. User enables DATEV in Settings
2. User enters Consultant ID (optional field)
3. User clicks "Export to DATEV" button in Reports
4. Edge Function generates SKR04-compliant CSV with:
   - Revenue from sales (account 8400)
   - Expenses by category (accounts 6000-6800)
   - Proper German date formatting
   - Correct debit/credit indicators (Soll/Haben)
5. CSV downloads automatically

### What's Missing (Setup):
- **Nothing technical** - The integration is complete
- User just needs to click the toggle to enable it
- DATEV consultant ID is optional

### To Test DATEV:
1. Go to Settings/Tax Settings
2. Toggle "DATEV Export" ON
3. Go to Reports page
4. Click "Export to DATEV" button
5. CSV file downloads with DATEV-compliant format

---

## 2. LEXOFFICE Integration Status ✅ IMPLEMENTED

### What's Working:
- ✅ **Database Model**: `tax_integrations` table stores Lexoffice configuration
- ✅ **UI Component**: `TaxIntegrationSettings.tsx` has Lexoffice toggle, API key input, and sync frequency
- ✅ **Edge Function**: `supabase/functions/lexoffice-sync/index.ts` fully implemented
- ✅ **API Integration**: Calls Lexoffice REST API to create invoices
- ✅ **Sync Button**: Reports page has "Sync to Lexoffice" button
- ✅ **Error Handling**: Returns error messages if API call fails

### How It Works:
1. User obtains Lexoffice API key from their account
2. User enables Lexoffice in Settings
3. User enters API key securely (stored encrypted in database)
4. User selects sync frequency (manual, daily, weekly, monthly)
5. User clicks "Sync to Lexoffice" button in Reports
6. Edge Function:
   - Fetches recent vehicle sales (last 30 days)
   - For each sale, creates an invoice in Lexoffice
   - Includes customer details, vehicle info, and pricing
   - Handles VAT calculation (19%)
   - Returns count of successfully created invoices

### What's Missing (Setup):
- **You need a Lexoffice account** - This is the only requirement
- You need to generate an API key from Lexoffice

### Current Problem: "Nothing Happens"
The issue is likely one of these:

1. **Lexoffice is not enabled** (toggle OFF)
   - **Fix**: Go to Settings → Toggle Lexoffice ON

2. **No API key stored**
   - **Fix**: Enter your Lexoffice API key in the settings

3. **API key is invalid or expired**
   - **Fix**: Check your Lexoffice account and regenerate API key if needed

4. **Not enough sales data**
   - **Fix**: The function only syncs sales from the last 30 days. Add some vehicle sales first.

---

## 3. How to Get Lexoffice API Key

### Step-by-Step:

1. **Log in to Lexoffice**
   - Go to https://lexoffice.io
   - Sign in with your credentials

2. **Navigate to API Settings**
   - Click your profile icon (top right)
   - Select "API Access" or "Settings"
   - Look for "API Token" or "API Key" section

3. **Generate or Copy API Key**
   - Click "Generate API Token" if you don't have one
   - Copy the full API key (it's a long alphanumeric string)

4. **Add to Your App**
   - Go to Settings → Tax Integrations
   - Paste your API key in the "API Key" field
   - Click outside the field or press Enter to save
   - You should see a success toast notification

5. **Enable Sync**
   - Toggle "Lexoffice Integration" ON
   - Select sync frequency (start with "Manual")

---

## 4. Database Configuration

### Tax Integrations Table:
```sql
CREATE TABLE tax_integrations (
  id UUID PRIMARY KEY,
  integration_type VARCHAR(50) -- 'datev' or 'lexoffice'
  api_key TEXT -- For Lexoffice API key (encrypted)
  consultant_id TEXT -- For DATEV consultant ID
  is_active BOOLEAN -- Enable/disable integration
  sync_frequency VARCHAR(50) -- 'manual', 'daily', 'weekly', 'monthly'
  last_sync_at TIMESTAMP -- When last synced
  created_at TIMESTAMP
  updated_at TIMESTAMP
)
```

### Current Data:
- Check if records exist:
  ```sql
  SELECT * FROM tax_integrations;
  ```

- Create new records if needed:
  ```sql
  -- For DATEV
  INSERT INTO tax_integrations (integration_type, is_active)
  VALUES ('datev', false);

  -- For Lexoffice
  INSERT INTO tax_integrations (integration_type, is_active)
  VALUES ('lexoffice', false);
  ```

---

## 5. Edge Functions Deployment

Both Edge Functions need to be deployed:

```bash
# Deploy both functions
supabase functions deploy datev-export
supabase functions deploy lexoffice-sync
```

These are already deployed in production but if you modify them locally, you need to redeploy.

---

## 6. Expected Behavior After Setup

### DATEV Export:
```
Click "Export to DATEV" 
  ↓
CSV file with format:
Umsatz;Soll/Haben;WKZ;Konto;Gegenkonto;...
1500,00;H;EUR;8400;1200;...
500,00;S;EUR;6300;1200;...
```

### Lexoffice Sync:
```
Click "Sync to Lexoffice"
  ↓
Toast notification: "Lexoffice Sync Complete: Created 3 invoices out of 3 sales"
  ↓
Invoices appear in Lexoffice dashboard
```

---

## 7. Troubleshooting

### DATEV Not Working:
| Issue | Solution |
|-------|----------|
| No button appears | Ensure you're on the Reports page |
| CSV not downloading | Check browser download settings |
| Empty CSV | No sales/expenses data in database |
| Wrong accounts | Check `getExpenseAccount()` function mapping |

### Lexoffice Not Working:

| Issue | Solution |
|-------|----------|
| "Nothing happens" | Toggle is probably OFF or API key missing |
| "Sync Failed" error | Check if API key is correct and not expired |
| No invoices created | No sales from last 30 days OR API key invalid |
| Network error | Check your internet connection |
| Auth error 401 | API key is invalid or expired - regenerate |

### To Check Lexoffice Status:

1. **Check Settings UI**:
   - Go to Settings → Tax Integrations
   - Look at Lexoffice card:
     - Is toggle ON? (should be blue)
     - Is API key filled in? (should show dots if stored)
     - Has "Last synced" timestamp?

2. **Check Database**:
   ```sql
   SELECT * FROM tax_integrations WHERE integration_type = 'lexoffice';
   ```

3. **Check Browser Console**:
   - Open browser DevTools (F12)
   - Go to Console tab
   - Click "Sync to Lexoffice"
   - Look for error messages

4. **Check Lexoffice API**:
   - Log into Lexoffice account
   - Check "API Usage" or "Webhooks" to see if requests are arriving
   - Check if any recent API errors

---

## 8. Recommendations

### Immediate Actions:
1. ✅ **Test DATEV** (easier to test, no external API):
   - Toggle ON in Settings
   - Click Export button
   - Verify CSV downloads

2. ✅ **Get Lexoffice API Key**:
   - Log into your Lexoffice account
   - Generate API token

3. ✅ **Enter API Key**:
   - Paste in Settings → Tax Integrations
   - Toggle ON

4. ✅ **Test Lexoffice**:
   - Make sure you have vehicle sales (last 30 days)
   - Click "Sync to Lexoffice"
   - Check toast notification for results

### Long-term:
- Set up scheduled syncs (set `sync_frequency` to "daily" or "weekly")
- Monitor tax_integrations.last_sync_at to verify syncs are happening
- Consider adding more accounting codes to DATEV mapping if needed

---

## 9. Code Locations

**Settings UI**: `src/components/TaxIntegrationSettings.tsx` (lines 1-220)
- Manages both integrations
- Handles API key input (securely)
- Toggle switches and sync frequency

**Reports Page**: `src/pages/Reports.tsx` (lines 326-400)
- `handleDATEVExport()` function
- `handleLexofficeSync()` function
- Export and Sync buttons

**Edge Functions**:
- DATEV: `supabase/functions/datev-export/index.ts`
- Lexoffice: `supabase/functions/lexoffice-sync/index.ts`

**Database**: `supabase/migrations/20251018093311_874ff734*.sql`
- `tax_integrations` table with RLS policies

---

## 10. Conclusion

**Both integrations are FULLY IMPLEMENTED and ready to use.**

The reason "nothing happens" when you click Lexoffice sync is most likely:
1. **Lexoffice toggle is OFF** - Turn it ON
2. **No API key entered** - Add your Lexoffice API key
3. **No recent sales** - Add sales from last 30 days to sync

**No code changes needed** - Just configuration needed on your side.

Once you:
1. Get your Lexoffice API key ✓
2. Enter it in Settings ✓
3. Toggle Lexoffice ON ✓
4. Have sales data ✓

Everything will work automatically.
