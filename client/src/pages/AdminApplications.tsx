import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import api from "@/lib/api/httpClient";

export default function AdminApplications() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      setLocation("/");
    }
  }, [isAuthenticated, user?.role, setLocation]);

  // ✅ Fetch applications (REPLACES trpc query)
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get("/applications?page=1&limit=50");
      setApplications(res.data.applications || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      fetchApplications();
    }
  }, [isAuthenticated, user?.role]);

  // ✅ Approve (REPLACES mutation)
  const handleApprove = async (id: string) => {
    try {
      setActionLoading(true);
      await api.post(`/applications/${id}/approve`, {
        adminNotes: "Application approved",
      });
      toast.success("Application approved");
      fetchApplications(); // refetch
    } catch (error: any) {
      toast.error(error.message || "Failed to approve");
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ Reject (REPLACES mutation)
  const handleReject = async (id: string) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      setActionLoading(true);
      await api.post(`/applications/${id}/reject`, {
        adminNotes: reason,
      });
      toast.success("Application rejected");
      fetchApplications(); // refetch
    } catch (error: any) {
      toast.error(error.message || "Failed to reject");
    } finally {
      setActionLoading(false);
    }
  };

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
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-black">
              Adoption Applications
            </h1>
            <p className="text-muted mt-2">
              Review and manage adoption applications
            </p>
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((app) => (
                <Card key={app.id} className="p-6 border border-border">
                  <div className="space-y-4">
                    <div className="flex justify-between">
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

                    {app.reason && <p>{app.reason}</p>}
                    {app.experience && <p>{app.experience}</p>}

                    {app.status === "pending" && (
                      <div className="flex gap-3 pt-4 border-t">
                        <Button
                          onClick={() => handleApprove(app.id)}
                          disabled={actionLoading}
                          className="flex-1 bg-green-600 text-white"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </Button>

                        <Button
                          onClick={() => handleReject(app.id)}
                          disabled={actionLoading}
                          variant="destructive"
                          className="flex-1"
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
            <div className="text-center py-12">
              <p>No applications found</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}