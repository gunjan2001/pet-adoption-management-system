import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'sonner';
import { Redirect, Route, Switch } from 'wouter';
import { useAuth } from './_core/hooks/useAuth';
import ErrorBoundary from './components/ErrorBoundary';
import Footer from './components/Footer';
import Navigation from './components/Navigation';
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AdminApplications from './pages/AdminApplications';
import AdminDashboard from './pages/AdminDashboard';
import AdminManagePets from './pages/AdminManagePets';
import Home from './pages/Home';
import { LoginPage } from './pages/Login';
import NotFound from './pages/NotFound';
import PetDetail from './pages/PetDetail';
import PetListing from './pages/PetListing';
import { RegisterPage } from './pages/Register';
import UserDashboard from './pages/UserDashboard';

function ProtectedUserRoute({
  component: Component,
}: {
  component: React.ComponentType;
}) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  // Admins belong in /admin, not /dashboard
  if (user?.role === 'admin') {
    return <Redirect to="/admin" />;
  }

  return <Component />;
}

/**
 * Admin users only.
 * Non-admins are redirected to home.
 */
function ProtectedAdminRoute({
  component: Component,
}: {
  component: React.ComponentType;
}) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return null;

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Redirect to="/" />;
  }

  return <Component />;
}

// ── Router ────────────────────────────────────────────────────────────────────
function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        {/* ── Public ──────────────────────────────────────────────────────── */}
        <Route path="/" component={Home} />
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/pets" component={PetListing} />
        <Route path="/pets/:id" component={PetDetail} />

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
          component={() => (
            <ProtectedAdminRoute component={AdminApplications} />
          )}
        />

        {/* ── Fallback ───────────────────────────────────────────────────────── */}
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

console.log("client id",import.meta.env.VITE_GOOGLE_CLIENT_ID);


// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <ThemeProvider defaultTheme="light">
          <>
            <Toaster />
            <div className="min-h-screen flex flex-col bg-background text-foreground">
              <Navigation />
              <main className="flex-1">
                <Router />
              </main>
              <Footer />
            </div>
          </>
        </ThemeProvider>
      </GoogleOAuthProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
