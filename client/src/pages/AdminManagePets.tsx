import DeletePetModal from "@/components/DeletePetModal";
import ImageUploadField from "@/components/ImageUploadField";
import { usePets } from "@/hooks/usePets";
import { petsApi } from "@/lib/api/pets.api";
import { getErrorMessage } from "@/lib/errorHandler";
import type {
  CreatePetInput,
  Gender,
  MediaItem,
  Pet,
  PetStatus,
} from "@/types";
import { Edit2, Plus, Search, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

// Extended Pet type with media
interface PetWithMedia extends Pet {
  media?: MediaItem[];
}

// ── Shared input style ────────────────────────────────────────────────────────
const inp =
  "w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm transition-all";

// ── Extended form type with media ──────────────────────────────────────────
interface PetFormInput extends Omit<CreatePetInput, "imageUrl"> {
  mediaItems: MediaItem[];
}

// ── Blank form ────────────────────────────────────────────────────────────────
const BLANK: PetFormInput = {
  name: "",
  species: "",
  breed: "",
  description: "",
  gender: "unknown",
  status: "available",
  mediaItems: [],
};

const STATUS_DOT: Record<PetStatus, string> = {
  available: "bg-green-500",
  pending: "bg-amber-500",
  adopted: "bg-gray-400",
};

export default function AdminManagePets() {
  const { pets, isLoading, error, refetch } = usePets({ limit: 500, page: 1 });

  // ── Search ────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () =>
      pets.filter(
        p =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.species.toLowerCase().includes(search.toLowerCase())
      ),
    [pets, search]
  );

  // ── Form state ────────────────────────────────────────────────────────────
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PetWithMedia | null>(null);
  const [form, setForm] = useState<PetFormInput>(BLANK);
  const [saving, setSaving] = useState(false);

  // ── Delete modal state ────────────────────────────────────────────────────
  const [petToDelete, setPetToDelete] = useState<Pet | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm(BLANK);
    setShowForm(true);
  };

  const openEdit = (pet: PetWithMedia) => {
    setEditing(pet);
    // Get media items from pet
    const mediaItems = pet.images || [];

    setForm({
      name: pet.name,
      species: pet.species,
      breed: pet.breed ?? "",
      description: pet.description ?? "",
      gender: pet.gender ?? "unknown",
      status: pet.status,
      age: pet.age ?? undefined,
      adoptionFee: pet.adoptionFee ? Number(pet.adoptionFee) : undefined,
      mediaItems: mediaItems,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(BLANK);
  };

  const set =
    (field: keyof PetFormInput) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) =>
      setForm(f => ({ ...f, [field]: e.target.value }));

  const handleMediaItemsChange = (items: MediaItem[]) => {
    setForm(f => ({ ...f, mediaItems: items }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      console.log("form", form);

      // Extract media IDs from media items
      const mediaIds = form.mediaItems.map(item => item.id);

      // Prepare data to send
      const dataToSend = {
        name: form.name,
        species: form.species,
        breed: form.breed || undefined,
        description: form.description || undefined,
        gender: form.gender,
        status: form.status,
        age: form.age,
        adoptionFee: form.adoptionFee,
        mediaIds, // Send array of media IDs
      };

      if (editing) {
        await petsApi.update(editing.id, dataToSend);
        toast.success(`${form.name} updated`);
      } else {
        await petsApi.create(dataToSend);
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

  const handleDeleteClick = (pet: Pet) => {
    setPetToDelete(pet);
  };

  const handleDeleteConfirm = async () => {
    if (!petToDelete) return;

    setDeleting(true);
    try {
      await petsApi.delete(petToDelete.id);
      toast.success(`${petToDelete.name} deleted`);
      setPetToDelete(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    if (!deleting) {
      setPetToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <main className="container mx-auto px-4 max-w-7xl py-8">
        {/* ── Title + actions ──────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Manage Pets</h1>
            <p className="text-gray-600 mt-1">
              {pets.length} pet{pets.length !== 1 ? "s" : ""} in total
            </p>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-lg shadow-amber-200 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Pet
          </button>
        </div>

        {/* ── Search ───────────────────────────────────────────────────────── */}
        <div className="relative mb-6 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or species…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`${inp} pl-9`}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── Error ────────────────────────────────────────────────────────── */}
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

        {/* ── Grid ─────────────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-100 overflow-hidden animate-pulse"
              >
                <div className="h-40 bg-gray-100" />
                <div className="p-4 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-100 rounded" />
                  <div className="h-3 w-1/2 bg-gray-100 rounded" />
                  <div className="h-8 w-full bg-gray-100 rounded mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-200 rounded-2xl bg-white">
            <p className="text-5xl mb-4">🐾</p>
            <p className="text-gray-600 mb-4">
              {search ? "No pets match your search." : "No pets yet."}
            </p>
            {!search && (
              <button
                onClick={openCreate}
                className="px-7 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-lg shadow-amber-200 transition-all"
              >
                Add Your First Pet
              </button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(pet => {
              const petWithMedia = pet as PetWithMedia;
              // Get first image from media array
              const displayImage = petWithMedia.media?.[0]?.url || pet.imageUrl;

              return (
                <div
                  key={pet.id}
                  className="rounded-2xl border border-gray-100 overflow-hidden bg-white hover:shadow-lg transition-shadow flex flex-col"
                >
                  {/* Image */}
                  <div className="relative h-40 bg-gray-50 flex-shrink-0">
                    {displayImage ? (
                      <img
                        src={displayImage}
                        alt={pet.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        🐾
                      </div>
                    )}
                    {/* Status dot */}
                    <span
                      className={`absolute top-2 right-2 w-3 h-3 rounded-full border-2 border-white ${STATUS_DOT[pet.status]}`}
                      title={pet.status}
                    />
                    {/* Image count badge */}
                    {petWithMedia.media && petWithMedia.media.length > 1 && (
                      <span className="absolute top-2 left-2 px-2 py-1 rounded-md bg-black/60 text-white text-xs font-medium">
                        {petWithMedia.media.length} photos
                      </span>
                    )}
                  </div>
                  {/* Info */}
                  <div className="p-4 flex flex-col flex-1">
                    <p className="font-bold text-gray-900 truncate">
                      {pet.name}
                    </p>
                    <p className="text-xs text-gray-600 capitalize mb-1">
                      {pet.species}
                      {pet.breed ? ` · ${pet.breed}` : ""}
                    </p>
                    <div className="text-xs text-gray-600 space-y-0.5 mb-3">
                      {pet.age != null && (
                        <p>
                          {Math.floor(pet.age / 12)} yr
                          {Math.floor(pet.age / 12) !== 1 ? "s" : ""}{" "}
                          {pet.age % 12}m · {pet.gender ?? "—"}
                        </p>
                      )}
                      {pet.adoptionFee && <p>Fee: ${pet.adoptionFee}</p>}
                      <p className="capitalize font-medium text-gray-900">
                        {pet.status}
                      </p>
                    </div>
                    {/* Actions */}
                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => openEdit(petWithMedia)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 hover:border-amber-300 hover:text-amber-600 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(pet)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-50 text-red-600 border border-red-200 text-sm hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── Slide-in Form Panel ───────────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/70 backdrop-blur-sm"
            onClick={closeForm}
          />
          {/* Panel */}
          <div className="w-full max-w-lg z-10 bg-white border-l border-gray-200 shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="font-bold text-lg text-gray-900">
                {editing ? `Edit ${editing.name}` : "Add New Pet"}
              </h2>
              <button
                onClick={closeForm}
                className="text-gray-400 hover:text-gray-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Name + Species */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                    Name *
                  </label>
                  <input
                    value={form.name}
                    onChange={set("name")}
                    required
                    placeholder="Buddy"
                    className={inp}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                    Species *
                  </label>
                  <input
                    value={form.species}
                    onChange={set("species")}
                    required
                    placeholder="dog"
                    className={inp}
                  />
                </div>
              </div>

              {/* Breed + Age */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                    Breed
                  </label>
                  <input
                    value={form.breed ?? ""}
                    onChange={set("breed")}
                    placeholder="Labrador"
                    className={inp}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                    Age (months)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.age ?? ""}
                    onChange={e =>
                      setForm(f => ({
                        ...f,
                        age: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      }))
                    }
                    placeholder="24"
                    className={inp}
                  />
                </div>
              </div>

              {/* Gender + Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                    Gender
                  </label>
                  <select
                    value={form.gender ?? "unknown"}
                    onChange={e =>
                      setForm(f => ({ ...f, gender: e.target.value as Gender }))
                    }
                    className={inp}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                    Status
                  </label>
                  <select
                    value={form.status ?? "available"}
                    onChange={e =>
                      setForm(f => ({
                        ...f,
                        status: e.target.value as PetStatus,
                      }))
                    }
                    className={inp}
                  >
                    <option value="available">Available</option>
                    <option value="pending">Pending</option>
                    <option value="adopted">Adopted</option>
                  </select>
                </div>
              </div>

              {/* Adoption fee */}
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                  Adoption Fee ($)
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.adoptionFee ?? ""}
                  onChange={e =>
                    setForm(f => ({
                      ...f,
                      adoptionFee: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    }))
                  }
                  placeholder="150.00"
                  className={inp}
                />
              </div>

              {/* Image Upload (Cloudinary) */}
              <ImageUploadField
                mediaItems={form.mediaItems}
                onChange={handleMediaItemsChange}
                maxImages={5}
                maxSizeMB={5}
              />

              {/* Description */}
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                  Description
                </label>
                <textarea
                  value={form.description ?? ""}
                  onChange={set("description")}
                  rows={3}
                  placeholder="Tell adopters about this pet…"
                  className={inp}
                />
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-7 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-lg shadow-amber-200 transition-all disabled:opacity-50"
                >
                  {saving ? "Saving…" : editing ? "Save Changes" : "Add Pet"}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:border-amber-300 hover:text-amber-600 font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ─────────────────────────────────────────── */}
      <DeletePetModal
        isOpen={!!petToDelete}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        pet={petToDelete}
        isLoading={deleting}
      />
    </div>
  );
}
