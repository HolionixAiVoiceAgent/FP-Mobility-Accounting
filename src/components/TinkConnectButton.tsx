import { Button } from "@/components/ui/button";
import { Link as LinkIcon, Loader2, AlertCircle } from "lucide-react";
import { useTinkAccounts } from "@/hooks/useTinkAccounts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";

export const TinkConnectButton = () => {
  const { createLink } = useTinkAccounts();
  const [showError, setShowError] = useState(false);

  const handleClick = () => {
    setShowError(false);
    createLink.mutate(undefined, {
      onError: () => {
        setShowError(true);
      }
    });
  };

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={createLink.isPending}
        className="gap-2"
      >
        {createLink.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Opening Tink Link...
          </>
        ) : (
          <>
            <LinkIcon className="h-4 w-4" />
            Connect Bank Account
          </>
        )}
      </Button>
      {showError && createLink.error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-semibold mb-2">Bank Connection Error</p>
            <p className="text-sm mb-2">
              {createLink.error instanceof Error ? createLink.error.message : 'Unknown error'}
            </p>
            <p className="text-xs text-muted-foreground">
              See <strong>TINK_SETUP_GUIDE.md</strong> in the project root for setup instructions.
            </p>
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};
