import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import PetListing from "./pages/PetListing";
import PetDetail from "./pages/PetDetail";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminManagePets from "./pages/AdminManagePets";
import AdminApplications from "./pages/AdminApplications";
import { LoginPage } from "./pages/Login";
import { RegisterPage } from "./pages/Register";
import Navigation from "./components/Navigation";
import { useAuth } from "./_core/hooks/useAuth";
import { Toaster } from "sonner";
import NotFound from "./pages/NotFound";

// ── Route Guards ──────────────────────────────────────────────────────────────

/**
 * Authenticated users only (role = "user").
 * Admins are redirected away — they have their own section.
 * Shows nothing while auth is still rehydrating to avoid a flash.
 */
function ProtectedUserRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  // Admins belong in /admin, not /dashboard
  if (user?.role === "admin") {
    return <Redirect to="/admin" />;
  }

  return <Component />;
}

/**
 * Admin users only.
 * Non-admins are redirected to home.
 */
function ProtectedAdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return null;

  if (!isAuthenticated || user?.role !== "admin") {
    return <Redirect to="/" />;
  }

  return <Component />;
}

// ── Router ────────────────────────────────────────────────────────────────────
function Router() {
  return (
    <Switch>
      {/* ── Public ──────────────────────────────────────────────────────── */}
      <Route path="/"           component={Home} />
      <Route path="/login"      component={LoginPage} />
      <Route path="/register"   component={RegisterPage} />
      <Route path="/pets"       component={PetListing} />
      <Route path="/pets/:id"   component={PetDetail} />

      {/* ── Authenticated user ────────────────────────────────────────────── */}
      <Route
        path="/dashboard"
        component={() => <ProtectedUserRoute component={UserDashboard} />}
      />

      {/* ── Admin ──────────────────────────────────────────────────────────── */}
      <Route
        path="/admin"
        component={() => <ProtectedAdminRoute component={AdminDashboard} />}
      />
      <Route
        path="/admin/pets"
        component={() => <ProtectedAdminRoute component={AdminManagePets} />}
      />
      <Route
        path="/admin/applications"
        component={() => <ProtectedAdminRoute component={AdminApplications} />}
      />

      {/* ── Fallback ───────────────────────────────────────────────────────── */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider defaultTheme="light">
          <>
            <Toaster />
            <div className="min-h-screen flex flex-col bg-background text-foreground">
              <Navigation />
              <main className="flex-1">
                <Router />
              </main>
            </div>
          </>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;