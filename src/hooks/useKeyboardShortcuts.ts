import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

export interface KeyboardShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  callback: () => void;
  description: string;
  isEnabled?: boolean;
}

export interface KeyboardShortcutMap {
  'cmd+k': string; // Global search
  'cmd+n': string; // New item (context-aware)
  'cmd+s': string; // Save
  'cmd+enter': string; // Submit
  'cmd+?': string; // Help
  'cmd+b': string; // Bank
  'cmd+i': string; // Inventory
  'cmd+c': string; // Customers
  'cmd+d': string; // Dashboard
  'cmd+z': string; // Undo
  'cmd+y': string; // Redo
}

export const KEYBOARD_SHORTCUTS: Record<string, { description: string; action: string }> = {
  'cmd+k': {
    description: 'Global search - find any vehicle, customer, sale, or expense',
    action: 'Open search palette',
  },
  'cmd+n': {
    description: 'New item - create vehicle, customer, sale (context-aware)',
    action: 'Open new dialog',
  },
  'cmd+s': {
    description: 'Save - save current form or dialog',
    action: 'Save',
  },
  'cmd+enter': {
    description: 'Submit - submit dialog/form',
    action: 'Submit',
  },
  'cmd+?': {
    description: 'Help - open keyboard shortcuts guide',
    action: 'Open help',
  },
  'cmd+b': {
    description: 'Navigate to bank integration',
    action: 'Navigate to /bank',
  },
  'cmd+i': {
    description: 'Navigate to inventory',
    action: 'Navigate to /inventory',
  },
  'cmd+c': {
    description: 'Navigate to customers',
    action: 'Navigate to /customers',
  },
  'cmd+d': {
    description: 'Navigate to dashboard',
    action: 'Navigate to /',
  },
  'cmd+z': {
    description: 'Undo last action',
    action: 'Undo (not yet implemented)',
  },
  'cmd+y': {
    description: 'Redo last action',
    action: 'Redo (not yet implemented)',
  },
};

export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger if typing in input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        // Except for Escape, which should always work
        if (e.key !== 'Escape') {
          return;
        }
      }

      const isMeta = e.metaKey || e.ctrlKey;

      // Cmd+B: Navigate to Bank
      if (isMeta && e.key === 'b') {
        e.preventDefault();
        navigate('/bank');
      }

      // Cmd+I: Navigate to Inventory
      if (isMeta && e.key === 'i') {
        e.preventDefault();
        navigate('/inventory');
      }

      // Cmd+C: Navigate to Customers
      if (isMeta && e.key === 'c') {
        e.preventDefault();
        navigate('/customers');
      }

      // Cmd+D: Navigate to Dashboard
      if (isMeta && e.key === 'd') {
        e.preventDefault();
        navigate('/');
      }

      // Cmd+S: Save (show in toast, actual behavior handled by form)
      if (isMeta && e.key === 's') {
        e.preventDefault();
        // This will be handled by individual forms
      }

      // Cmd+Z: Undo (stub for now)
      if (isMeta && e.key === 'z') {
        e.preventDefault();
        // Undo handler will be implemented in Phase 2
      }

      // Cmd+Y: Redo (stub for now)
      if (isMeta && e.key === 'y') {
        e.preventDefault();
        // Redo handler will be implemented in Phase 2
      }
    },
    [navigate, toast]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    shortcuts: KEYBOARD_SHORTCUTS,
  };
}

// Hook to check if a keyboard shortcut is available
export function useIsShortcutAvailable(
  key: string,
  isEnabled: boolean = true
): boolean {
  return isEnabled && KEYBOARD_SHORTCUTS.hasOwnProperty(key.toLowerCase());
}
