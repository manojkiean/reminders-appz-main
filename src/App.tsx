import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import Dashboard from "./pages/Dashboard";
import Reminders from "./pages/Reminders";
import AccountSettings from "./pages/AccountSettings";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import UserManagement from "./pages/admin/UserManagement";
import AllReminders from "./pages/admin/AllReminders";
import { ROUTES, MESSAGES, APP_SUPPORT_EMAIL } from "./constants";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children, adminOnly = false }: { 
  children: React.ReactNode,
  adminOnly?: boolean 
}) => {
  const { user, isLoading, isAdmin, isActive } = useAuth();
  
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to={ROUTES.AUTH} replace />;
  }

  if (!isActive) {
    return <div className="flex h-screen flex-col items-center justify-center p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Account Disabled</h1>
      <p className="mb-2">{MESSAGES.ACCOUNT_DISABLED}</p>
      <p>Please contact support at <a href={`mailto:${APP_SUPPORT_EMAIL}`} className="text-primary hover:underline">{APP_SUPPORT_EMAIL}</a> to reactivate your account.</p>
    </div>;
  }
  
  if (adminOnly && !isAdmin) {
    console.log("Access denied: Admin route requires admin privileges");
    return <Navigate to={ROUTES.HOME} replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path={ROUTES.REMINDERS} element={
        <ProtectedRoute>
          <Reminders />
        </ProtectedRoute>
      } />
      <Route path={ROUTES.REMINDERS_NEW} element={
        <ProtectedRoute>
          <Reminders />
        </ProtectedRoute>
      } />
      <Route path={ROUTES.REMINDERS_MANAGE} element={
        <ProtectedRoute>
          <Reminders />
        </ProtectedRoute>
      } />
      <Route path={ROUTES.SETTINGS} element={
        <ProtectedRoute>
          <AccountSettings />
        </ProtectedRoute>
      } />
      
      {/* Admin Routes */}
      <Route path={ROUTES.ADMIN_USERS} element={
        <ProtectedRoute adminOnly>
          <UserManagement />
        </ProtectedRoute>
      } />
      <Route path={ROUTES.ADMIN_REMINDERS} element={
        <ProtectedRoute adminOnly>
          <AllReminders />
        </ProtectedRoute>
      } />
      
      <Route path={ROUTES.AUTH} element={<Auth />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;