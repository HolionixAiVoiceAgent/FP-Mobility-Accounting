import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { KEYBOARD_SHORTCUTS } from '@/hooks/useKeyboardShortcuts';
import { Search, Keyboard, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HelpDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function HelpDialog({ open: externalOpen, onOpenChange: externalOnOpenChange }: HelpDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;

  // Keyboard shortcut Cmd+? to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === '?') {
        e.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setOpen]);

  // Filter shortcuts based on search
  const filteredShortcuts = Object.entries(KEYBOARD_SHORTCUTS).filter(([key, value]) => {
    const query = searchQuery.toLowerCase();
    return (
      key.toLowerCase().includes(query) ||
      value.description.toLowerCase().includes(query) ||
      value.action.toLowerCase().includes(query)
    );
  });

  const getKeyDisplay = (shortcut: string) => {
    const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
    return shortcut
      .toUpperCase()
      .replace('CMD', isMac ? '⌘' : 'Ctrl')
      .replace('+', ' + ');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            <div>
              <DialogTitle>Keyboard Shortcuts & Help</DialogTitle>
              <DialogDescription>
                Master the platform with keyboard shortcuts (Cmd+? to open anytime)
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex items-center gap-2 mb-4">
          <Search className="w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search shortcuts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
        </div>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-3">
            {filteredShortcuts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No shortcuts found matching "{searchQuery}"</p>
              </div>
            ) : (
              filteredShortcuts.map(([shortcut, { description, action }]) => (
                <div
                  key={shortcut}
                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <Badge
                      variant="outline"
                      className={cn(
                        'font-mono text-xs whitespace-nowrap',
                        'bg-gray-900 text-white border-0'
                      )}
                    >
                      {getKeyDisplay(shortcut)}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{description}</p>
                    <p className="text-xs text-gray-500 mt-1">{action}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="border-t mt-4 pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Navigation</h4>
              <ul className="space-y-1 text-gray-600 text-xs">
                <li>• Cmd+D: Dashboard</li>
                <li>• Cmd+I: Inventory</li>
                <li>• Cmd+C: Customers</li>
                <li>• Cmd+B: Bank</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">General</h4>
              <ul className="space-y-1 text-gray-600 text-xs">
                <li>• Cmd+K: Search</li>
                <li>• Cmd+?: Help</li>
                <li>• ESC: Close dialogs</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t mt-4 pt-4 text-center">
          <p className="text-xs text-gray-500">
            💡 Tip: Use these shortcuts to work faster. Press Cmd+? anytime to return here.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
