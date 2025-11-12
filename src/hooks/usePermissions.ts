import { useMemo, useCallback } from 'react';
import { useRole, UserRole } from './useRole';

/**
 * Permission levels for different features
 * Granular control over who can do what
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
    sales_manager: { view: true },
    salesperson: { view: true },
    accountant: { view: true },
    hr_manager: { view: true },
    inventory_manager: { view: true },
    admin: { view: true, admin: true },
    employee: { view: true },
    customer: { view: false },
  },

  // Sales Pipeline Permissions
  sales_pipeline: {
    owner: { view: true, create: true, edit: true, delete: true, admin: true },
    sales_manager: { view: true, create: true, edit: true, delete: false },
    salesperson: { view: true, create: true, edit: true, delete: false },
    accountant: { view: true },
    hr_manager: { view: false },
    inventory_manager: { view: false },
    admin: { view: true, create: true, edit: true, delete: true, admin: true },
    employee: { view: true, create: true, edit: true, delete: false },
    customer: { view: false },
  },

  // Inventory Permissions
  inventory: {
    owner: { view: true, create: true, edit: true, delete: true, admin: true },
    sales_manager: { view: true, create: true, edit: true, delete: false },
    salesperson: { view: true, create: false, edit: false, delete: false },
    accountant: { view: true },
    hr_manager: { view: false },
    inventory_manager: { view: true, create: true, edit: true, delete: true },
    admin: { view: true, create: true, edit: true, delete: true, admin: true },
    employee: { view: true, create: true, edit: true, delete: false },
    customer: { view: true, create: false, edit: false, delete: false },
  },

  // Accounting Permissions
  accounting: {
    owner: { view: true, create: true, edit: true, delete: true, admin: true, export: true },
    sales_manager: { view: false },
    salesperson: { view: false },
    accountant: { view: true, create: true, edit: true, delete: true, export: true },
    hr_manager: { view: false },
    inventory_manager: { view: false },
    admin: { view: true, create: true, edit: true, delete: true, admin: true, export: true },
    employee: { view: false },
    customer: { view: false },
  },

  // Employees/HR Permissions
  employees: {
    owner: { view: true, create: true, edit: true, delete: true, admin: true },
    sales_manager: { view: true, create: false, edit: false, delete: false },
    salesperson: { view: false },
    accountant: { view: false },
    hr_manager: { view: true, create: true, edit: true, delete: true },
    inventory_manager: { view: false },
    admin: { view: true, create: true, edit: true, delete: true, admin: true },
    employee: { view: false },
    customer: { view: false },
  },

  // Customers Permissions
  customers: {
    owner: { view: true, create: true, edit: true, delete: true, admin: true, export: true },
    sales_manager: { view: true, create: true, edit: true, delete: false },
    salesperson: { view: true, create: true, edit: true, delete: false },
    accountant: { view: true, create: false, edit: false, delete: false },
    hr_manager: { view: false },
    inventory_manager: { view: true, create: false, edit: false, delete: false },
    admin: { view: true, create: true, edit: true, delete: true, admin: true },
    employee: { view: true, create: true, edit: true, delete: false },
    customer: { view: true, create: false, edit: true, delete: false },
  },

  // Reports Permissions
  reports: {
    owner: { view: true, create: true, edit: true, delete: true, admin: true, export: true },
    sales_manager: { view: true, create: true, edit: false, delete: false, export: true },
    salesperson: { view: true, create: false, edit: false, delete: false, export: false },
    accountant: { view: true, create: true, edit: true, delete: false, export: true },
    hr_manager: { view: true, create: true, edit: false, delete: false, export: true },
    inventory_manager: { view: true, create: true, edit: false, delete: false, export: true },
    admin: { view: true, create: true, edit: true, delete: true, admin: true, export: true },
    employee: { view: true, create: false, edit: false, delete: false, export: false },
    customer: { view: false },
  },

  // Settings Permissions
  settings: {
    owner: { view: true, edit: true, admin: true },
    sales_manager: { view: false },
    salesperson: { view: false },
    accountant: { view: false },
    hr_manager: { view: false },
    inventory_manager: { view: false },
    admin: { view: true, edit: true, admin: true },
    employee: { view: false },
    customer: { view: false },
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
