import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

export default function AdminApplications() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if not admin
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      setLocation("/");
    }
  }, [isAuthenticated, user?.role, setLocation]);

  // Queries
  const { data: applications, isLoading: appsLoading, refetch: refetchApps } = trpc.applications.allApplications.useQuery(
    {
      page: 1,
      limit: 50,
    },
    {
      staleTime: 1000 * 60,
      enabled: isAuthenticated && user?.role === "admin",
    }
  );

  // Mutations
  const approveMutation = trpc.applications.approve.useMutation({
    onSuccess: () => {
      toast.success("Application approved");
      void refetchApps();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const rejectMutation = trpc.applications.reject.useMutation({
    onSuccess: () => {
      toast.success("Application rejected");
      void refetchApps();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (!isAuthenticated || user?.role !== "admin") {
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

  return (
    <AdminLayout activeTab="applications">
      <div className="py-8 md:py-12">
        <div className="container">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-black">Adoption Applications</h1>
            <p className="text-muted mt-2">Review and manage adoption applications</p>
          </div>

          {appsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : applications?.applications && applications.applications.length > 0 ? (
            <div className="space-y-4">
              {applications.applications.map((app) => (
                <Card key={app.id} className="p-6 border border-border hover:border-accent/50 transition-colors">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold">{app.fullName}</h3>
                        <p className="text-sm text-muted">
                          Application #{app.id} • Pet #{app.petId}
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(app.status)} border-0`}>
                        {app.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted">Email</p>
                        <p className="font-semibold">{app.email}</p>
                      </div>
                      <div>
                        <p className="text-muted">Phone</p>
                        <p className="font-semibold">{app.phone}</p>
                      </div>
                      <div>
                        <p className="text-muted">Address</p>
                        <p className="font-semibold">{app.address}</p>
                      </div>
                    </div>

                    {app.reason && (
                      <div>
                        <p className="text-sm text-muted mb-1">Why they want to adopt</p>
                        <p className="text-sm">{app.reason}</p>
                      </div>
                    )}

                    {app.experience && (
                      <div>
                        <p className="text-sm text-muted mb-1">Pet Experience</p>
                        <p className="text-sm">{app.experience}</p>
                      </div>
                    )}

                    {app.status === "pending" && (
                      <div className="flex gap-3 pt-4 border-t border-border">
                        <Button
                          onClick={() =>
                            approveMutation.mutate({
                              id: app.id,
                              adminNotes: "Application approved",
                            })
                          }
                          disabled={approveMutation.isPending}
                          className="flex-1 bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => {
                            const reason = prompt("Enter rejection reason:");
                            if (reason) {
                              rejectMutation.mutate({
                                id: app.id,
                                adminNotes: reason,
                              });
                            }
                          }}
                          disabled={rejectMutation.isPending}
                          variant="destructive"
                          className="flex-1 flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card border border-border rounded-lg">
              <p className="text-lg text-muted">No applications found</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
