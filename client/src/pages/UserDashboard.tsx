import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

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

  const { data: applications, isLoading } = trpc.applications.myApplications.useQuery(undefined, {
    enabled: isAuthenticated && user?.role !== "admin",
    refetchOnMount: 'always',
  });

  if (!isAuthenticated) {
    return null;
  }

  const getStatusColor = (status: string) => {
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

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="container">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-2">My Applications</h1>
          <p className="text-lg text-muted">Track your adoption applications and their status</p>
        </div>

        {/* Applications List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-6">
                <Skeleton className="h-6 w-1/4 mb-4" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : applications && applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((app) => (
              <Card
                key={app.id}
                className="p-6 border border-border hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">Application #{app.id}</h3>
                      <Badge
                        className={`${getStatusColor(app.status)} border-0`}
                      >
                        {getStatusLabel(app.status)}
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted">Pet ID</p>
                        <p className="font-semibold">Pet #{app.petId}</p>
                      </div>
                      <div>
                        <p className="text-muted">Applied On</p>
                        <p className="font-semibold">
                          {format(new Date(app.createdAt), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted">Home Type</p>
                        <p className="font-semibold capitalize">{app.homeType || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-muted">Has Yard</p>
                        <p className="font-semibold">{app.hasYard ? "Yes" : "No"}</p>
                      </div>
                    </div>

                    {app.reason && (
                      <div className="mt-4">
                        <p className="text-sm text-muted mb-1">Why you want to adopt</p>
                        <p className="text-sm line-clamp-2">{app.reason}</p>
                      </div>
                    )}

                    {app.adminNotes && (
                      <div className="mt-4 p-3 bg-muted/10 rounded-lg border border-border">
                        <p className="text-sm text-muted mb-1">Admin Notes</p>
                        <p className="text-sm">{app.adminNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <p className="text-lg text-muted mb-4">You haven't submitted any applications yet</p>
            <a
              href="/pets"
              className="inline-flex items-center justify-center px-6 py-3 bg-accent text-accent-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Browse Pets
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
