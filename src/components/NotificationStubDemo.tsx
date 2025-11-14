import { useNotifications } from './NotificationContext';
import { Button } from '@/components/ui/button';

export function NotificationStubDemo() {
  const { addNotification } = useNotifications();

  return (
    <div className="fixed bottom-4 right-4 z-[201]">
      <Button
        variant="secondary"
        onClick={() => {
          addNotification({
            type: 'info',
            title: 'Stub Notification',
            message: 'This is a sample in-app notification. Integrate with real events for production.'
          });
        }}
      >
        Trigger Test Notification
      </Button>
    </div>
  );
}
