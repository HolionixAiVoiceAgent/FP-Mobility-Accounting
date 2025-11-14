# Tink Bank Integration Route - Step by Step

## Problem
Settings → Security & Access → Bank Integration section has a "Configure" button that links to `/bank-integration`, but this route is not defined in App.tsx, resulting in a 404 error.

## Solution
Add the missing route to your React Router configuration.

---

## Step 1: Locate Your Routes in App.tsx

Open: `src/App.tsx`

Find the section that looks like this:
```tsx
<Routes>
  <Route path="/" element={<Index />} />
  <Route path="/inventory" element={<Inventory />} />
  <Route path="/expenses" element={<Expenses />} />
  {/* more routes... */}
</Routes>
```

---

## Step 2: Import BankIntegration Page

At the top of `src/App.tsx`, in the imports section, add:

```tsx
import BankIntegration from '@/pages/BankIntegration';
```

Your imports should look something like:
```tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import Inventory from '@/pages/Inventory';
import Expenses from '@/pages/Expenses';
import Customers from '@/pages/Customers';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import BankIntegration from '@/pages/BankIntegration';  // ADD THIS LINE
import VehicleSales from '@/pages/VehicleSales';
import VehiclePurchases from '@/pages/VehiclePurchases';
// ... more imports
```

---

## Step 3: Add the Route

Inside your `<Routes>` component, add this line:

```tsx
<Route path="/bank-integration" element={<BankIntegration />} />
```

**Best practice:** Add it near the Settings route since it's related:

```tsx
<Routes>
  <Route path="/" element={<Index />} />
  <Route path="/inventory" element={<Inventory />} />
  <Route path="/expenses" element={<Expenses />} />
  <Route path="/customers" element={<Customers />} />
  <Route path="/vehicle-sales" element={<VehicleSales />} />
  <Route path="/vehicle-purchases" element={<VehiclePurchases />} />
  <Route path="/financial-obligations" element={<FinancialObligations />} />
  <Route path="/reports" element={<Reports />} />
  <Route path="/settings" element={<Settings />} />
  <Route path="/bank-integration" element={<BankIntegration />} />  {/* ADD THIS */}
  <Route path="*" element={<NotFound />} />
</Routes>
```

---

## Step 4: Save and Test

1. Save `src/App.tsx` file (Ctrl+S)
2. Check for any TypeScript errors
3. Go to Settings page in the app
4. Scroll to "Security & Access" section
5. Find "Bank Integration" card
6. Click "Configure" button
7. Should navigate to `/bank-integration` without 404 error

---

## Verification

### If It Works ✅
- You see the BankIntegration page
- URL shows: `http://localhost:8080/bank-integration` (or your domain)
- No 404 error
- No console errors

### If It Doesn't Work ❌
- Page still shows 404
- Check browser console (F12 → Console) for errors
- Verify import statement is correct
- Verify route is inside <Routes> component
- Try refreshing the page (F5)

---

## Complete Code Example

If you want to see what a complete Routes section might look like:

```tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';

// Pages
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Inventory from '@/pages/Inventory';
import Customers from '@/pages/Customers';
import Expenses from '@/pages/Expenses';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import BankIntegration from '@/pages/BankIntegration';  // ← ADD THIS
import VehicleSales from '@/pages/VehicleSales';
import VehiclePurchases from '@/pages/VehiclePurchases';
import FinancialObligations from '@/pages/FinancialObligations';
import NotFound from '@/pages/NotFound';
import HRM from '@/pages/HRM';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Router>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
              <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
              <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/bank-integration" element={<ProtectedRoute><BankIntegration /></ProtectedRoute>} /> {/* ← ADD THIS */}
              <Route path="/vehicle-sales" element={<ProtectedRoute><VehicleSales /></ProtectedRoute>} />
              <Route path="/vehicle-purchases" element={<ProtectedRoute><VehiclePurchases /></ProtectedRoute>} />
              <Route path="/financial-obligations" element={<ProtectedRoute><FinancialObligations /></ProtectedRoute>} />
              <Route path="/hrm" element={<ProtectedRoute><HRM /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
```

---

## Alternative: Check If BankIntegration Page Exists

If you get an import error saying "Cannot find module '@/pages/BankIntegration'":

1. Go to: `src/pages/`
2. Look for file: `BankIntegration.tsx`
3. If it exists → import is correct
4. If it doesn't exist → page may not be created yet

**If page is missing:**
Contact support or check if it needs to be created separately.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot find module" error | Check BankIntegration.tsx exists in src/pages/ |
| Still shows 404 | Clear browser cache (Ctrl+Shift+Delete) and refresh |
| No TypeScript errors but still 404 | Restart dev server (npm run dev) |
| Page loads but no content | Check BankIntegration.tsx for export default |
| Route not recognized | Verify route path exactly matches: `/bank-integration` |

---

## That's It!

You now have the Tink Bank Integration route working. The button will navigate to the page without errors.

**Time to complete: < 2 minutes**
