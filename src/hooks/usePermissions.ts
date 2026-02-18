import { useMemo, useCallback } from 'react';
import { useRole, UserRole } from './useRole';

/**
 * Permission levels for different features
 * Supports 'owner', 'admin', and 'employee' roles
 */
export interface Permission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export?: boolean;
  admin?: boolean;
}

interface PermissionMatrix {
  [key: string]: {
    [key in UserRole]?: Partial<Permission>;
  };
}

// Complete RBAC permission matrix
const PERMISSION_MATRIX: PermissionMatrix = {
  // Dashboard Permissions
  dashboard: {
    owner: { view: true, admin: true },
    admin: { view: true, admin: true },
    employee: { view: true },
  },

  // Sales Pipeline Permissions
  sales_pipeline: {
    owner: { view: true, create: true, edit: true, delete: true, admin: true },
    admin: { view: true, create: true, edit: true, delete: true, admin: true },
    employee: { view: true, create: true, edit: true, delete: false },
  },

  // Inventory Permissions
  inventory: {
    owner: { view: true, create: true, edit: true, delete: true, admin: true },
    admin: { view: true, create: true, edit: true, delete: true, admin: true },
    employee: { view: true, create: true, edit: true, delete: false },
  },

  // Accounting Permissions
  accounting: {
    owner: { view: true, create: true, edit: true, delete: true, admin: true, export: true },
    admin: { view: true, create: true, edit: true, delete: true, admin: true, export: true },
    employee: { view: false },
  },

  // Employees/HR Permissions
  employees: {
    owner: { view: true, create: true, edit: true, delete: true, admin: true },
    admin: { view: true, create: true, edit: true, delete: true, admin: true },
    employee: { view: false },
  },

  // Customers Permissions
  customers: {
    owner: { view: true, create: true, edit: true, delete: true, admin: true, export: true },
    admin: { view: true, create: true, edit: true, delete: true, admin: true, export: true },
    employee: { view: true, create: true, edit: true, delete: false },
  },

  // Reports Permissions
  reports: {
    owner: { view: true, create: true, edit: true, delete: true, admin: true, export: true },
    admin: { view: true, create: true, edit: true, delete: true, admin: true, export: true },
    employee: { view: true, create: false, edit: false, delete: false, export: false },
  },

  // Settings Permissions
  settings: {
    owner: { view: true, edit: true, admin: true },
    admin: { view: true, edit: true, admin: true },
    employee: { view: false },
  },
};

/**
 * Hook to check permissions for the current user
 * Usage: const { can, canView, canCreate, canEdit, canDelete } = usePermissions();
 * Then: if (canView('inventory')) { ... }
 */
export const usePermissions = () => {
  const { role, loading } = useRole();

  // Get permission object for a feature
  const getPermission = useCallback((feature: string): Permission => {
    const featurePerms = PERMISSION_MATRIX[feature];
    if (!featurePerms || !role) {
      return { view: false, create: false, edit: false, delete: false };
    }

    const rolePerms = featurePerms[role] || {};
    return {
      view: rolePerms.view ?? false,
      create: rolePerms.create ?? false,
      edit: rolePerms.edit ?? false,
      delete: rolePerms.delete ?? false,
      export: rolePerms.export ?? false,
      admin: rolePerms.admin ?? false,
    };
  }, [role]);

  // Check if user can perform an action on a feature
  const can = useCallback((action: 'view' | 'create' | 'edit' | 'delete' | 'export' | 'admin', feature: string): boolean => {
    const perm = getPermission(feature);
    return perm[action as keyof Permission] ?? false;
  }, [getPermission]);

  // Convenience methods
  const canView = useCallback((feature: string) => can('view', feature), [can]);
  const canCreate = useCallback((feature: string) => can('create', feature), [can]);
  const canEdit = useCallback((feature: string) => can('edit', feature), [can]);
  const canDelete = useCallback((feature: string) => can('delete', feature), [can]);
  const canExport = useCallback((feature: string) => can('export', feature), [can]);
  const isAdmin = useCallback((feature: string) => can('admin', feature), [can]);

  // Check multiple features
  const canViewAny = useCallback((features: string[]) => {
    return features.some(f => canView(f));
  }, [canView]);

  const canEditAny = useCallback((features: string[]) => {
    return features.some(f => canEdit(f));
  }, [canEdit]);

  return {
    role,
    loading,
    can,
    canView,
    canCreate,
    canEdit,
    canDelete,
    canExport,
    isAdmin,
    canViewAny,
    canEditAny,
    getPermission,
  };
};

