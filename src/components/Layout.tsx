import { ReactNode } from 'react';
import { Building2, LayoutDashboard, Car, Receipt, Users, FileText, Settings, CreditCard, Package, LogOut } from 'lucide-react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Inventory', href: '/inventory', icon: Car },
  { name: 'Vehicle Sales', href: '/sales', icon: Car },
  { name: 'Customers & CRM', href: '/customers', icon: Users },
  { name: 'Expenses', href: '/expenses', icon: Receipt },
  { name: 'Banking', href: '/bank', icon: CreditCard },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, signOut, isAdmin } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate('/auth');
    }
  };

  // Filter navigation based on role
  const filteredNavigation = navigation.filter(item => {
    if (!isAdmin && item.href === '/expenses') {
      return false; // Employees can't see detailed expenses
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="mx-auto px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src="/company-logo.jpg" alt="FP Mobility Logo" className="h-10 w-auto object-contain" />
              <div>
                <h1 className="text-xl font-bold text-foreground">FP Mobility GmbH</h1>
                <p className="text-sm text-muted-foreground">Car Dealership Accounting</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{user?.email || 'User'}</p>
                <p className="text-xs text-muted-foreground capitalize">{role || 'Loading...'}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-card border-r border-border min-h-[calc(100vh-4rem)]">
          <div className="p-4">
            <ul className="space-y-2">
              {filteredNavigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}