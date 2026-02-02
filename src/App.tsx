import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { NotificationProvider } from "@/components/NotificationContext";
import { NotificationCenter } from "@/components/NotificationCenter";
import { NotificationStubDemo } from "@/components/NotificationStubDemo";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { MobileMenuToggle } from "@/components/MobileMenuToggle";
import { SearchCommandPalette } from "@/components/SearchCommandPalette";
import { KeyboardShortcutsProvider } from "@/components/KeyboardShortcutsProvider";
import { HelpDialog } from "@/components/HelpDialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Inventory from "./pages/Inventory";
import VehicleSales from "./pages/VehicleSales";
import Customers from "./pages/Customers";
import Expenses from "./pages/Expenses";
import BankIntegration from "./pages/BankIntegration";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import FinancialObligations from "./pages/FinancialObligations";
import VehiclePurchases from "./pages/VehiclePurchases";
import HRM from "./pages/HRM";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Optimized QueryClient configuration for real-time data updates
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Reduce staleTime for dashboard and metrics to enable frequent refetches
      staleTime: 5000, // 5 seconds - data is considered stale after this
      gcTime: 10 * 60 * 1000, // 10 minutes - garbage collection time
      refetchInterval: 5000, // Actively refetch every 5 seconds for dashboard
      refetchOnWindowFocus: true, // Refetch when user returns to window
      refetchOnReconnect: true, // Refetch when connection is restored
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class">
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <NotificationProvider>
        <NotificationCenter />
        <NotificationStubDemo />
        <PWAInstallPrompt />
        <MobileMenuToggle />
        <BrowserRouter>
          <SearchCommandPalette />
          <KeyboardShortcutsProvider />
          <HelpDialog />
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
            <Route path="/sales" element={<ProtectedRoute><VehicleSales /></ProtectedRoute>} />
            <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
            <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
            <Route path="/bank" element={<ProtectedRoute><BankIntegration /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/obligations" element={<ProtectedRoute><FinancialObligations /></ProtectedRoute>} />
            <Route path="/purchases" element={<ProtectedRoute><VehiclePurchases /></ProtectedRoute>} />
            <Route path="/hrm" element={<ProtectedRoute><HRM /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
