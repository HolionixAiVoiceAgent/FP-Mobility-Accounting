import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  Clock,
  DollarSign,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { logError, ValidationError, DatabaseError } from '@/lib/errors';
import { EmployeeManagement } from '@/components/EmployeeManagement';

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
  base_salary?: number;
  commission_rate?: number;
}

interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  check_in_time: string;
  check_out_time?: string;
  status: 'present' | 'absent' | 'leave';
}

interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type: 'sick' | 'vacation' | 'personal' | 'unpaid';
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

const LEAVE_TYPES = ['sick', 'vacation', 'personal', 'unpaid'];

export default function HRM() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('employees');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [salaryDialogOpen, setSalaryDialogOpen] = useState(false);
  const [editingAttendanceId, setEditingAttendanceId] = useState<string | null>(null);

  const [attendanceForm, setAttendanceForm] = useState({
    check_in_time: new Date().toISOString().slice(0, 5),
    check_out_time: '',
    status: 'present' as const,
  });

  const [leaveForm, setLeaveForm] = useState({
    leave_type: 'vacation' as const,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    reason: '',
  });

  const [salaryForm, setSalaryForm] = useState({
    base_salary: '',
    commission_rate: '0',
  });

  // Check admin status
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await (supabase as any)
            .from('employees')
            .select('role')
            .eq('user_id', user.id)
            .single();

          setIsAdmin(data?.role === 'owner' || data?.role === 'manager' || data?.role === 'hr_manager');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };
    checkAdmin();
  }, []);

  // Fetch employees
  const { data: employees = [] } = useQuery({
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

  // Fetch attendance records
  const { data: attendanceRecords = [] } = useQuery({
    queryKey: ['attendance', selectedEmployee?.id],
    queryFn: async () => {
      if (!selectedEmployee) return [];
      const { data, error } = await (supabase as any)
        .from('employee_attendance')
        .select('*')
        .eq('employee_id', selectedEmployee.id)
        .order('date', { ascending: false })
        .limit(30);

      if (error && error.code !== 'PGRST116') throw error;
      return data || [];
    },
    enabled: !!selectedEmployee,
  });

  // Fetch leave requests
  const { data: leaveRequests = [] } = useQuery({
    queryKey: ['leave_requests', selectedEmployee?.id],
    queryFn: async () => {
      if (!selectedEmployee) return [];
      const { data, error } = await (supabase as any)
        .from('employee_leaves')
        .select('*')
        .eq('employee_id', selectedEmployee.id)
        .order('start_date', { ascending: false });

      if (error && error.code !== 'PGRST116') throw error;
      return data || [];
    },
    enabled: !!selectedEmployee,
  });

  // Fetch all attendance records for payroll calculations
  const { data: allAttendance = [] } = useQuery({
    queryKey: ['attendance', 'all'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('employee_attendance')
        .select('employee_id, date, check_in_time, check_out_time')
        .order('date', { ascending: false });

      if (error && error.code !== 'PGRST116') throw error;
      return data || [];
    },
    enabled: employees.length > 0,
  });

  // Add/Update attendance mutation (UPSERT)
  const addAttendanceMutation = useMutation({
    mutationFn: async () => {
      if (!selectedEmployee) throw new Error('No employee selected');
      
      if (!attendanceForm.check_in_time) {
        throw new Error('Check-in time is required');
      }
      
      const today = new Date().toISOString().split('T')[0];

      // First, check if record exists for today
      const { data: existingRecord, error: fetchError } = await (supabase as any)
        .from('employee_attendance')
        .select('id')
        .eq('employee_id', selectedEmployee.id)
        .eq('date', today)
        .maybeSingle();

      if (fetchError) {
        console.error('Fetch error:', fetchError);
        throw new Error(`Failed to check existing record: ${fetchError.message}`);
      }

      const attendanceData = {
        employee_id: selectedEmployee.id,
        date: today,
        check_in_time: attendanceForm.check_in_time,
        check_out_time: attendanceForm.check_out_time || null,
        status: attendanceForm.status,
        updated_at: new Date().toISOString(),
      };

      let result;
      if (existingRecord) {
        // Update existing record
        result = await (supabase as any)
          .from('employee_attendance')
          .update(attendanceData)
          .eq('id', existingRecord.id)
          .select();
        
        console.log('Update result:', result);
      } else {
        // Insert new record
        result = await (supabase as any)
          .from('employee_attendance')
          .insert([attendanceData])
          .select();
        
        console.log('Insert result:', result);
      }

      if (result.error) {
        console.error('Mutation error:', result.error);
        throw new Error(result.error.message);
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', selectedEmployee?.id] });
      toast({
        title: 'Success',
        description: 'Attendance recorded successfully',
      });
      setAttendanceDialogOpen(false);
      setAttendanceForm({
        check_in_time: new Date().toISOString().slice(0, 5),
        check_out_time: '',
        status: 'present' as const,
      });
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to record attendance';
      logError(error, {
        operation: 'addAttendance',
        employeeId: selectedEmployee?.id,
        context: 'HRM attendance recording',
      });
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  // Add leave request mutation
  const addLeaveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedEmployee) throw new Error('No employee selected');

      const { error } = await (supabase as any)
        .from('employee_leaves')
        .insert([
          {
            employee_id: selectedEmployee.id,
            leave_type: leaveForm.leave_type,
            start_date: leaveForm.start_date,
            end_date: leaveForm.end_date,
            reason: leaveForm.reason,
            status: 'pending',
          },
        ]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave_requests', selectedEmployee?.id] });
      toast({
        title: 'Success',
        description: 'Leave request submitted successfully',
      });
      setLeaveDialogOpen(false);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit leave request';
      logError(error, {
        operation: 'addLeaveRequest',
        employeeId: selectedEmployee?.id,
        context: 'HRM leave request submission',
      });
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  // Update salary mutation
  const updateSalaryMutation = useMutation({
    mutationFn: async () => {
      if (!selectedEmployee) throw new Error('No employee selected');

      const { error } = await (supabase as any)
        .from('employees')
        .update({
          base_salary: salaryForm.base_salary ? parseFloat(salaryForm.base_salary) : null,
          commission_rate: salaryForm.commission_rate ? parseFloat(salaryForm.commission_rate) : 0,
        })
        .eq('id', selectedEmployee.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({
        title: 'Success',
        description: 'Salary updated successfully',
      });
      setSalaryDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update salary',
        variant: 'destructive',
      });
      console.error('Salary update error:', error);
    },
  });

  // Delete attendance record mutation
  const deleteAttendanceMutation = useMutation({
    mutationFn: async (recordId: string) => {
      const { error } = await (supabase as any)
        .from('employee_attendance')
        .delete()
        .eq('id', recordId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', selectedEmployee?.id] });
      toast({
        title: 'Success',
        description: 'Attendance record deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete attendance record',
        variant: 'destructive',
      });
      console.error('Delete attendance error:', error);
    },
  });

  // Edit attendance record mutation
  const editAttendanceMutation = useMutation({
    mutationFn: async (recordId: string) => {
      if (!attendanceForm.check_in_time) {
        throw new Error('Check-in time is required');
      }
      
      const result = await (supabase as any)
        .from('employee_attendance')
        .update({
          check_in_time: attendanceForm.check_in_time,
          check_out_time: attendanceForm.check_out_time || null,
          status: attendanceForm.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', recordId)
        .select();

      if (result.error) {
        console.error('Edit error:', result.error);
        throw new Error(result.error.message);
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', selectedEmployee?.id] });
      toast({
        title: 'Success',
        description: 'Attendance record updated successfully',
      });
      setAttendanceDialogOpen(false);
      setAttendanceForm({
        check_in_time: new Date().toISOString().slice(0, 5),
        check_out_time: '',
        status: 'present' as const,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update attendance record',
        variant: 'destructive',
      });
      console.error('Edit attendance error:', error);
    },
  });

  if (!isAdmin) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="border-amber-200 bg-amber-50 max-w-md">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertCircle className="h-5 w-5" />
                <p>You don't have permission to access HR Management. Admin rights required.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Human Resource Management</h1>
          <p className="text-muted-foreground">Manage employees, attendance, leaves, and salaries</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="employees" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Employees</span>
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Attendance</span>
            </TabsTrigger>
            <TabsTrigger value="leaves" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Leaves</span>
            </TabsTrigger>
            <TabsTrigger value="payroll" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Payroll</span>
            </TabsTrigger>
          </TabsList>

          {/* Employees Tab - use centralized EmployeeManagement component */}
          <TabsContent value="employees" className="space-y-4">
            <div>
              {/* EmployeeManagement contains full CRUD UI for employees */}
              {/* It handles add/edit/remove and permission checks */}
              {/* Moved from Settings into HRM for centralized employee management */}
              {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
              {/* @ts-ignore */}
              <EmployeeManagement />
            </div>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Attendance Management
                </CardTitle>
                <CardDescription>Track employee check-in and check-out times</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label>Select Employee</Label>
                    <Select 
                      value={selectedEmployee?.id || ''} 
                      onValueChange={(value) => {
                        const emp = employees.find(e => e.id === value);
                        setSelectedEmployee(emp || null);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Dialog open={attendanceDialogOpen} onOpenChange={setAttendanceDialogOpen}>
                      <DialogTrigger asChild>
                        <Button disabled={!selectedEmployee}>
                          <Plus className="h-4 w-4 mr-2" />
                          Record
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Record Attendance for {selectedEmployee?.full_name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Check-In Time</Label>
                            <Input
                              type="time"
                              value={attendanceForm.check_in_time}
                              onChange={(e) => setAttendanceForm({ ...attendanceForm, check_in_time: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Check-Out Time</Label>
                            <Input
                              type="time"
                              value={attendanceForm.check_out_time}
                              onChange={(e) => setAttendanceForm({ ...attendanceForm, check_out_time: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Status</Label>
                            <Select 
                              value={attendanceForm.status}
                              onValueChange={(value: any) => setAttendanceForm({ ...attendanceForm, status: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="present">Present</SelectItem>
                                <SelectItem value="absent">Absent</SelectItem>
                                <SelectItem value="leave">On Leave</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setAttendanceDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={() => addAttendanceMutation.mutate()} disabled={addAttendanceMutation.isPending}>
                            {addAttendanceMutation.isPending ? 'Recording...' : 'Record'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {selectedEmployee && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Attendance History - {selectedEmployee.full_name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {attendanceRecords.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No attendance records found</div>
                      ) : (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Check-In</TableHead>
                                <TableHead>Check-Out</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {attendanceRecords.map((record) => {
                                const checkIn = new Date(`2024-01-01 ${record.check_in_time}`);
                                const checkOut = record.check_out_time 
                                  ? new Date(`2024-01-01 ${record.check_out_time}`)
                                  : null;
                                const duration = checkOut 
                                  ? Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60) * 10) / 10
                                  : 'N/A';

                                return (
                                  <TableRow key={record.id}>
                                    <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                                    <TableCell>{record.check_in_time}</TableCell>
                                    <TableCell>{record.check_out_time || '-'}</TableCell>
                                    <TableCell>
                                      <Badge variant={record.status === 'present' ? 'default' : 'secondary'}>
                                        {record.status}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>{duration} {duration !== 'N/A' ? 'hours' : ''}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                      <Dialog open={editingAttendanceId === record.id && attendanceDialogOpen} onOpenChange={(open) => {
                                        if (!open) setEditingAttendanceId(null);
                                        setAttendanceDialogOpen(open);
                                      }}>
                                        <DialogTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                              setEditingAttendanceId(record.id);
                                              setAttendanceForm({
                                                check_in_time: record.check_in_time,
                                                check_out_time: record.check_out_time || '',
                                                status: record.status,
                                              });
                                            }}
                                          >
                                            <Edit2 className="h-4 w-4" />
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                          <DialogHeader>
                                            <DialogTitle>Edit Attendance - {selectedEmployee?.full_name}</DialogTitle>
                                          </DialogHeader>
                                          <div className="space-y-4">
                                            <div className="space-y-2">
                                              <Label>Check-In Time</Label>
                                              <Input
                                                type="time"
                                                value={attendanceForm.check_in_time}
                                                onChange={(e) => setAttendanceForm({ ...attendanceForm, check_in_time: e.target.value })}
                                              />
                                            </div>
                                            <div className="space-y-2">
                                              <Label>Check-Out Time</Label>
                                              <Input
                                                type="time"
                                                value={attendanceForm.check_out_time}
                                                onChange={(e) => setAttendanceForm({ ...attendanceForm, check_out_time: e.target.value })}
                                              />
                                            </div>
                                            <div className="space-y-2">
                                              <Label>Status</Label>
                                              <Select 
                                                value={attendanceForm.status}
                                                onValueChange={(value: any) => setAttendanceForm({ ...attendanceForm, status: value })}
                                              >
                                                <SelectTrigger>
                                                  <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="present">Present</SelectItem>
                                                  <SelectItem value="absent">Absent</SelectItem>
                                                  <SelectItem value="leave">On Leave</SelectItem>
                                                </SelectContent>
                                              </Select>
                                            </div>
                                          </div>
                                          <DialogFooter>
                                            <Button variant="outline" onClick={() => {
                                              setAttendanceDialogOpen(false);
                                              setEditingAttendanceId(null);
                                            }}>
                                              Cancel
                                            </Button>
                                            <Button onClick={() => editAttendanceMutation.mutate(record.id)} disabled={editAttendanceMutation.isPending}>
                                              {editAttendanceMutation.isPending ? 'Updating...' : 'Update'}
                                            </Button>
                                          </DialogFooter>
                                        </DialogContent>
                                      </Dialog>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          if (confirm('Are you sure you want to delete this attendance record?')) {
                                            deleteAttendanceMutation.mutate(record.id);
                                          }
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leaves Tab */}
          <TabsContent value="leaves" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Leave Management
                </CardTitle>
                <CardDescription>Manage employee leave requests</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label>Select Employee</Label>
                    <Select 
                      value={selectedEmployee?.id || ''} 
                      onValueChange={(value) => {
                        const emp = employees.find(e => e.id === value);
                        setSelectedEmployee(emp || null);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
                      <DialogTrigger asChild>
                        <Button disabled={!selectedEmployee}>
                          <Plus className="h-4 w-4 mr-2" />
                          Request
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Leave Request for {selectedEmployee?.full_name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Leave Type</Label>
                            <Select 
                              value={leaveForm.leave_type}
                              onValueChange={(value: any) => setLeaveForm({ ...leaveForm, leave_type: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {LEAVE_TYPES.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Start Date</Label>
                              <Input
                                type="date"
                                value={leaveForm.start_date}
                                onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>End Date</Label>
                              <Input
                                type="date"
                                value={leaveForm.end_date}
                                onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Reason</Label>
                            <Input
                              value={leaveForm.reason}
                              onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                              placeholder="Reason for leave"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setLeaveDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={() => addLeaveMutation.mutate()} disabled={addLeaveMutation.isPending}>
                            {addLeaveMutation.isPending ? 'Submitting...' : 'Submit'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {selectedEmployee && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Leave Requests - {selectedEmployee.full_name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {leaveRequests.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No leave requests found</div>
                      ) : (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>End Date</TableHead>
                                <TableHead>Days</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {leaveRequests.map((leave) => {
                                const start = new Date(leave.start_date);
                                const end = new Date(leave.end_date);
                                const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

                                return (
                                  <TableRow key={leave.id}>
                                    <TableCell className="capitalize">{leave.leave_type}</TableCell>
                                    <TableCell>{start.toLocaleDateString()}</TableCell>
                                    <TableCell>{end.toLocaleDateString()}</TableCell>
                                    <TableCell>{days}</TableCell>
                                    <TableCell>
                                      <Badge variant={
                                        leave.status === 'approved' ? 'default' :
                                        leave.status === 'rejected' ? 'destructive' :
                                        'secondary'
                                      }>
                                        {leave.status}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payroll Tab */}
          <TabsContent value="payroll" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Payroll Management
                </CardTitle>
                <CardDescription>Manage employee salaries and commissions</CardDescription>
              </CardHeader>
              <CardContent>
                {employees.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No employees found</div>
                ) : (
                  <div>
                    {/* compute hours worked per employee from attendance records */}
                    {(() => {
                      const hoursByEmployee: Record<string, number> = {};
                      const parseTime = (t: string | null) => {
                        if (!t) return null;
                        const [hh, mm] = t.split(':').map((s) => parseInt(s, 10));
                        if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
                        return hh * 60 + mm;
                      };

                      (allAttendance || []).forEach((rec: any) => {
                        try {
                          const inMins = parseTime(rec.check_in_time);
                          const outMins = parseTime(rec.check_out_time);
                          if (inMins == null || outMins == null) return;
                          // handle overnight shifts
                          let diff = outMins - inMins;
                          if (diff < 0) diff += 24 * 60;
                          const hours = diff / 60;
                          hoursByEmployee[rec.employee_id] = (hoursByEmployee[rec.employee_id] || 0) + hours;
                        } catch (e) {
                          // ignore malformed records
                        }
                      });

                      return (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Base Salary</TableHead>
                                <TableHead>Hourly Rate</TableHead>
                                <TableHead>Earned So Far</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {employees.map((employee) => {
                                const hours = hoursByEmployee[employee.id] || 0;
                                // determine hourly rate: prefer explicit hourly_rate, else derive from base_salary/160
                                let hourly = employee.hourly_rate ?? null;
                                if (!hourly && employee.base_salary) {
                                  const parsed = parseFloat(employee.base_salary as any);
                                  hourly = Number.isFinite(parsed) ? parsed / 160 : 0;
                                }
                                const earned = (hourly || 0) * hours;

                                return (
                                  <TableRow key={employee.id}>
                                    <TableCell className="font-medium">{employee.full_name}</TableCell>
                                    <TableCell className="capitalize">{employee.department}</TableCell>
                                    <TableCell>€{employee.base_salary?.toLocaleString('de-DE') || '-'}</TableCell>
                                    <TableCell>€{(employee.hourly_rate ?? (employee.base_salary ? (employee.base_salary / 160) : 0))?.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                    <TableCell>€{earned.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                    <TableCell className="text-right">
                                      <Dialog open={salaryDialogOpen && selectedEmployee?.id === employee.id} onOpenChange={setSalaryDialogOpen}>
                                        <DialogTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                              setSelectedEmployee(employee);
                                              setSalaryForm({
                                                base_salary: employee.base_salary?.toString() || '',
                                                commission_rate: employee.commission_rate?.toString() || '0',
                                              });
                                            }}
                                          >
                                            <Edit2 className="h-4 w-4" />
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                          <DialogHeader>
                                            <DialogTitle>Update Salary - {employee.full_name}</DialogTitle>
                                          </DialogHeader>
                                          <div className="space-y-4">
                                            <div className="space-y-2">
                                              <Label>Base Salary (€)</Label>
                                              <Input
                                                type="number"
                                                value={salaryForm.base_salary}
                                                onChange={(e) => setSalaryForm({ ...salaryForm, base_salary: e.target.value })}
                                                placeholder="0.00"
                                              />
                                            </div>
                                            <div className="space-y-2">
                                              <Label>Commission Rate (%)</Label>
                                              <Input
                                                type="number"
                                                value={salaryForm.commission_rate}
                                                onChange={(e) => setSalaryForm({ ...salaryForm, commission_rate: e.target.value })}
                                                placeholder="0"
                                              />
                                            </div>
                                          </div>
                                          <DialogFooter>
                                            <Button variant="outline" onClick={() => setSalaryDialogOpen(false)}>
                                              Cancel
                                            </Button>
                                            <Button onClick={() => updateSalaryMutation.mutate()} disabled={updateSalaryMutation.isPending}>
                                              {updateSalaryMutation.isPending ? 'Updating...' : 'Update'}
                                            </Button>
                                          </DialogFooter>
                                        </DialogContent>
                                      </Dialog>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
