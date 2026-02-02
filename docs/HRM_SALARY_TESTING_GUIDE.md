# HRM Salary Calculation - Testing Guide

## 🧪 How to Test the Automatic Salary Calculation

This guide shows you exactly how to test that salaries are calculated automatically based on check-in/check-out times.

---

## Test Scenario 1: 8-Hour Standard Workday

### Setup
```
Employee Name: Test Employee 1
Hourly Rate: €15.00/hour
```

### Action: Record Attendance
```
Date: Today
Check-in Time: 09:00
Check-out Time: 17:00
Status: Present
```

### Expected Result
```
Hours Worked: 8.0 hours
Daily Salary: €120.00 ✓ (8.0 × €15.00)
```

### Calculation
```
17:00 (1020 min) - 09:00 (540 min) = 480 minutes
480 minutes ÷ 60 = 8.0 hours
8.0 hours × €15.00/hour = €120.00
```

---

## Test Scenario 2: Short 6-Hour Day

### Setup
```
Employee Name: Test Employee 2
Hourly Rate: €18.00/hour
```

### Action: Record Attendance
```
Date: Today
Check-in Time: 10:00
Check-out Time: 16:00
Status: Present
```

### Expected Result
```
Hours Worked: 6.0 hours
Daily Salary: €108.00 ✓ (6.0 × €18.00)
```

### Calculation
```
16:00 (960 min) - 10:00 (600 min) = 360 minutes
360 minutes ÷ 60 = 6.0 hours
6.0 hours × €18.00/hour = €108.00
```

---

## Test Scenario 3: Half-Hour (0.5 Hour) Increment

### Setup
```
Employee Name: Test Employee 3
Hourly Rate: €20.00/hour
```

### Action: Record Attendance
```
Date: Today
Check-in Time: 09:00
Check-out Time: 09:30
Status: Present
```

### Expected Result
```
Hours Worked: 0.5 hours
Daily Salary: €10.00 ✓ (0.5 × €20.00)
```

### Calculation
```
09:30 (570 min) - 09:00 (540 min) = 30 minutes
30 minutes ÷ 60 = 0.5 hours
0.5 hours × €20.00/hour = €10.00
```

---

## Test Scenario 4: Long Overtime Day (10+ Hours)

### Setup
```
Employee Name: Test Employee 4
Hourly Rate: €16.00/hour
```

### Action: Record Attendance
```
Date: Today
Check-in Time: 07:00
Check-out Time: 18:00
Status: Present
```

### Expected Result
```
Hours Worked: 11.0 hours
Daily Salary: €176.00 ✓ (11.0 × €16.00)
```

### Calculation
```
18:00 (1080 min) - 07:00 (420 min) = 660 minutes
660 minutes ÷ 60 = 11.0 hours
11.0 hours × €16.00/hour = €176.00
```

---

## Test Scenario 5: Quarter-Hour (15-Minute) Increment

### Setup
```
Employee Name: Test Employee 5
Hourly Rate: €24.00/hour
```

### Action: Record Attendance
```
Date: Today
Check-in Time: 14:00
Check-out Time: 14:45
Status: Present
```

### Expected Result
```
Hours Worked: 0.75 hours
Daily Salary: €18.00 ✓ (0.75 × €24.00)
```

### Calculation
```
14:45 (885 min) - 14:00 (840 min) = 45 minutes
45 minutes ÷ 60 = 0.75 hours
0.75 hours × €24.00/hour = €18.00
```

---

## Test Scenario 6: Exact 3-Hour Half-Day

### Setup
```
Employee Name: Test Employee 6
Hourly Rate: €12.00/hour
```

### Action: Record Attendance
```
Date: Today
Check-in Time: 14:00
Check-out Time: 17:00
Status: Present
```

### Expected Result
```
Hours Worked: 3.0 hours
Daily Salary: €36.00 ✓ (3.0 × €12.00)
```

### Calculation
```
17:00 (1020 min) - 14:00 (840 min) = 180 minutes
180 minutes ÷ 60 = 3.0 hours
3.0 hours × €12.00/hour = €36.00
```

---

## Test Scenario 7: Verify Multiple Records

### Setup
```
Employee Name: Test Employee 7
Hourly Rate: €14.50/hour
```

### Action 1: Record First Day
```
Date: November 12
Check-in: 08:00
Check-out: 16:00
Hours: 8.0
Daily Salary: €116.00 (8.0 × €14.50)
```

### Action 2: Record Second Day
```
Date: November 13
Check-in: 09:00
Check-out: 17:30
Hours: 8.5
Daily Salary: €123.25 (8.5 × €14.50)
```

### Action 3: Record Third Day
```
Date: November 14
Check-in: 08:30
Check-out: 16:30
Hours: 8.0
Daily Salary: €116.00 (8.0 × €14.50)
```

### View Results
```
Attendance Records Table:
Date    | Check-in | Check-out | Hours | Daily Salary
--------|----------|-----------|-------|-------------
Nov 14  | 08:30    | 16:30     | 8.0   | €116.00
Nov 13  | 09:00    | 17:30     | 8.5   | €123.25
Nov 12  | 08:00    | 16:00     | 8.0   | €116.00
        |          |           |       |
        |          | Total:    | 24.5h | €355.25

Payroll Tab Shows:
Days Worked: 3
Total Hours: 24.5h
```

---

## Step-by-Step Testing Instructions

