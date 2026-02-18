import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface BulkDeleteDialogProps {
  type: 'inventory' | 'customers' | 'expenses' | 'sales' | 'all';
  onDeleteComplete: () => void;
}

export function BulkDeleteDialog({ type, onDeleteComplete }: BulkDeleteDialogProps) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  // Show disabled button with lock icon for non-admins instead of hiding
  if (!isAdmin) {
    return (
      <Button variant="outline" size="sm" disabled title="Only admins can delete all items">
        <Lock className="mr-2 h-4 w-4" />
        {type === 'all' ? 'Clear All Data' : `Delete All ${type}`}
      </Button>
    );
  }

  const handleDelete = async () => {
    setDeleting(true);

    try {
      if (type === 'all') {
        // Delete in order to respect foreign key constraints
        await supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('vehicle_sales').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('expenses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('inventory').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        
        toast({
          title: "Success",
          description: "All data deleted successfully!",
        });
      } else {
        const tableName = type === 'sales' ? 'vehicle_sales' : type;
        const { error } = await supabase.from(tableName).delete().neq('id', '00000000-0000-0000-0000-000000000000');
        
        if (error) throw error;

        toast({
          title: "Success",
          description: `All ${type} deleted successfully!`,
        });
      }

      setOpen(false);
      onDeleteComplete();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const getTitle = () => {
    if (type === 'all') return 'Delete All Data';
    return `Delete All ${type.charAt(0).toUpperCase() + type.slice(1)}`;
  };

  const getDescription = () => {
    if (type === 'all') {
      return 'This will permanently delete ALL data including inventory, sales, expenses, customers, and payments. This action cannot be undone.';
    }
    return `This will permanently delete all ${type} from the database. This action cannot be undone.`;
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="mr-2 h-4 w-4" />
          {type === 'all' ? 'Clear All Data' : `Delete All ${type}`}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{getTitle()}</AlertDialogTitle>
          <AlertDialogDescription>
            {getDescription()}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
