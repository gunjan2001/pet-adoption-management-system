import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Trash2, Edit2 } from "lucide-react";
import PetFormModal from "@/components/PetFormModal";
import AdminLayout from "@/components/AdminLayout";

export default function AdminManagePets() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [petFormOpen, setPetFormOpen] = useState(false);
  const [editingPetId, setEditingPetId] = useState<number | null>(null);

  // Redirect if not admin
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      setLocation("/");
    }
  }, [isAuthenticated, user?.role, setLocation]);

  // Queries
  const { data: pets, isLoading: petsLoading, refetch: refetchPets } = trpc.pets.list.useQuery(
    {
      page: 1,
      limit: 50,
    },
    {
      staleTime: 1000 * 60,
      enabled: isAuthenticated && user?.role === "admin",
    }
  );

  // Get editing pet data
  const editingPet = useMemo(() => {
    if (!editingPetId || !pets?.pets) return undefined;
    return pets.pets.find((p) => p.id === editingPetId);
  }, [editingPetId, pets?.pets]);

  // Mutations
  const createPetMutation = trpc.pets.create.useMutation({
    onSuccess: () => {
      toast.success("Pet added successfully");
      void refetchPets();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updatePetMutation = trpc.pets.update.useMutation({
    onSuccess: () => {
      toast.success("Pet updated successfully");
      void refetchPets();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deletePetMutation = trpc.pets.delete.useMutation({
    onSuccess: () => {
      toast.success("Pet deleted");
      void refetchPets();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

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
    <AdminLayout activeTab="pets">
      <div className="py-8 md:py-12">
        <div className="container">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-black">Manage Pets</h1>
            <p className="text-muted mt-2">Add, edit, or delete pets from the adoption list</p>
          </div>

          {/* Add Pet Button */}
          <div className="mb-8">
            <Button
              onClick={handleOpenCreateForm}
              className="bg-accent text-accent-foreground hover:opacity-90 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New Pet
            </Button>
          </div>

          {/* Pets Grid */}
          {petsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          ) : pets?.pets && pets.pets.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pets.pets.map((pet) => (
                <Card key={pet.id} className="overflow-hidden border border-border hover:shadow-lg transition-shadow">
                  {/* Pet Image */}
                  <div className="w-full h-40 bg-muted/20 flex items-center justify-center text-5xl overflow-hidden">
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
                      <h3 className="font-bold text-lg">{pet.name}</h3>
                      <p className="text-sm text-muted">{pet.breed || pet.species}</p>
                    </div>

                    <div className="text-sm space-y-1">
                      <p className="text-muted">
                        {pet.age ? `${Math.floor(pet.age / 12)} years • ` : ""}
                        {pet.gender}
                      </p>
                      <p className="text-muted capitalize">
                        Status: <span className="font-semibold text-foreground">{pet.status}</span>
                      </p>
                      {pet.adoptionFee && (
                        <p className="text-muted">
                          Fee: <span className="font-semibold text-foreground">${pet.adoptionFee}</span>
                        </p>
                      )}
                    </div>

                    {pet.description && (
                      <p className="text-sm text-muted line-clamp-2">{pet.description}</p>
                    )}

                    {/* Action Buttons */}
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
                          if (
                            confirm(
                              `Are you sure you want to delete ${pet.name}? This action cannot be undone.`
                            )
                          ) {
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
              <p className="text-lg text-muted mb-4">No pets found</p>
              <Button onClick={handleOpenCreateForm} className="bg-accent text-accent-foreground">
                Add Your First Pet
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Pet Form Modal */}
      <PetFormModal
        isOpen={petFormOpen}
        onClose={handleCloseForm}
        onSubmit={handlePetFormSubmit}
        initialData={
          editingPet
            ? {
                name: editingPet.name,
                species: editingPet.species,
                breed: editingPet.breed || "",
                age: editingPet.age ?? undefined,
                gender: editingPet.gender as "male" | "female" | "unknown",
                description: editingPet.description || "",
                imageUrl: editingPet.imageUrl || "",
                adoptionFee: editingPet.adoptionFee ? editingPet.adoptionFee.toString() : "",
                status: editingPet.status as "available" | "adopted" | "pending",
              }
            : undefined
        }
        isLoading={createPetMutation.isPending || updatePetMutation.isPending}
        title={editingPetId ? "Edit Pet" : "Add New Pet"}
      />
    </AdminLayout>
  );
}
