import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Trash2, CheckCircle, XCircle, Edit2 } from "lucide-react";
import PetFormModal from "@/components/PetFormModal";
import AdminHeader from "@/components/AdminHeader";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("applications");
  const [petFormOpen, setPetFormOpen] = useState(false);
  const [editingPetId, setEditingPetId] = useState<number | null>(null);

  // Redirect if not admin
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      setLocation("/");
    }
  }, [isAuthenticated, user?.role, setLocation]);

  // Queries with proper configuration
  const { data: applications, isLoading: appsLoading, refetch: refetchApps } = trpc.applications.allApplications.useQuery(
    {
      page: 1,
      limit: 50,
    },
    {
      staleTime: 1000 * 60, // 1 minute
      enabled: isAuthenticated && user?.role === "admin", // Only fetch if admin
    }
  );
  const { data: pets, isLoading: petsLoading, refetch: refetchPets } = trpc.pets.list.useQuery(
    {
      page: 1,
      limit: 50,
    },
    {
      staleTime: 1000 * 60, // 1 minute
      enabled: isAuthenticated && user?.role === "admin", // Only fetch if admin
    }
  );

  // Get editing pet data
  const editingPet = useMemo(() => {
    if (!editingPetId || !pets?.pets) return undefined;
    return pets.pets.find(p => p.id === editingPetId);
  }, [editingPetId, pets?.pets]);

  // Mutations
  const approveMutation = trpc.applications.approve.useMutation({
    onSuccess: () => {
      toast.success("Application approved");
      refetchApps();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const rejectMutation = trpc.applications.reject.useMutation({
    onSuccess: () => {
      toast.success("Application rejected");
      refetchApps();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const createPetMutation = trpc.pets.create.useMutation({
    onSuccess: () => {
      toast.success("Pet added successfully");
      refetchPets();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updatePetMutation = trpc.pets.update.useMutation({
    onSuccess: () => {
      toast.success("Pet updated successfully");
      refetchPets();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deletePetMutation = trpc.pets.delete.useMutation({
    onSuccess: () => {
      toast.success("Pet deleted");
      refetchPets();
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

  const handlePetFormSubmit = async (data: any) => {
    if (editingPetId) {
      await updatePetMutation.mutateAsync({
        id: editingPetId,
        data: {
          ...data,
          age: data.age ? parseInt(data.age) : undefined,
          adoptionFee: data.adoptionFee ? parseFloat(data.adoptionFee) : undefined,
        },
      });
    } else {
      await createPetMutation.mutateAsync({
        ...data,
        age: data.age ? parseInt(data.age) : undefined,
        adoptionFee: data.adoptionFee ? parseFloat(data.adoptionFee) : undefined,
      });
    }
    setPetFormOpen(false);
    setEditingPetId(null);
  };

  const handleOpenCreateForm = () => {
    setEditingPetId(null);
    setPetFormOpen(true);
  };

  const handleOpenEditForm = (petId: number) => {
    setEditingPetId(petId);
    setPetFormOpen(true);
  };

  const handleCloseForm = () => {
    setPetFormOpen(false);
    setEditingPetId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <AdminHeader activeTab={activeTab} />

      {/* Main Content */}
      <div className="py-8 md:py-12">
        <div className="container">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-black">Dashboard</h1>
            <p className="text-muted mt-2">Manage pets and adoption applications</p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Applications Tab */}
            <TabsContent value="applications" className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Adoption Applications</h2>
                <Badge variant="outline">{applications?.applications?.length || 0}</Badge>
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
                            <h3 className="text-lg font-bold">
                              {app.fullName}
                            </h3>
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
          </TabsContent>

          {/* Pets Tab */}
          <TabsContent value="pets" className="space-y-6">
            <Button
              onClick={handleOpenCreateForm}
              className="bg-accent text-accent-foreground hover:opacity-90 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New Pet
            </Button>

            {petsLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full" />
                ))}
              </div>
            ) : pets?.pets && pets.pets.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pets.pets.map((pet) => (
                  <Card key={pet.id} className="overflow-hidden border border-border">
                    {/* Pet Image */}
                    <div className="w-full h-32 bg-muted/20 flex items-center justify-center text-4xl">
                      {pet.imageUrl ? (
                        <img
                          src={pet.imageUrl}
                          alt={pet.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        "🐾"
                      )}
                    </div>

                    {/* Pet Info */}
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-bold">{pet.name}</h3>
                        <p className="text-sm text-muted">{pet.breed || pet.species}</p>
                      </div>

                      <div className="text-sm">
                        <p className="text-muted">
                          {pet.age ? `${Math.floor(pet.age / 12)} years • ` : ""}
                          {pet.gender}
                        </p>
                        <p className="text-muted capitalize">
                          Status: {pet.status}
                        </p>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-border">
                        <Button
                          onClick={() => handleOpenEditForm(pet.id)}
                          variant="outline"
                          size="sm"
                          className="flex-1 flex items-center gap-1 justify-center"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => {
                            if (confirm("Delete this pet?")) {
                              deletePetMutation.mutate({ id: pet.id });
                            }
                          }}
                          disabled={deletePetMutation.isPending}
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card border border-border rounded-lg">
                <p className="text-lg text-muted">No pets found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Pet Form Modal */}
      <PetFormModal
        isOpen={petFormOpen}
        onClose={handleCloseForm}
        onSubmit={handlePetFormSubmit}
        initialData={editingPet ? {
          name: editingPet.name,
          species: editingPet.species,
          breed: editingPet.breed || "",
          age: editingPet.age ?? undefined,
          gender: editingPet.gender as "male" | "female" | "unknown",
          description: editingPet.description || "",
          imageUrl: editingPet.imageUrl || "",
          adoptionFee: editingPet.adoptionFee ? editingPet.adoptionFee.toString() : "",
        } : undefined}
        isLoading={createPetMutation.isPending || updatePetMutation.isPending}
        title={editingPetId ? "Edit Pet" : "Add New Pet"}
      />
    </div>
    </div>
  );
}
