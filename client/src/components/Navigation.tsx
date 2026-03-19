import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    <nav className="sticky top-0 z-50 bg-background border-b border-border">
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

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 pr-3 border-r border-border">
                  <span className="text-sm font-medium">{user?.name || user?.email}</span>
                  {user?.role === "admin" && (
                    <Badge variant="default" className="bg-accent text-accent-foreground">
                      Admin
                    </Badge>
                  )}
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="border-border hover:bg-muted/10"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-border hover:bg-muted/10 flex items-center gap-2"
                >
                  <Link href="/login">
                    <a className="flex items-center gap-2">
                      <LogIn className="w-4 h-4" />
                      Login
                    </a>
                  </Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="bg-accent text-accent-foreground hover:opacity-90 flex items-center gap-2"
                >
                  <Link href="/register">
                    <a className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      Register
                    </a>
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-muted/10 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-4">
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
                      <span className="text-xs text-muted">
                        {user?.role === "admin" ? "Admin" : "User"}
                      </span>
                    </div>
                    {user?.role === "admin" && (
                      <Badge variant="default" className="bg-accent text-accent-foreground">
                        Admin
                      </Badge>
                    )}
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full border-border"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <div className="text-xs text-muted py-2 font-medium">Browsing as Guest</div>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-border flex items-center justify-center gap-2"
                  >
                    <Link href="/login">
                      <a className="flex items-center justify-center gap-2 w-full">
                        <LogIn className="w-4 h-4" />
                        Login
                      </a>
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="w-full bg-accent text-accent-foreground hover:opacity-90 flex items-center justify-center gap-2"
                  >
                    <Link href="/register">
                      <a className="flex items-center justify-center gap-2 w-full">
                        <UserPlus className="w-4 h-4" />
                        Register
                      </a>
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
