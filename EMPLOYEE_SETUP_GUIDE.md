# Employee Management Setup Guide

## Overview
Your app now has complete employee management functionality integrated into the Settings page. Here's what was set up and what you need to do next.

## ✅ What's Been Completed

### 1. **AddEmployeeDialog Component** (`src/components/AddEmployeeDialog.tsx`)
- New React component for adding employees directly from the UI
- Form includes: First Name, Last Name, Email, Phone, Role, Department, Position
- Features:
  - Form validation (first name & last name required)
  - Toast notifications for success/error feedback
  - Auto-invalidates React Query cache after successful insert
  - Dropdown for predefined roles: owner, manager, sales_manager, salesperson, accountant, hr_manager, inventory_manager, service_advisor
  - Dropdown for departments: sales, finance, operations, hr, inventory, management, admin
  - Type-safe with `(supabase as any)` workaround for migrations not yet applied

### 2. **Settings Page Integration** (`src/pages/Settings.tsx`)
- Added new "Employees & HR" section with:
  - Users icon from lucide-react
  - "Add New Employee" button (AddEmployeeDialog trigger)
  - Clean UI card layout
  - Positioned before "System Information" section

### 3. **Database SQL Migration** (`SUPABASE_MIGRATIONS_SETUP.sql`)
- Comprehensive migration file with all tables and data
- Includes:
  - `employees` table with full schema
  - Pre-populated with sample employee: **Navid Galadhari**
    - Email: gmbh@fahrzeugpunkt.de
    - Phone: +49 30 123456
    - Role: manager
    - Position: Head of Manager
    - Department: sales
  - `employee_cash_advances` table
  - `employee_cash_summary` view
  - RLS (Row Level Security) policies
  - Computed columns and indexes

## 🚀 Next Steps (Required)

### Step 1: Apply Database Migrations
**This is critical - without this, the employee features won't work.**

1. Open your Supabase Dashboard: https://app.supabase.com
2. Navigate to **SQL Editor**
3. Create a new query
4. Open file `SUPABASE_MIGRATIONS_SETUP.sql` from your project root
5. Copy **entire** content
6. Paste into the SQL Editor
7. Click **Run** (Ctrl+Enter)
8. Verify success - you should see "Query executed successfully" messages

**Expected output:**
```
Query executed successfully
Query executed successfully
... (multiple success messages)
```

### Step 2: Test Employee Creation
After migrations are applied:

1. Go to Settings page (⚙️ icon in sidebar)
2. Scroll down to "Employees & HR" section
3. Click "Add New Employee" button
4. Fill in the form:
   - First Name: *required
   - Last Name: *required
   - Email: optional
   - Phone: optional
   - Role: select from dropdown (default: salesperson)
   - Department: select from dropdown (default: sales)
   - Position: optional
5. Click "Submit"
6. You should see a success toast notification
7. The dialog closes automatically and form resets

### Step 3: Verify Employee in Database
After adding an employee, verify they appear in the system:

1. Go to **Expenses** page
2. Click "Add Expense" or "Add Advance"
3. Look for the employee in the employee dropdown
4. You should see both:
   - Navid Galadhari (from migrations)
   - Any new employees you added

### Step 4: Test Expense with Employee Assignment
1. Go to Expenses page
2. Click "Add Expense"
3. Fill in the form:
   - Category: select one
   - Description: enter text
   - Amount: enter number
   - Date: select date
   - Payment Type: select "Cash (Employee Advance)"
   - Employee: select Navid or your new employee
4. Click "Submit"
5. Verify the expense appears in the list with employee name

## 📋 Form Fields Reference

### AddEmployeeDialog Fields
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| First Name | Text | Yes | Trimmed on submit |
| Last Name | Text | Yes | Trimmed on submit |
| Email | Email | No | Trimmed on submit |
| Phone | Text | No | Trimmed on submit |
| Role | Dropdown | No | Default: salesperson |
| Department | Dropdown | No | Default: sales |
| Position | Text | No | Trimmed on submit |

### Role Options
- owner
- manager
- sales_manager
- salesperson
- accountant
- hr_manager
- inventory_manager
- service_advisor

### Department Options
- sales
- finance
- operations
- hr
- inventory
- management
- admin

## 🔧 Troubleshooting

### Problem: "employees table does not exist" error
**Solution:** You haven't applied the migrations yet. Run SUPABASE_MIGRATIONS_SETUP.sql in Supabase SQL Editor.

### Problem: Employee dropdown shows "None" only
**Solution:** 
1. Verify migrations were applied successfully
2. Check Supabase dashboard → SQL Editor → Run: `SELECT * FROM employees;`
3. Should show Navid Galadhari row

### Problem: "Add Employee" button not appearing in Settings
**Solution:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Restart dev server: `npm run dev`
3. Navigate back to Settings

### Problem: Form submission fails silently
**Solution:**
1. Open browser DevTools (F12)
2. Check Console tab for error messages
3. Look for "Supabase error:" messages
4. If permissions error, RLS policies may need adjustment

## 📝 Pre-populated Sample Data
After running migrations, your system includes:

**Employee: Navid Galadhari**
- Email: gmbh@fahrzeugpunkt.de
- Phone: +49 30 123456
- Role: manager
- Position: Head of Manager
- Department: sales
- Status: Active

## 🔐 Security Notes
- All employee records are subject to Row Level Security (RLS) policies
- Mutations only insert/update allowed fields
- Toast notifications provide user feedback for all actions
- Validation prevents empty required fields

## 📞 Support
If you encounter issues:
1. Check the browser console (F12 → Console tab)
2. Look for "Supabase error:" messages
3. Verify database migrations were applied
4. Check Supabase dashboard for data consistency

---

**Setup Status:** ✅ Component ready | ⏳ Awaiting migration application | ⏳ Testing pending
