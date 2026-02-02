import { useEffect, useState, useCallback, useRef } from 'react';
import { useGlobalSearch, useSearchHistory, type SearchResult } from '@/hooks/useGlobalSearch';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import {
  Car,
  Users,
  Zap,
  TrendingUp,
  Clock,
  Search,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchCommandPaletteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SearchCommandPalette({
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: SearchCommandPaletteProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;

  const { results, loading, clear: clearSearch, search: performSearch } = useGlobalSearch();
  const { getHistory, addToHistory, clearHistory } = useSearchHistory();
  const [history, setHistory] = useState<Array<{ query: string; timestamp: number }>>([]);

  // Load history on mount
  useEffect(() => {
    setHistory(getHistory());
  }, [getHistory]);

  // Keyboard shortcut Cmd+K / Ctrl+K to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(!open);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, setOpen]);

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  // Handle search input
  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    setSelectedIndex(0);
  }, []);

  // Search on query change
  useEffect(() => {
    if (query.trim()) {
      performSearch(query);
    } else {
      clearSearch();
    }
  }, [query, clearSearch, performSearch]);

  // Display history if no query
  const displayResults = query.trim() ? results : history.slice(0, 5);
  const showHistory = !query.trim() && history.length > 0;

  // Handle selection
  const handleSelect = (result: SearchResult) => {
    // Add to history
    addToHistory({ query: result.title, timestamp: Date.now() });

    // Navigate based on type
    switch (result.type) {
      case 'vehicle': {
        navigate(`/inventory`, { state: { selectedVehicleId: result.id } });
        break;
      }
      case 'customer': {
        navigate(`/customers`, { state: { selectedCustomerId: result.id } });
        break;
      }
      case 'sale': {
        navigate(`/sales`, { state: { selectedSaleId: result.id } });
        break;
      }
      case 'expense': {
        navigate(`/expenses`, { state: { selectedExpenseId: result.id } });
        break;
      }
      case 'purchase': {
        navigate(`/purchases`, { state: { selectedPurchaseId: result.id } });
        break;
      }
    }

    setOpen(false);
    clearSearch();
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < displayResults.length - 1 ? prev + 1 : prev
        );
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      }
      case 'Enter': {
        e.preventDefault();
        const selected = displayResults[selectedIndex];
        if (selected && 'type' in selected && 'id' in selected) {
          handleSelect(selected as SearchResult);
        }
        break;
      }
      case 'Escape': {
        e.preventDefault();
        setOpen(false);
        break;
      }
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'vehicle':
        return <Car className="w-4 h-4 text-blue-500" />;
      case 'customer':
        return <Users className="w-4 h-4 text-green-500" />;
      case 'sale':
        return <TrendingUp className="w-4 h-4 text-purple-500" />;
      case 'expense':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'purchase':
        return <Car className="w-4 h-4 text-indigo-500" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-full max-w-2xl p-0 shadow-lg">
        <DialogHeader className="border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-400" />
            <Input
              ref={inputRef}
              placeholder="Search vehicles, customers, sales, expenses... (Cmd+K)"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="border-0 focus-visible:ring-0 placeholder:text-gray-500"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            ↑↓ Navigate • ↵ Select • ESC Close
          </p>
        </DialogHeader>

        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <div className="p-4 space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          )}

          {!loading && displayResults.length === 0 && (
            <div className="p-8 text-center">
              {showHistory ? (
                <>
                  <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No recent searches</p>
                </>
              ) : (
                <>
                  <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No results found</p>
                </>
              )}
            </div>
          )}

          {!loading &&
            displayResults.length > 0 && (
              <div className="divide-y">
                {/* Section header for history */}
                {showHistory && (
                  <div className="px-4 py-2 flex items-center justify-between bg-gray-50">
                    <p className="text-xs font-semibold text-gray-600">Recent Searches</p>
                    <button
                      onClick={() => {
                        clearHistory();
                        setHistory([]);
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear
                    </button>
                  </div>
                )}

                {displayResults.map((result: any, index: number) => (
                  <button
                    key={`${result.id || result.query}-${index}`}
                    onClick={() => {
                      if ('type' in result && 'id' in result) {
                        handleSelect(result as SearchResult);
                      }
                    }}
                    className={cn(
                      'w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between',
                      selectedIndex === index && 'bg-blue-50'
                    )}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 mt-1">
                        {typeof result === 'string'
                          ? getIcon('search')
                          : getIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        {typeof result === 'string' ? (
                          <>
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {result}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDistanceToNow(
                                new Date((result as any).timestamp),
                                {
                                  addSuffix: true,
                                }
                              )}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {result.title}
                            </p>
                            {result.subtitle && (
                              <p className="text-xs text-gray-500 truncate">
                                {result.subtitle}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      {!showHistory && (
                        <Badge variant="outline" className="text-xs">
                          {typeof result === 'string' ? 'Recent' : getTypeLabel(result.type)}
                        </Badge>
                      )}
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
            )}
        </div>

        <div className="border-t px-4 py-2 bg-gray-50 text-xs text-gray-600">
          💡 Tip: Type at least 2 characters to search, or browse recent searches above
        </div>
      </DialogContent>
    </Dialog>
  );
}