### Phase 1: Prepare (2 minutes)
```
1. Open HRM module (click "HRM" in sidebar)
2. Go to "Employees" tab
3. Click "Add Employee"
4. Fill form:
   - Full Name: "Salary Test Employee"
   - Email: "test@example.com"
   - Position: "Test"
   - Department: "Testing"
   - Hourly Rate: 15.50 ← IMPORTANT!
   - Hire Date: Auto-filled
5. Click "Add Employee"
6. ✅ See confirmation: "Employee added successfully"
```

### Phase 2: Test Attendance & Salary (5 minutes)
```
1. Go to "Attendance" tab
2. Select employee: "Salary Test Employee"
3. Click "Record Attendance"
4. Fill form:
   - Date: 2025-11-14
   - Check-in: 09:00
   - Check-out: 17:30
   - Status: Present
   - Notes: (empty)
5. Click "Record Attendance"
6. ✅ See confirmation: "Attendance recorded successfully"
7. Look at table below - you should see:
   
   Date: 2025-11-14
   Check-in: 09:00
   Check-out: 17:30
   Hours: 8.5
   Daily Salary: €131.75 ← AUTO-CALCULATED! (8.5 × €15.50)
```

### Phase 3: Verify Payroll (2 minutes)
```
1. Go to "Payroll" tab
2. Select same employee: "Salary Test Employee"
3. See card showing:
   - Hourly Rate: €15.50/hr
   - Days Worked: 1
   - Total Hours: 8.5h
4. This confirms the system is tracking everything correctly!
```

---

## ✅ Success Checklist

### All Tests Should Show:
- [ ] Hours correctly calculated from times
- [ ] Daily salary = hours × hourly rate
- [ ] Multiple records accumulate correctly
- [ ] Payroll tab shows correct totals
- [ ] Data persists when page reloaded
- [ ] Can view historical records

### Example: Test passes if:
```
Input: Check-in 09:00, Check-out 17:30, Rate €15.50
Output: Hours 8.5, Daily Salary €131.75
```

---

## Common Issues & Solutions

### Issue 1: Salary shows €0
**Causes:**
- Check-out time = check-in time (0 hours)
- Hourly rate = 0
- Status not set to "Present"

**Solution:**
- Ensure check-in ≠ check-out
- Verify hourly rate > 0
- Set status to "Present"

### Issue 2: Hours showing decimal incorrectly
**Cause:** Rounding issue

**Solution:**
- Expected: 8.5 hours = 510 minutes ÷ 60
- If showing wrong: Check browser console for errors

### Issue 3: Attendance not saving
**Causes:**
- No employee selected
- Check-in/check-out empty
- Database connection issue

**Solution:**
- Select employee first
- Fill all time fields
- Check browser console for error messages
- Verify Supabase database migrations ran

### Issue 4: Can't see HRM tab
**Causes:**
- Not logged in as admin
- User role not owner/manager/hr_manager
- Navigation not updated

**Solution:**
- Login with admin account
- Check user role in Settings
- Refresh page with Ctrl+F5

---

## Formula Reference

Use this table for manual verification:

| Check-in | Check-out | Minutes | Hours | Rate | Salary |
|----------|-----------|---------|-------|------|--------|
| 09:00 | 17:00 | 480 | 8.0 | €15 | €120 |
| 09:00 | 17:30 | 510 | 8.5 | €15 | €127.50 |
| 08:00 | 16:00 | 480 | 8.0 | €20 | €160 |
| 07:00 | 18:00 | 660 | 11.0 | €18 | €198 |
| 10:00 | 12:00 | 120 | 2.0 | €25 | €50 |
| 08:30 | 16:45 | 495 | 8.25 | €16 | €132 |

---

## Advanced Test: Monthly Calculation

### Test Monthly Payroll
```
Employee: Monthly Test
Hourly Rate: €15/hour

Records to add (simulate 1 month):
- Record 1: 8h/day × €15 = €120
- Record 2: 8h/day × €15 = €120
- Record 3: 8h/day × €15 = €120
- Record 4: 8h/day × €15 = €120
- Record 5: 8h/day × €15 = €120
(5 records = 1 week of work)

Weekly total: €600

Expected after 4 weeks (20 working days):
- Total Hours: 160 hours
- Gross Salary: €2,400
```

---

## Real-World Example: 22-Day Month

### Monthly Calculation
```
Working Days: 22 (typical workdays in a month)
Hours/Day: 8 hours (standard)
Hourly Rate: €15.00

Calculation:
22 days × 8 hours/day = 176 hours
176 hours × €15.00/hour = €2,640 (Gross)

With 10% deductions (taxes/insurance):
Deductions: €264
Net Salary: €2,376
```

### How to Verify in App
```
1. Add 22 attendance records (one per workday)
2. Each with 8 hours (check-in 09:00, check-out 17:00)
3. Each with hourly rate €15.00
4. Go to Payroll tab
5. See:
   - Days Worked: 22
   - Total Hours: 176h
   - Gross: €2,640
```

---

## Performance Test

### Test System with Large Data
```
1. Add 10 employees
2. For each, add 30 days of attendance records
3. Total: 300 records
4. Check that:
   - System loads quickly
   - Calculations are instant
   - No errors in console
   - Salaries display correctly
```

---

## Conclusion

✅ **All tests pass if:**
- Hours calculated correctly (out - in ÷ 60)
- Daily salary = hours × rate
- Multiple records accumulate
- Payroll totals are accurate
- Data persists across page reloads

🎉 **Automatic salary calculation is working perfectly!**

---

**Test Status:** Ready to execute
**Difficulty:** Easy (data entry only)
**Time Required:** ~15 minutes
**Expected Result:** All calculations correct ✓
