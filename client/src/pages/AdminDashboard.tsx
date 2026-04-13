import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Trash2, CheckCircle, XCircle, Edit2 } from "lucide-react";
import PetFormModal from "@/components/PetFormModal";
import AdminHeader from "@/components/AdminHeader";
import api from "@/lib/api/httpClient";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const [activeTab, setActiveTab] = useState("applications");
  const [petFormOpen, setPetFormOpen] = useState(false);
  const [editingPetId, setEditingPetId] = useState<number | null>(null);

  // ✅ NEW STATE
  const [applications, setApplications] = useState<any[]>([]);
  const [pets, setPets] = useState<any[]>([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [petsLoading, setPetsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Redirect
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      setLocation("/");
    }
  }, [isAuthenticated, user?.role]);

  // ✅ FETCH APPLICATIONS
  const fetchApplications = async () => {
    try {
      setAppsLoading(true);
      const res = await api.get("/applications?page=1&limit=50");
      setApplications(res.data.applications || []);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setAppsLoading(false);
    }
  };

  // ✅ FETCH PETS
  const fetchPets = async () => {
    try {
      setPetsLoading(true);
      const res = await api.get("/pets?page=1&limit=50");
      setPets(res.data.pets || []);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setPetsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      fetchApplications();
      fetchPets();
    }
  }, [isAuthenticated, user?.role]);

  // ✅ APPROVE
  const handleApprove = async (id: number) => {
    try {
      setActionLoading(true);
      await api.post(`/applications/${id}/approve`, {
        adminNotes: "Application approved",
      });
      toast.success("Application approved");
      fetchApplications();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ REJECT
  const handleReject = async (id: number) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      setActionLoading(true);
      await api.post(`/applications/${id}/reject`, {
        adminNotes: reason,
      });
      toast.success("Application rejected");
      fetchApplications();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ CREATE / UPDATE PET
  const handlePetFormSubmit = async (data: any) => {
    try {
      setActionLoading(true);

      const payload = {
        ...data,
        age: data.age ? parseInt(data.age) : undefined,
        adoptionFee: data.adoptionFee ? parseFloat(data.adoptionFee) : undefined,
      };

      if (editingPetId) {
        await api.put(`/pets/${editingPetId}`, payload);
        toast.success("Pet updated");
      } else {
        await api.post("/pets", payload);
        toast.success("Pet created");
      }

      fetchPets();
      setPetFormOpen(false);
      setEditingPetId(null);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ DELETE PET
  const handleDeletePet = async (id: number) => {
    if (!confirm("Delete this pet?")) return;

    try {
      setActionLoading(true);
      await api.delete(`/pets/${id}`);
      toast.success("Pet deleted");
      fetchPets();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const editingPet = useMemo(() => {
    return pets.find((p) => p.id === editingPetId);
  }, [editingPetId, pets]);

  if (!isAuthenticated || user?.role !== "admin") return null;

  const getStatusColor = (status: string) => {
    if (status === "approved") return "bg-green-100 text-green-800";
    if (status === "rejected") return "bg-red-100 text-red-800";
    if (status === "pending") return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader activeTab={activeTab} />

      <div className="py-8">
        <div className="container">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* APPLICATIONS */}
            <TabsContent value="applications">
              {appsLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : applications.length > 0 ? (
                applications.map((app) => (
                  <Card key={app.id} className="p-4 mb-4">
                    <h3>{app.fullName}</h3>

                    <Badge className={getStatusColor(app.status)}>
                      {app.status}
                    </Badge>

                    {app.status === "pending" && (
                      <div className="flex gap-2 mt-2">
                        <Button onClick={() => handleApprove(app.id)} disabled={actionLoading}>
                          <CheckCircle /> Approve
                        </Button>

                        <Button
                          variant="destructive"
                          onClick={() => handleReject(app.id)}
                          disabled={actionLoading}
                        >
                          <XCircle /> Reject
                        </Button>
                      </div>
                    )}
                  </Card>
                ))
              ) : (
                <p>No applications</p>
              )}
            </TabsContent>

            {/* PETS */}
            <TabsContent value="pets">
              <Button onClick={() => setPetFormOpen(true)}>
                <Plus /> Add Pet
              </Button>

              {petsLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : pets.length > 0 ? (
                pets.map((pet) => (
                  <Card key={pet.id} className="p-4 mt-4">
                    <h3>{pet.name}</h3>

                    <div className="flex gap-2 mt-2">
                      <Button onClick={() => setEditingPetId(pet.id)}>
                        <Edit2 /> Edit
                      </Button>

                      <Button
                        variant="destructive"
                        onClick={() => handleDeletePet(pet.id)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </Card>
                ))
              ) : (
                <p>No pets</p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <PetFormModal
        isOpen={petFormOpen}
        onClose={() => {
          setPetFormOpen(false);
          setEditingPetId(null);
        }}
        onSubmit={handlePetFormSubmit}
        initialData={editingPet}
        isLoading={actionLoading}
        title={editingPetId ? "Edit Pet" : "Add Pet"}
      />
    </div>
  );
}