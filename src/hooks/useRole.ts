import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// Support 'owner', 'admin', and 'employee' roles
export type UserRole = 
  | 'owner' 
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
// Demo user IDs for detection
const DEMO_USER_IDS = ['demo-admin-id', 'demo-employee-id', 'demo-fallback-id'];

export const useRole = () => {
  const { user, loading: authLoading, role: legacyRole } = useAuth();
  const [roleData, setRoleData] = useState<UserRoleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is a demo user by their ID (use the userId directly in fetch to avoid stale closure)
  const isDemoUser = user ? DEMO_USER_IDS.includes(user.id) : false;

  const fetchUserRole = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('[useRole] Fetching role for userId:', userId);

      // Check if this is a demo user by ID directly
      const userIsDemoUser = DEMO_USER_IDS.includes(userId);
      console.log('[useRole] Is demo user:', userIsDemoUser);

      // If in demo mode (demo user ID), use the legacy role directly without querying database
      if (userIsDemoUser) {
        console.log('[useRole] Using demo mode with role:', legacyRole || 'owner');
        setRoleData({
          user_id: userId,
          role: legacyRole || 'owner',
          is_active: true,
        });
        setLoading(false);
        return;
      }

      // Try to fetch from user_roles table (for real Supabase users)
      console.log('[useRole] Querying user_roles table...');
      const { data: employeeData, error: employeeError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      console.log('[useRole] Query result:', { employeeData, employeeError });

      if (employeeData) {
        const role = employeeData.role as UserRole;
        setRoleData({
          user_id: userId,
          role: role || legacyRole || 'employee',
          is_active: true,
        });
      } else if (!employeeError) {
        // Fallback to legacy role from useAuth
        setRoleData({
          user_id: userId,
          role: legacyRole || 'employee',
          is_active: true,
        });
      } else {
        // No role found, default to employee
        setRoleData({
          user_id: userId,
          role: 'employee',
          is_active: true,
        });
      }
    } catch (err) {
      console.error('[useRole] Error fetching user role:', err);
      // Fallback to legacy role
      setRoleData({
        user_id: userId,
        role: legacyRole || 'employee',
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
  const isAdmin = useCallback(() => hasRole(['owner', 'admin']), [hasRole]);
  const isEmployee = useCallback(() => hasRole('employee'), [hasRole]);

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
    isAdmin,
    isEmployee,
    
    // Utility
    refetch: () => user && fetchUserRole(user.id),
  };
};

