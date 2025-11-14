import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

/**
 * Initialize keyboard shortcuts globally in the app
 * Wrapped in a component so it can use hooks
 */
export function KeyboardShortcutsProvider() {
  useKeyboardShortcuts();
  return null;
}
