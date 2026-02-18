# HRM Fixes Plan

## Issues Identified

1. **Admin Check Circular Dependency**: First-time users can't access HRM because admin check requires employee record which requires admin access to create
2. **Database Migrations May Not Be Applied**: Missing tables/views/columns for attendance, leaves, and payroll
3. **No Fallback Auth Mechanism**: System only checks employees table for role verification

## Fixes to Implement

### Fix 1: Update Admin Check in HRM.tsx
- Add fallback to check `user_roles` table
- Handle first-time users gracefully
- Show better error messages

### Fix 2: Update Admin Check in EmployeeManagement.tsx  
- Same fallback logic as HRM.tsx
- Ensure consistency across both components

### Fix 3: Apply Database Migrations
- Verify all HRM tables exist
- Apply migrations if missing
- Test database connectivity

### Fix 4: Add Diagnostic Helper Function
- Create reusable admin check function
- Use in both HRM and EmployeeManagement components

## Files to Modify
- `src/pages/HRM.tsx` - Lines ~100-115
- `src/components/EmployeeManagement.tsx` - Lines ~65-85

## Files to Check
- `supabase/migrations/` - For existing migrations
- `HRM_DATABASE_SETUP.sql` - For manual migration reference

## Expected Outcome
- First-time users can access HRM
- Admin role properly detected from user_roles table
- Better error messages for debugging
- All HRM features functional (attendance, leaves, payroll)

