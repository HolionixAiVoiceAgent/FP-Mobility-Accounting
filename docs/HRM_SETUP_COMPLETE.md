# HRM Module - Complete Setup Guide

## Overview
The HRM (Human Resources Management) module is now integrated into your accounting software as a main section alongside Dashboard, Inventory, Vehicle Sales, etc.

## Features

### 1. **Employee Management**
- Add new employees with their details:
  - Full Name
  - Email
  - Position
  - Department (Sales, Operations, Finance, HR, IT, Other)
  - Hourly Rate (€/hour)
  - Hire Date
- View all active employees in a table format
- Edit and manage employee information

### 2. **Attendance Management**
- Record daily check-in and check-out times
- Track employee status: Present, Absent, Leave
- Add optional notes for each attendance record
- View 30-day attendance history
- **Automatic salary calculation based on hours worked**
  - Hours calculated from check-in to check-out
  - Daily salary = Hours Worked × Hourly Rate
  - Example: Employee works 8.5 hours at €15/hour = €127.50 daily salary

### 3. **Leave Management**
- Request leaves with multiple types:
  - Vacation (20 days/year default)
  - Sick Leave (10 days/year default)
  - Personal Leave
  - Unpaid Leave
- Specify start and end dates
- Add reason for leave
- Automatic calculation of leave duration
- Track leave request status: Pending, Approved, Rejected

### 4. **Payroll Management**
- View employee hourly rates
- Monitor days worked this month
- Track total hours worked
- View historical payroll records with:
  - Month
  - Total hours
  - Hourly rate
  - Gross salary (hours × rate)
  - Deductions
  - Net salary

## Access & Permissions

**Who can access HRM:**
- Users with role: `owner`, `manager`, or `hr_manager`
- Other users will see "Access Denied" message

## Navigation

After setup, HRM will appear in your main navigation menu:
```
Dashboard → Inventory → Vehicle Sales → Purchases → Customers → Expenses → Banking → HRM → Reports → Settings
```

## Database Setup Required

The HRM module requires these tables to be created in Supabase. Run the `HRM_DATABASE_SETUP.sql` file:

```sql
1. employee_attendance - Tracks daily check-in/check-out times
2. employee_leaves - Manages leave requests
3. payroll - Stores monthly salary calculations (optional - can be auto-generated)
4. employee_leave_balance - View for leave balance tracking
5. employee_attendance_summary - View for monthly statistics
```

## Salary Calculation Logic

### Daily Salary Calculation
```
Hours Worked = (Check-Out Time - Check-In Time) / 60
Daily Salary = Hours Worked × Hourly Rate

Example:
- Check-in: 09:00
- Check-out: 17:30
- Hours: 8.5 hours
- Hourly Rate: €15/hour
- Daily Salary: €127.50
```

### Monthly Salary Calculation
```
Total Hours = Sum of all hours worked in the month
Gross Salary = Total Hours × Hourly Rate
Net Salary = Gross Salary - Deductions

Example (22 working days):
- Total Hours: 176 hours (8 hours/day × 22 days)
- Hourly Rate: €15/hour
- Gross Salary: €2,640
- Deductions: €264 (10% for taxes/insurance)
- Net Salary: €2,376
```

## Step-by-Step Setup

### Step 1: Apply Database Migrations
1. Open your Supabase Dashboard
2. Go to SQL Editor
3. Create a new query
4. Copy entire contents of `HRM_DATABASE_SETUP.sql`
5. Paste into the query editor
6. Click "Run"
7. Verify: All queries execute successfully

### Step 2: Verify Frontend Integration
1. Check that `src/App.tsx` has HRM route:
   ```tsx
   <Route path="/hrm" element={<ProtectedRoute><HRM /></ProtectedRoute>} />
   ```

2. Check that `src/components/Layout.tsx` has HRM in navigation:
   ```tsx
   { name: 'HRM', href: '/hrm', icon: Briefcase },
   ```

3. Build project:
   ```bash
   npm run build
   ```

### Step 3: Start Using HRM

