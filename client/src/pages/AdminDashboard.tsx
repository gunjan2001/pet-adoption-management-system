// src/pages/AdminDashboard.tsx
import { useMemo } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { usePets } from "@/hooks/usePets";
import { useAllApplications } from "@/hooks/useAdoptions";
import { LayoutGrid, PawPrint, ClipboardList, LogOut } from "lucide-react";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [, navigate]     = useLocation();

  // Fetch full sets for stats — high limit, page 1
  const { pets,         isLoading: petsLoading }  = usePets({ limit: 500, page: 1 });
  const { applications, isLoading: appsLoading }  = useAllApplications({ limit: 500, page: 1 });

  const stats = useMemo(() => ({
    total:     pets.length,
    available: pets.filter((p) => p.status === "available").length,
    pending:   pets.filter((p) => p.status === "pending").length,
    adopted:   pets.filter((p) => p.status === "adopted").length,
    totalApps: applications.length,
    pendingApps:  applications.filter((a) => a.application.status === "pending").length,
    approvedApps: applications.filter((a) => a.application.status === "approved").length,
    rejectedApps: applications.filter((a) => a.application.status === "rejected").length,
  }), [pets, applications]);

  const recentApps = useMemo(
    () => [...applications]
      .sort((a, b) => new Date(b.application.createdAt).getTime() - new Date(a.application.createdAt).getTime())
      .slice(0, 6),
    [applications]
  );

  const Loading = () => (
    <div className="h-8 w-16 rounded bg-muted animate-pulse mx-auto" />
  );

  const statCards = [
    { label: "Total Pets",      value: stats.total,       color: "text-blue-600",   bg: "bg-blue-50"   },
    { label: "Available",       value: stats.available,   color: "text-green-600",  bg: "bg-green-50"  },
    { label: "Pending Adoption",value: stats.pending,     color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Adopted",         value: stats.adopted,     color: "text-gray-600",   bg: "bg-gray-50"   },
    { label: "Total Apps",      value: stats.totalApps,   color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Pending Review",  value: stats.pendingApps, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* ── Top nav ─────────────────────────────────────────────────────────── */}
      {/* <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 max-w-7xl flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <LayoutGrid className="w-5 h-5 text-primary" />
            <span className="font-bold text-lg">Admin Panel</span>
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-1">
              <span className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium">
                Overview
              </span>
              <button
                onClick={() => navigate("/admin/pets")}
                className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors"
              >
                Pets
              </button>
              <button
                onClick={() => navigate("/admin/applications")}
                className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors"
              >
                Applications
                {stats.pendingApps > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 rounded-full bg-orange-500 text-white text-xs">
                    {stats.pendingApps}
                  </span>
                )}
              </button>
            </nav>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden md:block">{user?.email}</span>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header> */}

      <main className="container mx-auto px-4 max-w-7xl py-8">

        {/* ── Page title ───────────────────────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-3xl font-black">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.name ?? user?.email}
          </p>
        </div>

        {/* ── Stat cards ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {statCards.map((s) => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center`}>
              {petsLoading || appsLoading ? (
                <Loading />
              ) : (
                <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Quick actions ────────────────────────────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-5 mb-10">
          <div className="border border-border rounded-xl p-6 bg-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <PawPrint className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="font-bold text-lg">Manage Pets</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Add new pets, update details, change status, or remove listings.
            </p>
            <button
              onClick={() => navigate("/admin/pets")}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Go to Pet Management →
            </button>
          </div>

          <div className="border border-border rounded-xl p-6 bg-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="font-bold text-lg">Review Applications</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {stats.pendingApps > 0
                ? `${stats.pendingApps} application(s) are waiting for your review.`
                : "No pending applications right now."}
            </p>
            <button
              onClick={() => navigate("/admin/applications")}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Go to Applications →
            </button>
          </div>
        </div>

        {/* ── Recent applications ──────────────────────────────────────────── */}
        <div className="border border-border rounded-xl bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-bold">Recent Applications</h2>
            <button
              onClick={() => navigate("/admin/applications")}
              className="text-sm text-primary hover:underline"
            >
              View all →
            </button>
          </div>

          {appsLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : recentApps.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No applications yet.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentApps.map(({ application, pet, applicant }) => (
                <div key={application.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
                  {/* Pet thumbnail */}
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {pet.imageUrl
                      ? <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-cover" />
                      : <span className="text-lg">🐾</span>}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {applicant.name ?? applicant.email}
                      <span className="text-muted-foreground font-normal"> → </span>
                      {pet.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(application.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {/* Status badge */}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                    application.status === "pending"  ? "bg-yellow-100 text-yellow-800" :
                    application.status === "approved" ? "bg-green-100 text-green-800"  :
                                                        "bg-red-100 text-red-800"
                  }`}>
                    {application.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
