import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Menu, X, LogIn, UserPlus, LayoutGrid, LogOut } from "lucide-react";
import { useState } from "react";

export default function Navigation() {
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await logout();
    setLocation("/");
    setMobileMenuOpen(false);
  };

  // Render admin header for admin users
  if (isAuthenticated && user?.role === "admin") {
    return (
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/70 shadow-sm">
        <div className="container  mx-auto px-4 max-w-7xl flex items-center justify-between h-16">
          <Link href="/admin">
            <div className="flex items-center gap-3">
              <LayoutGrid className="w-5 h-5 text-primary" />
              <span className="font-bold text-lg">Admin Panel</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/admin">
                <span className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium">
                  Overview
                </span>
              </Link>
              <Link href="/admin/pets">
                <button className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors">
                  Pets
                </button>
              </Link>
              <Link href="/admin/applications">
                <button className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors">
                  Applications
                </button>
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden md:block">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Default navigation for regular users and guests
  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/70 shadow-sm">
      <div className="container">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center gap-2 font-bold text-xl md:text-2xl text-foreground hover:text-accent transition-colors">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-accent-foreground font-bold">
                🐾
              </div>
              <span className="hidden sm:inline">PawAdopt</span>
            </a>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/pets">
              <a className="text-foreground hover:text-accent transition-colors font-medium">
                Browse Pets
              </a>
            </Link>

            {isAuthenticated && (
              <>
                <Link href="/dashboard">
                  <a className="text-foreground hover:text-accent transition-colors font-medium">
                    My Applications
                  </a>
                </Link>
                {user?.role === "admin" && (
                  <Link href="/admin">
                    <a className="text-foreground hover:text-accent transition-colors font-medium">
                      Admin
                    </a>
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Desktop Auth Controls */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="inline-flex items-center gap-3 rounded-full border border-border bg-background/70 px-4 py-2 shadow-sm">
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-semibold text-foreground">{user?.name || user?.email}</span>
                    <span className="text-xs text-muted">Verified User</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center rounded-full border border-border bg-muted/10 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted/20 hover:shadow-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <a className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted/10 hover:shadow-sm">
                    <LogIn className="w-4 h-4" />
                    Login
                  </a>
                </Link>
                <Link href="/register">
                  <a className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition hover:bg-accent/90 hover:shadow-sm">
                    <UserPlus className="w-4 h-4" />
                    Register
                  </a>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-muted/10 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border py-4 space-y-4 px-4">
          <Link href="/pets">
            <a
              className="block px-4 py-2 text-foreground hover:bg-muted/10 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Pets
            </a>
          </Link>

          {isAuthenticated && (
            <>
              <Link href="/dashboard">
                <a
                  className="block px-4 py-2 text-foreground hover:bg-muted/10 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Applications
                </a>
              </Link>
              {user?.role === "admin" && (
                <Link href="/admin">
                  <a
                    className="block px-4 py-2 text-foreground hover:bg-muted/10 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Dashboard
                  </a>
                </Link>
              )}
            </>
          )}

          <div className="rounded-3xl border border-border bg-background/80 p-4 shadow-sm space-y-4">
            {isAuthenticated ? (
              <>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-foreground">Welcome back, {user?.name || user?.email}</span>
                  <span className="text-xs uppercase tracking-[0.15em] text-muted">Member</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="rounded-2xl bg-muted/20 px-3 py-2 text-sm font-medium text-foreground">
                    User
                  </div>
                  <button
                    onClick={handleLogout}
                    className="inline-flex flex-1 items-center justify-center rounded-full bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground transition hover:bg-accent/90 hover:shadow-sm"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-xs text-muted py-2 font-medium">Browsing as Guest</div>
                <Link href="/login">
                  <a
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background/90 px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted/10 hover:shadow-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </a>
                </Link>
                <Link href="/register">
                  <a
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground transition hover:bg-accent/90 hover:shadow-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserPlus className="w-4 h-4" />
                    Register
                  </a>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
