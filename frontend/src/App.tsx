import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate } from
'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RestaurantProvider } from './context/RestaurantContext';
import { Toaster } from './components/ui/Sonner';
import { Button } from './components/ui/Button';
import { Avatar, AvatarFallback } from './components/ui/Avatar';
import { Badge } from './components/ui/Badge';
import { LogOut, UtensilsCrossed } from 'lucide-react';
// Pages
import { LoginPage } from './pages/LoginPage';
import { ManagerDashboard } from './pages/ManagerDashboard';
import { WaiterDashboard } from './pages/WaiterDashboard';
import { KitchenDashboard } from './pages/KitchenDashboard';
function AppContent() {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <UtensilsCrossed size={48} className="text-primary opacity-50" />
          <p className="text-muted-foreground font-medium">
            Loading RestaurantOS...
          </p>
        </div>
      </div>);

  }
  if (!user) {
    return <LoginPage />;
  }
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  return (
    <RestaurantProvider>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-1.5 rounded-md text-primary-foreground">
                <UtensilsCrossed size={20} />
              </div>
              <span className="font-bold text-lg hidden sm:inline-block">
                RestaurantOS
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium leading-none">
                    {user.full_name || user.username}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 capitalize">
                    {user.role}
                  </p>
                </div>
                <Avatar className="h-9 w-9 border">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {(user.full_name || user.username).
                    substring(0, 2).
                    toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Badge variant="secondary" className="sm:hidden capitalize">
                  {user.role}
                </Badge>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Logout">
                
                <LogOut size={18} />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={
              user.role === 'manager' ?
              <Navigate to="/manager" replace /> :
              user.role === 'waiter' ?
              <Navigate to="/waiter" replace /> :

              <Navigate to="/kitchen" replace />

              } />
            
            <Route
              path="/manager"
              element={
              user.role === 'manager' ?
              <ManagerDashboard /> :

              <Navigate to="/" replace />

              } />
            
            <Route
              path="/waiter"
              element={
              user.role === 'waiter' ?
              <WaiterDashboard /> :

              <Navigate to="/" replace />

              } />
            
            <Route
              path="/kitchen"
              element={
              user.role === 'kitchen' ?
              <KitchenDashboard /> :

              <Navigate to="/" replace />

              } />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </RestaurantProvider>);

}
export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
        <Toaster position="top-center" richColors />
      </AuthProvider>
    </BrowserRouter>);

}