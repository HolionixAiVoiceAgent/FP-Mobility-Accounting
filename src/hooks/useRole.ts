import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type UserRole = 
  | 'owner' 
  | 'sales_manager' 
  | 'salesperson' 
  | 'accountant' 
  | 'hr_manager' 
  | 'inventory_manager' 
  | 'customer'
  | 'admin'
  | 'employee'
  | null;

export interface UserRoleData {
  user_id: string;
  role: UserRole;
  department?: string;
  is_active: boolean;
  permissions?: string[];
}

/**
 * Hook to get and manage user role information
 * Works with both legacy user_roles table and new employees table
 * After deploying Phase 1 database migration, this will fetch from employees table
 */
export const useRole = () => {
  const { user, loading: authLoading, role: legacyRole } = useAuth();
  const [roleData, setRoleData] = useState<UserRoleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserRole = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch from new employees table (after Phase 1 deployment)
      // For now, fall back to legacy user_roles table
      const { data: employeeData, error: employeeError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (employeeData) {
        const role = employeeData.role as UserRole;
        setRoleData({
          user_id: userId,
          role: role || legacyRole || 'customer',
          is_active: true,
        });
      } else if (!employeeError) {
        // Fallback to legacy role from useAuth
        setRoleData({
          user_id: userId,
          role: legacyRole || 'customer',
          is_active: true,
        });
      } else {
        // No role found, default to customer
        setRoleData({
          user_id: userId,
          role: 'customer',
          is_active: true,
        });
      }
    } catch (err) {
      console.error('Error fetching user role:', err);
      // Fallback to legacy role
      setRoleData({
        user_id: userId,
        role: legacyRole || 'customer',
        is_active: true,
      });
    } finally {
      setLoading(false);
    }
  }, [legacyRole]);

  useEffect(() => {
    if (user && !authLoading) {
      fetchUserRole(user.id);
    } else if (!user && !authLoading) {
      setRoleData(null);
      setLoading(false);
    }
  }, [user, authLoading, fetchUserRole]);

  const hasRole = useCallback((roles: UserRole | UserRole[]): boolean => {
    if (!roleData) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(roleData.role);
  }, [roleData]);

  const isOwner = useCallback(() => hasRole('owner'), [hasRole]);
  const isSalesManager = useCallback(() => hasRole('sales_manager'), [hasRole]);
  const isSalesperson = useCallback(() => hasRole('salesperson'), [hasRole]);
  const isAccountant = useCallback(() => hasRole('accountant'), [hasRole]);
  const isHRManager = useCallback(() => hasRole('hr_manager'), [hasRole]);
  const isInventoryManager = useCallback(() => hasRole('inventory_manager'), [hasRole]);
  const isCustomer = useCallback(() => hasRole('customer'), [hasRole]);

  return {
    user,
    roleData,
    role: roleData?.role || null,
    department: roleData?.department,
    isActive: roleData?.is_active ?? false,
    loading: authLoading || loading,
    error,
    
    // Role checkers
    hasRole,
    isOwner,
    isSalesManager,
    isSalesperson,
    isAccountant,
    isHRManager,
    isInventoryManager,
    isCustomer,
    
    // Utility
    refetch: () => user && fetchUserRole(user.id),
  };
};
