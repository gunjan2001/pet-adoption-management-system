// src/pages/AdminManagePets.tsx
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { usePets } from "@/hooks/usePets";
import { petsApi } from "@/lib/api/pets.api";
import { getErrorMessage } from "@/lib/errorHandler";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, ArrowLeft, Search, X } from "lucide-react";
import type { Pet, CreatePetInput, PetStatus, Gender } from "@/types";

// ── Shared input style ────────────────────────────────────────────────────────
const inp = "w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm";

// ── Blank form ────────────────────────────────────────────────────────────────
const BLANK: CreatePetInput = {
  name: "", species: "", breed: "", description: "", imageUrl: "",
  gender: "unknown", status: "available",
};

const STATUS_DOT: Record<PetStatus, string> = {
  available: "bg-green-500",
  pending:   "bg-yellow-500",
  adopted:   "bg-gray-400",
};

export default function AdminManagePets() {
  const { logout, user } = useAuth();
  const [, navigate]     = useLocation();

  const { pets, isLoading, error, refetch } = usePets({ limit: 500, page: 1 });

  // ── Search ────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () => pets.filter(
      (p) => p.name.toLowerCase().includes(search.toLowerCase()) ||
             p.species.toLowerCase().includes(search.toLowerCase())
    ),
    [pets, search]
  );

  // ── Form state ────────────────────────────────────────────────────────────
  const [showForm,  setShowForm]  = useState(false);
  const [editing,   setEditing]   = useState<Pet | null>(null);
  const [form,      setForm]      = useState<CreatePetInput>(BLANK);
  const [saving,    setSaving]    = useState(false);
  const [deleting,  setDeleting]  = useState<number | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm(BLANK);
    setShowForm(true);
  };

  const openEdit = (pet: Pet) => {
    setEditing(pet);
    setForm({
      name:        pet.name,
      species:     pet.species,
      breed:       pet.breed       ?? "",
      description: pet.description ?? "",
      imageUrl:    pet.imageUrl    ?? "",
      gender:      pet.gender      ?? "unknown",
      status:      pet.status,
      age:         pet.age         ?? undefined,
      adoptionFee: pet.adoptionFee ? Number(pet.adoptionFee) : undefined,
    });
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditing(null); };

  const set = (field: keyof CreatePetInput) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await petsApi.update(editing.id, form);
        toast.success(`${form.name} updated`);
      } else {
        await petsApi.create(form);
        toast.success(`${form.name} added`);
      }
      closeForm();
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (pet: Pet) => {
    if (!confirm(`Delete "${pet.name}"? This cannot be undone.`)) return;
    setDeleting(pet.id);
    try {
      await petsApi.delete(pet.id);
      toast.success(`${pet.name} deleted`);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">

      <main className="container mx-auto px-4 max-w-7xl py-8">

        {/* ── Title + actions ──────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black">Manage Pets</h1>
            <p className="text-muted-foreground mt-1">
              {pets.length} pet{pets.length !== 1 ? "s" : ""} in total
            </p>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Add Pet
          </button>
        </div>

        {/* ── Search ───────────────────────────────────────────────────────── */}
        <div className="relative mb-6 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or species…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${inp} pl-9`}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── Error ────────────────────────────────────────────────────────── */}
        {error && <p className="text-destructive mb-4 text-sm">{error}</p>}

        {/* ── Grid ─────────────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border overflow-hidden animate-pulse">
                <div className="h-40 bg-muted" />
                <div className="p-4 space-y-2">
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-1/2 bg-muted rounded" />
                  <div className="h-8 w-full bg-muted rounded mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-xl">
            <p className="text-5xl mb-4">🐾</p>
            <p className="text-muted-foreground mb-4">
              {search ? "No pets match your search." : "No pets yet."}
            </p>
            {!search && (
              <button onClick={openCreate} className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
                Add Your First Pet
              </button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((pet) => (
              <div key={pet.id} className="rounded-xl border border-border overflow-hidden bg-card hover:shadow-md transition-shadow flex flex-col">
                {/* Image */}
                <div className="relative h-40 bg-muted flex-shrink-0">
                  {pet.imageUrl
                    ? <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-4xl">🐾</div>}
                  {/* Status dot */}
                  <span className={`absolute top-2 right-2 w-3 h-3 rounded-full border-2 border-white ${STATUS_DOT[pet.status]}`} title={pet.status} />
                </div>
                {/* Info */}
                <div className="p-4 flex flex-col flex-1">
                  <p className="font-bold truncate">{pet.name}</p>
                  <p className="text-xs text-muted-foreground capitalize mb-1">{pet.species}{pet.breed ? ` · ${pet.breed}` : ""}</p>
                  <div className="text-xs text-muted-foreground space-y-0.5 mb-3">
                    {pet.age != null && <p>{Math.floor(pet.age / 12)} yr{Math.floor(pet.age / 12) !== 1 ? "s" : ""} {pet.age % 12}m · {pet.gender ?? "—"}</p>}
                    {pet.adoptionFee && <p>Fee: ${pet.adoptionFee}</p>}
                    <p className="capitalize font-medium text-foreground">{pet.status}</p>
                  </div>
                  {/* Actions */}
                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => openEdit(pet)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(pet)}
                      disabled={deleting === pet.id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-50 text-red-600 border border-red-200 text-sm hover:bg-red-100 disabled:opacity-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {deleting === pet.id ? "…" : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Slide-in Form Panel ───────────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="flex-1 bg-black/70 backdrop-blur-sm" onClick={closeForm} />
          {/* Panel */}
          <div className="w-full max-w-lg z-10 bg-white border-l border-border border-zinc-200 shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
              <h2 className="font-bold text-lg">{editing ? `Edit ${editing.name}` : "Add New Pet"}</h2>
              <button onClick={closeForm} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Name + Species */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block">Name *</label>
                  <input value={form.name} onChange={set("name")} required placeholder="Buddy" className={inp} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Species *</label>
                  <input value={form.species} onChange={set("species")} required placeholder="dog" className={inp} />
                </div>
              </div>

              {/* Breed + Age */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block">Breed</label>
                  <input value={form.breed ?? ""} onChange={set("breed")} placeholder="Labrador" className={inp} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Age (months)</label>
                  <input
                    type="number" min={0}
                    value={form.age ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, age: e.target.value ? Number(e.target.value) : undefined }))}
                    placeholder="24"
                    className={inp}
                  />
                </div>
              </div>

              {/* Gender + Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block">Gender</label>
                  <select value={form.gender ?? "unknown"} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value as Gender }))} className={inp}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Status</label>
                  <select value={form.status ?? "available"} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as PetStatus }))} className={inp}>
                    <option value="available">Available</option>
                    <option value="pending">Pending</option>
                    <option value="adopted">Adopted</option>
                  </select>
                </div>
              </div>

              {/* Adoption fee */}
              <div>
                <label className="text-xs font-medium mb-1 block">Adoption Fee ($)</label>
                <input
                  type="number" min={0} step={0.01}
                  value={form.adoptionFee ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, adoptionFee: e.target.value ? Number(e.target.value) : undefined }))}
                  placeholder="150.00"
                  className={inp}
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="text-xs font-medium mb-1 block">Image URL</label>
                <input value={form.imageUrl ?? ""} onChange={set("imageUrl")} placeholder="https://…" className={inp} />
                {form.imageUrl && (
                  <img src={form.imageUrl} alt="preview" className="mt-2 w-full h-32 object-cover rounded-lg" onError={(e) => (e.currentTarget.style.display = "none")} />
                )}
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-medium mb-1 block">Description</label>
                <textarea value={form.description ?? ""} onChange={set("description")} rows={3} placeholder="Tell adopters about this pet…" className={inp} />
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {saving ? "Saving…" : editing ? "Save Changes" : "Add Pet"}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
