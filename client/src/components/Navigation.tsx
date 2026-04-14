import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Menu, X, LogIn, UserPlus } from "lucide-react";
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
                <div className="flex items-center gap-2 pr-3 border-r border-border">
                  <span className="text-sm font-medium">{user?.name || user?.email}</span>
                  {user?.role === "admin" && (
                    <span className="inline-flex items-center rounded-full bg-accent px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-accent-foreground">
                      Admin
                    </span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center rounded-lg border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted/10"
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

          <div className="px-4 pt-4 border-t border-border space-y-3">
            {isAuthenticated ? (
              <>
                <div className="flex items-center justify-between py-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user?.name || user?.email}</span>
                    <span className="text-xs text-muted">{user?.role === "admin" ? "Admin" : "User"}</span>
                  </div>
                  {user?.role === "admin" && (
                    <span className="inline-flex items-center rounded-full bg-accent px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-accent-foreground">
                      Admin
                    </span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full rounded-lg border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted/10"
                >
                  Logout
                </button>
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
