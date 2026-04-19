import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Menu, X, LogIn, UserPlus, LogOut, LayoutGrid,
  PawPrint, ClipboardList, LayoutDashboard, ChevronDown,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

// ── Hook: close a dropdown when clicking outside ─────────────────────────────
function useClickOutside(ref: React.RefObject<HTMLElement>, cb: () => void) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) cb();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, cb]);
}

// ── Admin Navigation ──────────────────────────────────────────────────────────
function AdminNav() {
  const { user, logout } = useAuth();
  const [, setLocation]  = useLocation();
  const [location]       = useLocation();
  const [open, setOpen]  = useState(false);
  const menuRef          = useRef<HTMLDivElement>(null!);
  useClickOutside(menuRef, () => setOpen(false));

  const isActive = (path: string) => location === path;

  const links = [
    { href: "/admin",              label: "Overview",     icon: LayoutGrid },
    { href: "/admin/pets",         label: "Pets",         icon: PawPrint },
    { href: "/admin/applications", label: "Applications", icon: ClipboardList },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-gray-900 border-b border-gray-700">
      <div className="container mx-auto px-4 max-w-7xl flex items-center justify-between h-16">

        {/* Logo */}
        <Link href="/admin">
          <span className="flex items-center gap-2.5 cursor-pointer group">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
              <LayoutGrid className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-lg group-hover:text-amber-400 transition-colors">
              Admin Panel
            </span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <span className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                isActive(href)
                  ? "bg-amber-500 text-gray-900"
                  : "text-gray-300 hover:text-white hover:bg-gray-800"
              }`}>
                <Icon className="w-4 h-4" />
                {label}
              </span>
            </Link>
          ))}
        </div>

        {/* Right side: user + logout */}
        <div className="flex items-center gap-3">
          {/* User pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800 border border-gray-700">
            <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-gray-900 font-bold text-xs">
              {(user?.name ?? user?.email ?? "A")[0].toUpperCase()}
            </div>
            <span className="text-gray-300 text-sm max-w-[120px] truncate">
              {user?.name ?? user?.email}
            </span>
          </div>

          {/* Desktop logout */}
          <button
            onClick={() => { logout(); setLocation("/"); }}
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>

          {/* Mobile burger */}
          <div className="relative md:hidden" ref={menuRef}>
            <button
              onClick={() => setOpen((o) => !o)}
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              aria-label="Open menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {open && (
              <div className="absolute right-0 top-12 w-56 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-50">
                {/* User info */}
                <div className="px-4 py-3 border-b border-gray-700 bg-gray-800/50">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-gray-900 font-bold text-xs flex-shrink-0">
                      {(user?.name ?? user?.email ?? "A")[0].toUpperCase()}
                    </div>
                    <span className="text-gray-300 text-sm truncate">{user?.name ?? user?.email}</span>
                  </div>
                </div>
                {/* Links */}
                {links.map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href}>
                    <span
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 text-sm cursor-pointer transition-colors ${
                        isActive(href)
                          ? "bg-amber-500/20 text-amber-400 font-medium"
                          : "text-gray-300 hover:bg-gray-800 hover:text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4" /> {label}
                    </span>
                  </Link>
                ))}
                {/* Logout */}
                <button
                  onClick={() => { logout(); setLocation("/"); setOpen(false); }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-gray-800 transition-colors border-t border-gray-700"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

// ── Main (public/user) Navigation ─────────────────────────────────────────────
export default function Navigation() {
  const { user, logout, isAuthenticated } = useAuth();
  const [, setLocation]   = useLocation();
  const [location]        = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null!);
  useClickOutside(userMenuRef, () => setUserMenuOpen(false));

  const isActive = (path: string) => location === path;

  // Render admin nav for admin users
  if (isAuthenticated && user?.role === "admin") return <AdminNav />;

  const handleLogout = () => {
    logout();
    setLocation("/");
    setMobileOpen(false);
    setUserMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 max-w-7xl flex items-center justify-between h-16 md:h-18">

        {/* ── Logo ─────────────────────────────────────────────────────────── */}
        <Link href="/">
          <span className="flex items-center gap-2 cursor-pointer group">
            <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-lg shadow-sm">
              🐾
            </div>
            <span className="font-black text-xl text-gray-900 group-hover:text-amber-600 transition-colors hidden sm:inline">
              PawAdopt
            </span>
          </span>
        </Link>

        {/* ── Desktop links ────────────────────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-1">
          <Link href="/pets">
            <span className={`px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors ${
              isActive("/pets") ? "bg-amber-100 text-amber-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}>
              Browse Pets
            </span>
          </Link>
          {isAuthenticated && (
            <Link href="/dashboard">
              <span className={`px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors ${
                isActive("/dashboard") ? "bg-amber-100 text-amber-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}>
                My Applications
              </span>
            </Link>
          )}
        </div>

        {/* ── Desktop auth area ────────────────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            /* Logged-in user dropdown */
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-colors group"
              >
                <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-xs">
                  {(user?.name ?? user?.email ?? "U")[0].toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-gray-800 max-w-[120px] truncate">
                  {user?.name ?? user?.email}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-12 w-52 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-100 bg-amber-50/50">
                    <p className="text-xs text-gray-500">Signed in as</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">{user?.email}</p>
                  </div>
                  <Link href="/dashboard">
                    <span
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-gray-400" /> My Applications
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                  >
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Guest buttons */
            <>
              <Link href="/login">
                <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer">
                  <LogIn className="w-4 h-4" /> Login
                </span>
              </Link>
              <Link href="/register">
                <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold shadow-sm shadow-amber-200 transition-colors cursor-pointer">
                  <UserPlus className="w-4 h-4" /> Register
                </span>
              </Link>
            </>
          )}
        </div>

        {/* ── Mobile burger ────────────────────────────────────────────────── */}
        <button
          className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── Mobile menu ──────────────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1">
          <Link href="/pets">
            <span onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium cursor-pointer transition-colors ${
                isActive("/pets") ? "bg-amber-100 text-amber-700" : "text-gray-700 hover:bg-gray-100"
              }`}>
              🐾 Browse Pets
            </span>
          </Link>

          {isAuthenticated && (
            <Link href="/dashboard">
              <span onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium cursor-pointer transition-colors ${
                  isActive("/dashboard") ? "bg-amber-100 text-amber-700" : "text-gray-700 hover:bg-gray-100"
                }`}>
                <LayoutDashboard className="w-4 h-4" /> My Applications
              </span>
            </Link>
          )}

          {/* Auth card */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            {isAuthenticated ? (
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-amber-50 border border-amber-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-xs">
                    {(user?.name ?? user?.email ?? "U")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 leading-tight">{user?.name ?? "User"}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[150px]">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-sm text-red-600 font-medium hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" /> Out
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link href="/login">
                  <span onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">
                    <LogIn className="w-4 h-4" /> Login
                  </span>
                </Link>
                <Link href="/register">
                  <span onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold cursor-pointer transition-colors">
                    <UserPlus className="w-4 h-4" /> Create Free Account
                  </span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}