import { useNotifications } from './NotificationContext';
import { X } from 'lucide-react';

export function NotificationCenter() {
  const { notifications, markAsRead, clearAll } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[200] w-96 max-w-full bg-white border border-border rounded-lg shadow-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted">
        <span className="font-semibold">Notifications</span>
        <button className="text-xs text-muted-foreground hover:underline" onClick={clearAll}>
          Clear All
        </button>
      </div>
      <ul className="max-h-96 overflow-y-auto divide-y divide-border">
        {notifications.map((n) => (
          <li key={n.id} className={`flex items-start gap-3 px-4 py-3 ${n.read ? 'opacity-60' : ''}`}>
            <div className={`mt-1 h-2 w-2 rounded-full ${n.type === 'success' ? 'bg-green-500' : n.type === 'error' ? 'bg-red-500' : n.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
            <div className="flex-1">
              <div className="font-medium text-sm">{n.title}</div>
              <div className="text-xs text-muted-foreground">{n.message}</div>
              {n.timestamp && (
                <div className="text-[10px] text-muted-foreground mt-1">{n.timestamp.toLocaleTimeString()}</div>
              )}
            </div>
            <button className="ml-2 p-1 text-muted-foreground hover:text-foreground" onClick={() => markAsRead(n.id)}>
              <X className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
