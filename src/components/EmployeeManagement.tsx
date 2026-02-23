import { useState, useEffect } from 'react';
import { logError } from '@/lib/errors';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Edit2, AlertCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const ROLES = ['owner', 'employee'];
const DEPARTMENTS = ['sales', 'finance', 'operations', 'hr', 'inventory', 'management', 'admin'];

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  position: string;
  is_active: boolean;
  hire_date: string;
  base_salary?: number | null;
  hourly_rate?: number | null;
}

interface EmployeeForm {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  position: string;
  department: string;
  base_salary?: string;
  hourly_rate?: string;
}

export function EmployeeManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAdmin, loading: authLoading } = useAuth();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  const [form, setForm] = useState<EmployeeForm>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'salesperson',
    position: '',
    department: 'sales',
    base_salary: '',
    hourly_rate: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Reset form when dialog opens for adding new employee
  useEffect(() => {
    if (!addDialogOpen) {
      // Dialog closed - form will be reset on next open or by handleEdit
    } else if (!editingEmployee) {
      // Dialog opened for adding new employee - reset form
      setForm({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role: 'salesperson',
        position: '',
        department: 'sales',
        base_salary: '',
        hourly_rate: '',
      });
    }
  }, [addDialogOpen, editingEmployee]);

  // Fetch employees
  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('employees')
        .select('*')
        .eq('is_active', true)
        .order('full_name');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch company settings to access monthly_work_hours for hourly derivation
  // Using 'as any' to bypass type checking since column might not exist yet
  const { data: companySettings } = useQuery({
    queryKey: ['company-settings'],
    queryFn: async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('company_settings')
          .select('monthly_work_hours')
          .single();
        if (error || !data) return null;
        return data;
      } catch (e) {
        // Table or column might not exist yet
        console.log('[EmployeeManagement] company_settings table not available:', e);
        return null;
      }
    },
  });

  // Add/Update employee mutation
  const saveEmployeeMutation = useMutation({
    mutationFn: async (employeeData: EmployeeForm & { id?: string }) => {
    // compute hourly_rate fallback if not provided
    const monthlyHours = companySettings?.monthly_work_hours ? parseInt((companySettings as any).monthly_work_hours, 10) : 160;
    const parseBase = employeeData.base_salary ? parseFloat(employeeData.base_salary) : null;
    let computedHourly: number | null = null;
    if (employeeData.hourly_rate) {
      computedHourly = parseFloat(employeeData.hourly_rate);
    } else if (parseBase != null && !Number.isNaN(parseBase)) {
      const mh = Number.isFinite(monthlyHours) && monthlyHours > 0 ? monthlyHours : 160;
      computedHourly = parseFloat((parseBase / mh).toFixed(2));
    }

    // construct payload for insert/update
    const commonPayload: Record<string, any> = {
      first_name: employeeData.first_name.trim(),
      last_name: employeeData.last_name.trim(),
      email: employeeData.email.trim() || null,
      phone: employeeData.phone.trim() || null,
      role: employeeData.role,
      position: employeeData.position.trim() || null,
      department: employeeData.department,
      hire_date: new Date().toISOString().split('T')[0],
      is_active: true,
    };

    // include numeric fields if provided
    if (parseBase != null) commonPayload.base_salary = parseBase;
    if (computedHourly != null) commonPayload.hourly_rate = computedHourly;

    console.log('[EmployeeManagement] Attempting save with payload:', {
      isUpdate: !!employeeData.id,
      employeeId: employeeData.id,
      payload: commonPayload,
      computedHourly,
      monthlyHours
    });

    // helper to attempt a request and optionally retry without problematic columns
    const attemptUpsert = async (operation: 'insert' | 'update', payload: Record<string, any>, id?: string) => {
      try {
        if (operation === 'update') {
          const { error } = await (supabase as any)
            .from('employees')
            .update(payload)
            .eq('id', id);
          if (error) {
            console.error('[EmployeeManagement] Update error:', { error, payload, id });
            throw error;
          }
          console.log('[EmployeeManagement] Update successful');
          return;
        }

        const { error } = await (supabase as any)
          .from('employees')
          .insert([payload]);

        if (error) {
          console.error('[EmployeeManagement] Insert error:', { error, payload });
          throw error;
        }
        console.log('[EmployeeManagement] Insert successful');
        return;
      } catch (err: any) {
        // If error complains about unknown column or schema cache, retry without salary columns
        const msg = err?.message || err?.error?.message || '';
        console.warn('[EmployeeManagement] Upsert error, checking for column mismatch:', msg);
        
        // Check for multiple error patterns: "does not exist", "schema cache", "Could not find"
        const unknownColumn = /column "(hourly_rate|base_salary)" does not exist|Could not find the '(hourly_rate|base_salary)'|schema cache/i.test(msg);
        
        if (unknownColumn) {
          console.log('[EmployeeManagement] Schema mismatch detected - retrying without base_salary/hourly_rate columns');
          console.log('[EmployeeManagement] NOTE: Database migration not applied. Run: supabase db push');
          
          const safePayload = { ...payload };
          delete safePayload.hourly_rate;
          delete safePayload.base_salary;

          if (operation === 'update') {
            const { error: retryErr } = await (supabase as any)
              .from('employees')
              .update(safePayload)
              .eq('id', id);
            if (retryErr) {
              console.error('[EmployeeManagement] Retry update error:', retryErr);
              throw retryErr;
            }
            console.log('[EmployeeManagement] Retry update successful (without salary fields)');
            return;
          }

          const { error: retryErr } = await (supabase as any)
            .from('employees')
            .insert([safePayload]);
          if (retryErr) {
            console.error('[EmployeeManagement] Retry insert error:', retryErr);
            throw retryErr;
          }
          console.log('[EmployeeManagement] Retry insert successful (without salary fields)');
          return;
        }

        // rethrow original error
        throw err;
      }
    };

    if (employeeData.id) {
      await attemptUpsert('update', commonPayload, employeeData.id);
    } else {
      await attemptUpsert('insert', commonPayload);
    }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      const message = editingEmployee ? 'Employee updated successfully' : 'Employee added successfully';
      toast({
        title: 'Success',
        description: message,
      });
      resetForm();
      setAddDialogOpen(false);
      setFormErrors({});
    },
    onError: (error: any) => {
      // Extract detailed error information
      const errorMsg = error?.message || error?.error?.message || error?.details || 'Failed to save employee';
      const errorCode = error?.code || error?.error?.code || '';
      const hint = error?.hint || error?.error?.hint || '';
      
      // Log comprehensive error details
      logError(error, { 
        operation: 'saveEmployee', 
        context: 'EmployeeManagement',
        errorMsg,
        errorCode,
        hint,
        fullError: JSON.stringify(error)
      });
      
      // Build user-friendly message
      let displayMsg = errorMsg;
      if (errorCode === '42501') {
        displayMsg = 'Permission denied. Only admins, managers, or HR managers can add employees.';
      } else if (errorCode === '42P01') {
        displayMsg = 'Database schema error. Please contact support.';
      } else if (errorMsg.includes('schema cache') || errorMsg.includes('Could not find')) {
        displayMsg = 'Database schema not updated. Please run: supabase db push';
      } else if (hint) {
        displayMsg = `${errorMsg} (${hint})`;
      }
      
      setFormErrors({ general: displayMsg });
      toast({
        title: 'Error',
        description: displayMsg,
        variant: 'destructive',
      });
      
      // Also log to browser console for debugging
      console.error('[EmployeeManagement] Save error:', { 
        errorMsg, 
        errorCode, 
        hint,
        fullError: error 
      });
    },
  });

  // Delete employee mutation
  const deleteEmployeeMutation = useMutation({
    mutationFn: async (employeeId: string) => {
      const { error } = await (supabase as any)
        .from('employees')
        .update({ is_active: false })
        .eq('id', employeeId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({
        title: 'Success',
        description: 'Employee removed successfully',
      });
      setDeleteConfirmOpen(false);
      setEmployeeToDelete(null);
    },
    onError: (error) => {
      logError(error, { operation: 'deleteEmployee', context: 'EmployeeManagement' });
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to remove employee',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setForm({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      role: 'salesperson',
      position: '',
      department: 'sales',
      base_salary: '',
      hourly_rate: '',
    });
    setEditingEmployee(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    if (!form.first_name.trim() || !form.last_name.trim()) {
      setFormErrors({ general: 'First name and last name are required' });
      return;
    }

    // Validate numeric fields
    const errors: Record<string, string> = {};
    if (form.base_salary && isNaN(Number(form.base_salary))) {
      errors.base_salary = 'Base salary must be a number';
    } else if (form.base_salary && Number(form.base_salary) < 0) {
      errors.base_salary = 'Base salary cannot be negative';
    }

    if (form.hourly_rate && isNaN(Number(form.hourly_rate))) {
      errors.hourly_rate = 'Hourly rate must be a number';
    } else if (form.hourly_rate && Number(form.hourly_rate) < 0) {
      errors.hourly_rate = 'Hourly rate cannot be negative';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    saveEmployeeMutation.mutate({
      ...form,
      id: editingEmployee?.id,
    });
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setForm({
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email || '',
      phone: employee.phone || '',
      role: employee.role,
      position: employee.position || '',
      base_salary: employee.base_salary?.toString() || '',
      hourly_rate: employee.hourly_rate?.toString() || '',
      department: employee.department,
    });
    setAddDialogOpen(true);
  };

  const handleDeleteClick = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (employeeToDelete) {
      deleteEmployeeMutation.mutate(employeeToDelete.id);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="pt-6">
          <div flex-col items-center className="flex gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Checking permissions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isAdmin) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertCircle className="h-5 w-5" />
            <p>You don't have permission to manage employees. Admin rights required.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Manage Employees</h3>
          <p className="text-sm text-muted-foreground">View and manage your company employees</p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>
                  {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                </DialogTitle>
            </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {formErrors.general && (
                  <div className="text-sm text-destructive">{formErrors.general}</div>
                )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First Name *</Label>
                  <Input
                    id="first-name"
                    value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last Name *</Label>
                  <Input
                    id="last-name"
                    value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+49 30 123456"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={form.role} onValueChange={(value) => setForm({ ...form, role: value })}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select value={form.department} onValueChange={(value) => setForm({ ...form, department: value })}>
                    <SelectTrigger id="department">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept.charAt(0).toUpperCase() + dept.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                  placeholder="Sales Manager"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="base-salary">Base Salary (€)</Label>
                  <Input
                    id="base-salary"
                    type="number"
                    value={form.base_salary}
                    onChange={(e) => setForm({ ...form, base_salary: e.target.value })}
                    placeholder="0.00"
                  />
                  {formErrors.base_salary && <div className="text-xs text-destructive">{formErrors.base_salary}</div>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hourly-rate">Hourly Rate (€)</Label>
                  <Input
                    id="hourly-rate"
                    type="number"
                    value={form.hourly_rate}
                    onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })}
                    placeholder="0.00"
                  />
                  {formErrors.hourly_rate && <div className="text-xs text-destructive">{formErrors.hourly_rate}</div>}
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setAddDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saveEmployeeMutation.isPending}
                >
                  {saveEmployeeMutation.isPending
                    ? 'Saving...'
                    : editingEmployee
                    ? 'Update Employee'
                    : 'Add Employee'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Employees Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading employees...</div>
          ) : employees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No employees found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Base Salary</TableHead>
                      <TableHead>Hourly Rate</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.full_name}</TableCell>
                      <TableCell>{employee.email || '-'}</TableCell>
                      <TableCell className="capitalize">{employee.role.replace(/_/g, ' ')}</TableCell>
                      <TableCell className="capitalize">{employee.department}</TableCell>
                        <TableCell>{employee.position || '-'}</TableCell>
                        <TableCell>€{employee.base_salary?.toLocaleString('de-DE') || '-'}</TableCell>
                        <TableCell>€{employee.hourly_rate?.toLocaleString('de-DE') || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(employee)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(employee)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Employee?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <span className="font-semibold">{employeeToDelete?.full_name}</span>?
              This action will mark the employee as inactive but won't delete their historical data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmDelete}
            disabled={deleteEmployeeMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteEmployeeMutation.isPending ? 'Removing...' : 'Remove Employee'}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
