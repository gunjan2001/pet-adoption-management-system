// src/pages/AdminDashboard.tsx
import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { usePets } from "@/hooks/usePets";
import { useAllApplications } from "@/hooks/useAdoptions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();

  const { pets,         isLoading: petsLoading }  = usePets({ limit: 100 });
  const { applications, isLoading: appsLoading }  = useAllApplications({ limit: 100 });

  const stats = useMemo(() => ({
    totalPets:       pets.length,
    available:       pets.filter((p) => p.status === "available").length,
    pending:         pets.filter((p) => p.status === "pending").length,
    adopted:         pets.filter((p) => p.status === "adopted").length,
    totalApps:       applications.length,
    pendingApps:     applications.filter((a) => a.application.status === "pending").length,
    approvedApps:    applications.filter((a) => a.application.status === "approved").length,
  }), [pets, applications]);

  const recentApps = useMemo(
    () => [...applications]
      .sort((a, b) => new Date(b.application.createdAt).getTime() - new Date(a.application.createdAt).getTime())
      .slice(0, 5),
    [applications]
  );

  const statCards = [
    { label: "Total Pets",          value: stats.totalPets,    color: "text-blue-600" },
    { label: "Available",           value: stats.available,    color: "text-green-600" },
    { label: "Pending Adoption",    value: stats.pending,      color: "text-yellow-600" },
    { label: "Adopted",             value: stats.adopted,      color: "text-gray-600" },
    { label: "Total Applications",  value: stats.totalApps,    color: "text-purple-600" },
    { label: "Pending Review",      value: stats.pendingApps,  color: "text-orange-600" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Logged in as {user?.email}
          </p>
        </div>
        <Button variant="ghost" onClick={logout}>Log out</Button>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4 text-center">
              {petsLoading || appsLoading ? (
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
              ) : (
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Quick Actions ────────────────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Manage Pets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Add new pets, update details, or change adoption status.
            </p>
            <Button onClick={() => navigate("/admin/pets")} className="w-full">
              Go to Pet Management
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Review Applications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {stats.pendingApps > 0
                ? `${stats.pendingApps} application(s) awaiting your review.`
                : "No pending applications right now."}
            </p>
            <Button onClick={() => navigate("/admin/applications")} className="w-full">
              Go to Applications
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ── Recent Applications ──────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {appsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : recentApps.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">No applications yet.</p>
          ) : (
            <div className="space-y-3">
              {recentApps.map(({ application, pet, applicant }) => (
                <div
                  key={application.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{applicant.name ?? applicant.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Applied for <span className="font-medium">{pet.name}</span>
                      {" · "}{new Date(application.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    className={
                      application.status === "pending"  ? "bg-yellow-100 text-yellow-800" :
                      application.status === "approved" ? "bg-green-100 text-green-800" :
                      "bg-red-100 text-red-800"
                    }
                  >
                    {application.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
