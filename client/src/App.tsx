import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import PetListing from "./pages/PetListing";
import PetDetail from "./pages/PetDetail";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import { LoginPage } from "./pages/Login";
import { RegisterPage } from "./pages/Register";
import Navigation from "./components/Navigation";
import { useAuth } from "./_core/hooks/useAuth";
import { ReactNode } from "react";

/**
 * Protected route for authenticated users only
 * Redirects to login if not authenticated
 */
function ProtectedUserRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <NotFound />;
  }
  
  // Admins cannot access user pages
  if (user?.role === "admin") {
    return <NotFound />;
  }
  
  return <Component />;
}

/**
 * Protected route for admin users only
 * Redirects to home if not admin
 */
function ProtectedAdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated || user?.role !== "admin") {
    return <NotFound />;
  }
  
  return <Component />;
}

function Router() {
  const { user } = useAuth();

  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={LoginPage} />
      <Route path={"/register"} component={RegisterPage} />
      <Route path={"/pets"} component={PetListing} />
      <Route path={"/pets/:id"} component={PetDetail} />
      {user && (
        <Route path={"/dashboard"} component={() => <ProtectedUserRoute component={UserDashboard} />} />
      )}
      {user?.role === "admin" && (
        <Route path={"/admin"} component={() => <ProtectedAdminRoute component={AdminDashboard} />} />
      )}
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <div className="min-h-screen flex flex-col bg-background text-foreground">
            <Navigation />
            <main className="flex-1">
              <Router />
            </main>
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
