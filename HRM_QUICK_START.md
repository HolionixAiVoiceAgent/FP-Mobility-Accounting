# HRM - Quick Start Guide

## ⚡ 3-Step Quick Start

### Step 1: Apply Database (5 minutes)
Copy the SQL file and run in Supabase:
- File: `HRM_DATABASE_SETUP.sql`
- Location: Supabase Dashboard → SQL Editor → New Query → Paste & Run

### Step 2: Start Your App
```bash
npm run dev
```

### Step 3: Access HRM
1. Login to your app
2. Click **"HRM"** in the sidebar (new menu item!)
3. Start using immediately

---

## 👥 Employee Tab

**Add Employee:**
1. Click "Add Employee" button
2. Fill form:
   - Full Name: "John Doe"
   - Email: "john@company.com"
   - Position: "Technician"
   - Department: "Operations"
   - **Hourly Rate: 15.50** ← Important!
   - Hire Date: (auto-filled)
3. Click "Add Employee"

---

## ⏰ Attendance Tab (AUTOMATIC SALARY CALCULATION)

**Record Daily Attendance:**
1. Select employee from dropdown
2. Click "Record Attendance" button
3. Fill form:
   - Date: Today
   - Check-in Time: `09:00`
   - Check-out Time: `17:30`
   - Status: Present
4. Click "Record Attendance"

**Result: System shows:**
- Hours Worked: **8.5 hours**
- Daily Salary: **€127.50** ← Auto-calculated!
  - Calculation: 8.5 hours × €15/hour = €127.50

---

## 📅 Leaves Tab

**Request Leave:**
1. Select employee
2. Click "Request Leave" button
3. Fill form:
   - Leave Type: Vacation / Sick / Personal / Unpaid
   - Start Date: (pick date)
   - End Date: (pick date)
   - Reason: "Family vacation"
4. Click "Submit Request"
5. Admin will see it as "Pending" → can approve/reject

---

## 💰 Payroll Tab

**View Employee Payroll:**
1. Select employee
2. See:
   - Hourly Rate: €15.50/hr
   - Days Worked This Month: 22
   - Total Hours: 176h
3. View historical payroll records showing:
   - Month: November 2025
   - Hours: 176
   - Gross: €2,728
   - Deductions: €273
   - Net: €2,455

---

## 🔢 Salary Calculation Examples

### Example 1: 8-hour workday
- Check-in: 09:00
- Check-out: 17:00
- Hourly Rate: €20/hour
- **Daily Salary: €160** (8h × €20)

### Example 2: 6-hour day
- Check-in: 10:00
- Check-out: 16:00
- Hourly Rate: €15/hour
- **Daily Salary: €90** (6h × €15)

### Example 3: 10-hour overtime
- Check-in: 07:00
- Check-out: 17:00
- Hourly Rate: €18/hour
- **Daily Salary: €180** (10h × €18)

---

## 📊 Monthly Salary Example

**Employee: Jane**
- Hourly Rate: €15/hour
- Days Worked: 22 days
- Average Hours/Day: 8 hours

**Calculation:**
```
Total Hours = 22 days × 8 hours = 176 hours
Gross Salary = 176 hours × €15/hour = €2,640
Tax/Deductions = €264 (10%)
Net Salary = €2,376
```

---

## ✅ Checklist

- [ ] Database setup: Ran `HRM_DATABASE_SETUP.sql`
- [ ] Server: Started with `npm run dev`
- [ ] Navigation: See "HRM" in sidebar
- [ ] Added: At least one employee with hourly rate
- [ ] Recorded: At least one attendance record
- [ ] Verified: Salary calculated automatically
- [ ] Tested: Leave request submission
- [ ] Tested: Payroll tab showing calculations

---

## 🎯 What Gets Auto-Calculated

| Item | Formula | Example |
|------|---------|---------|
| Hours Worked | Check-out − Check-in | 17:30 − 09:00 = 8.5h |
| Daily Salary | Hours × Hourly Rate | 8.5 × €15 = €127.50 |
| Leave Days | End Date − Start Date + 1 | 15th − 10th + 1 = 6 days |
| Days Worked | Count of "present" records | 22 days this month |
| Gross Salary | Total Hours × Rate | 176h × €15 = €2,640 |

---

## ❓ Common Questions

**Q: Why is salary showing €0?**
A: Check that:
1. Hourly rate > 0 (not zero)
2. Check-out time ≠ check-in time
3. Status = "Present"

**Q: Can employees add themselves?**
A: No, only admins (owner/manager/hr_manager) can add employees

**Q: How do I approve a leave?**
A: Admin sees pending leaves in the Leaves tab - approval feature coming in next update

**Q: Can I edit attendance?**
A: Select employee → see attendance in table → click to edit (feature ready)

**Q: Multiple check-ins per day?**
A: Create separate records for each work session

---

## 🚨 Important Notes

⚠️ **Set hourly rates correctly** - affects all salary calculations
⚠️ **Check times must be different** - 09:00 to 09:00 = 0 hours = €0 salary
⚠️ **Admin-only feature** - regular employees can't access HRM tab
✅ **Data encrypted** - All stored securely in Supabase
✅ **Real-time updates** - Changes show instantly

---

## 📱 Mobile Friendly

✅ Works on:
- Desktop
- Tablet
- Mobile phones

All features responsive and touch-friendly!

---

## 🔒 Security

- Role-based access (owner/manager/hr_manager only)
- All data encrypted in transit and at rest
- Row-level security policies on database
- Authentication required

---

**Status: 🟢 READY TO USE**

Start with Step 1, then enjoy your new HRM system! 🎉
