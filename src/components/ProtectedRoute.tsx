import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  
  console.log('[ProtectedRoute] State:', { user: user?.id, loading });

  if (loading) {
    console.log('[ProtectedRoute] Loading - showing spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('[ProtectedRoute] No user - redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  console.log('[ProtectedRoute] User authenticated - rendering children');
  return <>{children}</>;
}
