import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import { useMyApplications } from "@/hooks/useAdoptions";
import { format } from "date-fns";
import type { AdoptionStatus } from "@/types";

export default function UserDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to login if not authenticated, or to admin if admin user
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/");
    } else if (user?.role === "admin") {
      setLocation("/admin");
    }
  }, [isAuthenticated, user?.role, setLocation]);

  const { applications, isLoading } = useMyApplications();

  if (!isAuthenticated) {
    return null;
  }

  const getStatusColor = (status: AdoptionStatus) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: AdoptionStatus) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="min-h-screen py-12 md:py-20 bg-slate-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black mb-3">My Applications</h1>
          <p className="text-lg text-slate-600">Track your adoption applications and their status</p>
        </div>

        {/* Applications List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-6">
                <div className="h-6 w-1/4 bg-muted animate-pulse mb-4 rounded" />
                <div className="h-4 w-1/2 bg-muted animate-pulse mb-2 rounded" />
                <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        ) : applications && applications.length > 0 ? (
          <div className="space-y-5">
            {applications.map((app) => (
              <div
                key={app.application.id}
                className="bg-white border border-slate-200 shadow-sm rounded-3xl p-5 sm:p-6 transition-shadow hover:shadow-lg"
              >
                <div className="flex flex-col gap-4 md:gap-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold tracking-tight">Application #{app.application.id}</h3>
                      <p className="text-sm text-slate-500 mt-1">Submitted by you for this pet</p>
                    </div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.application.status)}`}
                    >
                      {getStatusLabel(app.application.status)}
                    </span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 text-sm text-slate-700">
                    <div className="space-y-1">
                      <p className="text-slate-500">Pet ID</p>
                      <p className="font-medium">Pet #{app.application.petId}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-500">Applied On</p>
                      <p className="font-medium">{format(new Date(app.application.createdAt), "MMM d, yyyy")}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-500">Home Type</p>
                      <p className="font-medium capitalize">{app.application.homeType || "Not specified"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-500">Has Yard</p>
                      <p className="font-medium">{app.application.hasYard ? "Yes" : "No"}</p>
                    </div>
                  </div>

                  {app.application.reason && (
                    <div className="rounded-3xl bg-slate-50 p-4">
                      <p className="text-sm text-slate-500 mb-2 font-medium">Why you want to adopt</p>
                      <p className="text-sm leading-6 text-slate-700 line-clamp-3">{app.application.reason}</p>
                    </div>
                  )}

                  {app.application.adminNotes && (
                    <div className="rounded-3xl bg-slate-50 p-4 border border-slate-200">
                      <p className="text-sm text-slate-500 mb-2 font-medium">Admin Notes</p>
                      <p className="text-sm leading-6 text-slate-700">{app.application.adminNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <p className="text-lg text-muted mb-4">You haven't submitted any applications yet</p>
            <Link
              to="/pets"
              className="inline-flex items-center justify-center px-6 py-3 bg-accent text-accent-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Browse Pets
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
