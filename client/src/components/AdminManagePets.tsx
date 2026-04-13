// src/pages/AdminManagePets.tsx
import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { usePets } from "@/hooks/usePets";
import { petsApi } from "@/lib/api/pets.api";
import { getErrorMessage } from "@/lib/errorHandler";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Pet, CreatePetInput, PetStatus } from "@/types";

const EMPTY_FORM: CreatePetInput = {
  name: "", species: "", breed: "", description: "",
  imageUrl: "", gender: "unknown", status: "available",
};

const STATUS_COLORS: Record<PetStatus, string> = {
  available: "bg-green-100 text-green-800",
  pending:   "bg-yellow-100 text-yellow-800",
  adopted:   "bg-gray-100 text-gray-600",
};

export default function AdminManagePets() {
  const [, navigate] = useLocation();
  const { pets, isLoading, error, refetch } = usePets({ limit: 100 });

  const [search,  setSearch]  = useState("");
  const [dialog,  setDialog]  = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<Pet | null>(null);
  const [form,    setForm]    = useState<CreatePetInput>(EMPTY_FORM);
  const [saving,  setSaving]  = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const filtered = useMemo(
    () => pets.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.species.toLowerCase().includes(search.toLowerCase())
    ),
    [pets, search]
  );

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setSaveErr(null);
    setDialog("create");
  };

  const openEdit = (pet: Pet) => {
    setEditing(pet);
    setForm({
      name:        pet.name,
      species:     pet.species,
      breed:       pet.breed ?? "",
      description: pet.description ?? "",
      imageUrl:    pet.imageUrl ?? "",
      gender:      pet.gender ?? "unknown",
      status:      pet.status,
      age:         pet.age ?? undefined,
      adoptionFee: pet.adoptionFee ? Number(pet.adoptionFee) : undefined,
    });
    setSaveErr(null);
    setDialog("edit");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    setSaveErr(null);
    try {
      if (dialog === "create") {
        await petsApi.create(form);
      } else if (editing) {
        await petsApi.update(editing.id, form);
      }
      setDialog(null);
      refetch();
    } catch (err) {
      setSaveErr(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (pet: Pet) => {
    if (!confirm(`Delete ${pet.name}? This cannot be undone.`)) return;
    try {
      await petsApi.delete(pet.id);
      refetch();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Manage Pets</h1>
          <p className="text-muted-foreground">{pets.length} total pets</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/admin")}>← Dashboard</Button>
          <Button onClick={openCreate}>+ Add Pet</Button>
        </div>
      </div>

      {/* ── Search ──────────────────────────────────────────────────────── */}
      <Input
        placeholder="Search by name or species…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6 max-w-sm"
      />

      {/* ── Error ───────────────────────────────────────────────────────── */}
      {error && <p className="text-destructive mb-4">{error}</p>}

      {/* ── Pet Grid ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-40 w-full rounded-t-lg" />
                <CardContent className="pt-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))
          : filtered.map((pet) => (
              <Card key={pet.id} className="flex flex-col">
                {pet.imageUrl ? (
                  <img src={pet.imageUrl} alt={pet.name} className="h-40 w-full object-cover rounded-t-lg" />
                ) : (
                  <div className="h-40 bg-muted rounded-t-lg flex items-center justify-center text-4xl">🐾</div>
                )}
                <CardContent className="pt-3 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-1">
                    <p className="font-semibold truncate">{pet.name}</p>
                    <Badge className={`text-xs flex-shrink-0 ${STATUS_COLORS[pet.status]}`}>
                      {pet.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground capitalize">{pet.species}</p>
                  <div className="flex gap-2 mt-auto pt-3">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(pet)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleDelete(pet)}>
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {!isLoading && filtered.length === 0 && (
        <p className="text-center text-muted-foreground mt-12">No pets found.</p>
      )}

      {/* ── Create / Edit Dialog ─────────────────────────────────────────── */}
      <Dialog open={!!dialog} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{dialog === "create" ? "Add New Pet" : `Edit ${editing?.name}`}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1">
              <Label>Name *</Label>
              <Input name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="space-y-1">
              <Label>Species *</Label>
              <Input name="species" value={form.species} onChange={handleChange} required />
            </div>
            <div className="space-y-1">
              <Label>Breed</Label>
              <Input name="breed" value={form.breed ?? ""} onChange={handleChange} />
            </div>
            <div className="space-y-1">
              <Label>Age (months)</Label>
              <Input name="age" type="number" value={form.age ?? ""} onChange={handleChange} min={0} />
            </div>
            <div className="space-y-1">
              <Label>Gender</Label>
              <Select value={form.gender ?? "unknown"} onValueChange={(v) => setForm((f) => ({ ...f, gender: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={form.status ?? "available"} onValueChange={(v) => setForm((f) => ({ ...f, status: v as PetStatus }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="adopted">Adopted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Adoption Fee ($)</Label>
              <Input name="adoptionFee" type="number" value={form.adoptionFee ?? ""} onChange={handleChange} min={0} step={0.01} />
            </div>
            <div className="space-y-1">
              <Label>Image URL</Label>
              <Input name="imageUrl" value={form.imageUrl ?? ""} onChange={handleChange} />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Description</Label>
              <Textarea name="description" value={form.description ?? ""} onChange={handleChange} rows={3} />
            </div>
          </div>

          {saveErr && <p className="text-sm text-destructive">{saveErr}</p>}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : dialog === "create" ? "Add Pet" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
