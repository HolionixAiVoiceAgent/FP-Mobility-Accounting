import { useEffect, useState } from 'react';
import { Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowPrompt(false);
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-40 p-4 bg-primary text-primary-foreground md:max-w-sm md:left-auto">
      <div className="flex items-start gap-3">
        <Smartphone className="h-5 w-5 mt-1 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-semibold text-sm">Install FP Mobility</p>
          <p className="text-xs opacity-90 mt-1">Get quick access to your dealership dashboard from any device.</p>
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={handleInstall} className="text-xs">
              Install
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDismiss} className="text-xs">
              Later
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
