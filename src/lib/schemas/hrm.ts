/**
 * Validation Schemas for HRM Module
 * Zod schemas for employee, attendance, leave, and payroll data validation
 */

import { z } from 'zod';

// ============================================================================
// Employee Schemas
// ============================================================================

export const EmployeeFormSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  role: z.string().min(1, 'Role is required'),
  department: z.string().min(1, 'Department is required'),
  position: z.string().min(1, 'Position is required'),
  base_salary: z.number().min(0, 'Base salary must be positive'),
  is_active: z.boolean().default(true),
});

export type EmployeeFormData = z.infer<typeof EmployeeFormSchema>;

// ============================================================================
// Attendance Schemas
// ============================================================================

export const AttendanceFormSchema = z.object({
  check_in_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
  check_out_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)').optional().or(z.literal('')),
  status: z.enum(['present', 'absent', 'leave']).default('present'),
  notes: z.string().optional(),
});

export type AttendanceFormData = z.infer<typeof AttendanceFormSchema>;

export const AttendanceSchema = z.object({
  id: z.string().uuid(),
  employee_id: z.string().uuid(),
  date: z.string().date(),
  check_in_time: z.string().time(),
  check_out_time: z.string().time().nullable(),
  status: z.enum(['present', 'absent', 'leave']),
  notes: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Attendance = z.infer<typeof AttendanceSchema>;

// ============================================================================
// Leave Schemas
// ============================================================================

export const LeaveFormSchema = z.object({
  leave_type: z.enum(['sick', 'vacation', 'personal', 'unpaid']),
  start_date: z.string().date('Start date is required'),
  end_date: z.string().date('End date is required'),
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  notes: z.string().optional(),
}).refine((data) => new Date(data.end_date) >= new Date(data.start_date), {
  message: 'End date must be after or equal to start date',
  path: ['end_date'],
});

export type LeaveFormData = z.infer<typeof LeaveFormSchema>;

export const LeaveSchema = z.object({
  id: z.string().uuid(),
  employee_id: z.string().uuid(),
  leave_type: z.enum(['sick', 'vacation', 'personal', 'unpaid']),
  start_date: z.string().date(),
  end_date: z.string().date(),
  reason: z.string(),
  status: z.enum(['pending', 'approved', 'rejected']),
  approved_by: z.string().uuid().nullable(),
  approval_date: z.string().date().nullable(),
  notes: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Leave = z.infer<typeof LeaveSchema>;

// ============================================================================
// Payroll Schemas
// ============================================================================

export const PayrollFormSchema = z.object({
  month: z.string().date('Month is required'),
  base_salary: z.number().min(0, 'Base salary must be positive'),
  overtime_hours: z.number().min(0, 'Overtime hours must be non-negative').default(0),
  overtime_rate: z.number().min(1, 'Overtime rate must be at least 1').default(1.5),
  deductions: z.number().min(0, 'Deductions must be non-negative').default(0),
  bonus: z.number().min(0, 'Bonus must be non-negative').default(0),
  payment_date: z.string().date().optional(),
  payment_method: z.enum(['bank_transfer', 'check', 'cash']).default('bank_transfer'),
  status: z.enum(['pending', 'paid', 'cancelled']).default('pending'),
  notes: z.string().optional(),
});

export type PayrollFormData = z.infer<typeof PayrollFormSchema>;

export const PayrollSchema = z.object({
  id: z.string().uuid(),
  employee_id: z.string().uuid(),
  month: z.string().date(),
  base_salary: z.number(),
  overtime_hours: z.number(),
  overtime_rate: z.number(),
  overtime_amount: z.number(),
  deductions: z.number(),
  bonus: z.number(),
  net_salary: z.number(),
  payment_date: z.string().date().nullable(),
  payment_method: z.string(),
  status: z.enum(['pending', 'paid', 'cancelled']),
  notes: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Payroll = z.infer<typeof PayrollSchema>;

// ============================================================================
// Validation Utilities
// ============================================================================

export function validateAttendanceForm(data: unknown) {
  try {
    return {
      success: true,
      data: AttendanceFormSchema.parse(data),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.flatten().fieldErrors,
      };
    }
    throw error;
  }
}

export function validateLeaveForm(data: unknown) {
  try {
    return {
      success: true,
      data: LeaveFormSchema.parse(data),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.flatten().fieldErrors,
      };
    }
    throw error;
  }
}

export function validatePayrollForm(data: unknown) {
  try {
    return {
      success: true,
      data: PayrollFormSchema.parse(data),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.flatten().fieldErrors,
      };
    }
    throw error;
  }
}

export function validateEmployeeForm(data: unknown) {
  try {
    return {
      success: true,
      data: EmployeeFormSchema.parse(data),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.flatten().fieldErrors,
      };
    }
    throw error;
  }
}