1. **Add Employees:**
   - Click HRM in sidebar
   - Go to "Employees" tab
   - Click "Add Employee" button
   - Fill in employee details
   - Set hourly rate (e.g., €15.50/hour)
   - Click "Add Employee"

2. **Record Attendance:**
   - Go to "Attendance" tab
   - Select employee
   - Click "Record Attendance"
   - Enter check-in time (e.g., 09:00)
   - Enter check-out time (e.g., 17:30)
   - Select status: Present
   - Click "Record Attendance"
   - System automatically calculates hours and daily salary

3. **Request Leaves:**
   - Go to "Leaves" tab
   - Select employee
   - Click "Request Leave"
   - Choose leave type (vacation, sick, personal, unpaid)
   - Set start and end dates
   - Add reason
   - Click "Submit Request"

4. **View Payroll:**
   - Go to "Payroll" tab
   - Select employee
   - View hourly rate, days worked, total hours
   - See historical payroll records with calculated salaries

## Data Flow

```
Employee Added
    ↓
Check-in/Check-out Times Recorded
    ↓
Hours Automatically Calculated
    ↓
Daily Salary Calculated (Hours × Hourly Rate)
    ↓
Monthly Salary Generated
    ↓
Payroll Report Available
```

## Important Notes

✅ **What's Automated:**
- Hours calculation from check-in/check-out times
- Daily salary calculation
- Leave balance tracking
- Attendance summary reports
- Access control (admin-only)

⚠️ **Manual Configuration Needed:**
- Set appropriate hourly rates for each employee
- Configure leave policies (days/year) in database if needed
- Set up tax/deduction rates
- Review and approve leave requests

## Troubleshooting

**Problem:** "You do not have permission to access HRM"
**Solution:** User role must be `owner`, `manager`, or `hr_manager`. Update user role in auth settings.

**Problem:** Employee not appearing in dropdown
**Solution:** Ensure employee is marked as `is_active = true` in database.

**Problem:** Salary calculations showing 0
**Solution:** 
1. Verify hourly rate is set (> 0)
2. Verify check-in and check-out times are different
3. Verify attendance status is "present"

**Problem:** Leave requests not saving
**Solution:**
1. Select an employee first
2. Ensure start date ≤ end date
3. Check database connectivity

## Next Steps

1. ✅ Run `HRM_DATABASE_SETUP.sql` in Supabase
2. ✅ Verify routes are added to `src/App.tsx`
3. ✅ Verify HRM is in navigation menu in `src/components/Layout.tsx`
4. ✅ Start your development server: `npm run dev`
5. ✅ Navigate to HRM section: Click "HRM" in sidebar
6. ✅ Add test employee
7. ✅ Record test attendance
8. ✅ Verify salary calculation
9. ✅ Test leave request workflow

## File Structure

```
src/
├── pages/
│   └── HRM.tsx ........................ Main HRM component (with all features)
├── components/
│   └── Layout.tsx ..................... Updated with HRM navigation
└── App.tsx ........................... Updated with HRM route

supabase/
└── migrations/
    └── HRM_DATABASE_SETUP.sql ........ Database tables and views
```

## API Endpoints Used

The HRM module uses these Supabase tables:
- `employees` - Employee master data
- `employee_attendance` - Daily check-in/check-out records
- `employee_leaves` - Leave request records
- `payroll` - Monthly salary records
- `employee_leave_balance` - Leave balance view
- `employee_attendance_summary` - Attendance statistics view

## Security

- All HRM data is protected by Supabase Row Level Security (RLS)
- Only authenticated users can access HRM
- Only admin users can see HRM module
- Employee data is encrypted in transit and at rest

## Support

For issues or questions:
1. Check that database migrations are applied
2. Verify user role is correct (owner/manager/hr_manager)
3. Check browser console for error messages
4. Verify all imports are correct in App.tsx
5. Check that Supabase tables exist in database

---

**Status:** ✅ HRM Module Ready
**Last Updated:** November 14, 2025
**Components:** 1 page component, 2 modified files, 1 SQL migration file
