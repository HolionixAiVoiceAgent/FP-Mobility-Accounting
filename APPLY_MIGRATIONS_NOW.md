# IMMEDIATE ACTION REQUIRED: Database Migrations

## ⚠️ Important: These migrations MUST be applied before employee features will work

### How to Apply Migrations

**Step-by-step:**

1. **Open Supabase Dashboard**
   - Go to: https://app.supabase.com
   - Select your project

2. **Navigate to SQL Editor**
   - Left sidebar → SQL Editor
   - Or click "+" to create a new query

3. **Copy Migration SQL**
   - Open file from your project: `SUPABASE_MIGRATIONS_SETUP.sql`
   - Copy entire file content (Ctrl+A, Ctrl+C)

4. **Paste into SQL Editor**
   - Click in the SQL editor text area
   - Paste (Ctrl+V)

5. **Execute Query**
   - Click blue **Run** button (or Ctrl+Enter)
   - Wait for completion (should take 5-10 seconds)

6. **Verify Success**
   - Should show multiple "Query executed successfully" messages
   - No red error messages

### What Gets Created

After successful migration, your database will have:

✅ **employees** table
- Stores employee information (name, email, phone, role, department, etc.)
- Includes RLS policies for security

✅ **employee_cash_advances** table  
- Records cash advances to employees
- Tracks advance amount and dates

✅ **employee_cash_summary** view
- Automatically calculates totals per employee
- Shows: total_advanced, total_spent, remaining_balance

✅ **Sample Employee Data**
- Navid Galadhari (manager)
- Email: gmbh@fahrzeugpunkt.de

✅ **New columns on expenses table**
- `payment_type` (Account/Bank or Cash)
- `employee_id` (links to employees)

---

## ❌ If You Skip This

**Features that won't work:**
- Adding employees from UI
- Assigning employees to expenses
- Cash advance tracking
- Employee dropdown will be empty

## ✅ After Successful Migration

1. **Test in Settings**
   - Go to Settings → Employees & HR
   - Click "Add New Employee"
   - Fill form and submit
   - Should see success notification

2. **Test in Expenses**
   - Go to Expenses → Add Expense
   - Select "Cash (Employee Advance)" as payment type
   - Employee dropdown should show Navid + any new employees

3. **That's it!**
   - Your employee management system is live
   - Users can now add employees directly from the app

---

**Important:** If you encounter SQL errors during migration, take a screenshot and share the error message for debugging.
