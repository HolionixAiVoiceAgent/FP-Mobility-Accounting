import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionGuardProps {
  feature: string;
  action?: 'view' | 'create' | 'edit' | 'delete' | 'export' | 'admin';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component to conditionally render content based on user permissions
 * Usage:
 * <PermissionGuard feature="inventory" action="edit">
 *   <EditInventoryButton />
 * </PermissionGuard>
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  feature,
  action = 'view',
  children,
  fallback = null,
}) => {
  const { can, loading } = usePermissions();

  if (loading) {
    return null; // Or loading spinner
  }

  if (can(action, feature)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

interface RoleGuardProps {
  roles: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component to conditionally render content based on user role
 * Usage:
 * <RoleGuard roles={['owner', 'sales_manager']}>
 *   <ManagerDashboard />
 * </RoleGuard>
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  roles,
  children,
  fallback = null,
}) => {
  const { role, loading } = usePermissions();

  if (loading) {
    return null;
  }

  const roleArray = Array.isArray(roles) ? roles : [roles];
  
  if (roleArray.includes(role || '')) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  feature: string;
  action?: 'view' | 'create' | 'edit' | 'delete' | 'export' | 'admin';
  children: React.ReactNode;
}

/**
 * Button component that auto-disables based on permissions
 * Usage:
 * <PermissionButton feature="inventory" action="delete" onClick={handleDelete}>
 *   Delete Vehicle
 * </PermissionButton>
 */
export const PermissionButton: React.FC<ActionButtonProps> = ({
  feature,
  action = 'view',
  children,
  disabled = false,
  ...props
}) => {
  const { can, loading } = usePermissions();
  const hasPermission = can(action, feature);

  return (
    <button
      disabled={disabled || !hasPermission || loading}
      title={!hasPermission ? `You don't have permission to ${action} this item` : undefined}
      {...props}
    >
      {children}
    </button>
  );
};
