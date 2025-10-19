import { Button } from "@/components/ui/button";
import { Link as LinkIcon, Loader2 } from "lucide-react";
import { useTinkAccounts } from "@/hooks/useTinkAccounts";

export const TinkConnectButton = () => {
  const { createLink } = useTinkAccounts();

  return (
    <Button
      onClick={() => createLink.mutate()}
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
  );
};
