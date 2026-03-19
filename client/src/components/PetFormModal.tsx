import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { X, Upload, Image as ImageIcon } from "lucide-react";

const petFormSchema = z.object({
  name: z.string().min(1, "Pet name is required"),
  species: z.string().min(1, "Species is required"),
  breed: z.string().optional(),
  age: z.number().int().nonnegative().optional(),
  gender: z.enum(["male", "female", "unknown"]).optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional().or(z.literal("")),
  adoptionFee: z.string().optional(),
  status: z.enum(["available", "adopted", "pending"]).optional(),
});

type PetFormData = z.infer<typeof petFormSchema>;

interface PetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PetFormData) => Promise<void>;
  initialData?: PetFormData;
  isLoading?: boolean;
  title: string;
}

export default function PetFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
  title,
}: PetFormModalProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState<"url" | "file">("url");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<PetFormData>({
    resolver: zodResolver(petFormSchema),
    defaultValues: initialData || {
      name: "",
      species: "",
      breed: "",
      age: undefined,
      gender: "unknown",
      description: "",
      imageUrl: "",
      adoptionFee: "",
      status: "available",
    },
  });

  const imageUrl = watch("imageUrl");

  useEffect(() => {
    if (initialData) {
      reset(initialData);
      setImagePreview(initialData.imageUrl || null);
      setUploadMode("url");
    }
  }, [initialData, reset]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setValue("imageUrl", base64);
      setImagePreview(base64);
      toast.success("Image uploaded");
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = async (data: PetFormData) => {
    try {
      await onSubmit(data);
      reset();
      setImagePreview(null);
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to save pet");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          {/* Name and Species */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Pet Name *</label>
              <Input
                {...register("name")}
                placeholder="e.g., Buddy"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Species *</label>
              <select
                {...register("species")}
                className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent ${
                  errors.species ? "border-red-500" : "border-border"
                }`}
              >
                <option value="">Select Species</option>
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="rabbit">Rabbit</option>
                <option value="bird">Bird</option>
                <option value="other">Other</option>
              </select>
              {errors.species && (
                <p className="text-red-500 text-sm mt-1">{errors.species.message}</p>
              )}
            </div>
          </div>

          {/* Breed and Gender */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Breed</label>
              <Input
                {...register("breed")}
                placeholder="e.g., Golden Retriever"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Gender</label>
              <select
                {...register("gender")}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="unknown">Unknown</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          {/* Age and Adoption Fee */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Age (months)</label>
              <Input
                {...register("age", { valueAsNumber: true })}
                type="number"
                min="0"
                placeholder="e.g., 24"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Adoption Fee ($)</label>
              <Input
                {...register("adoptionFee")}
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g., 50.00"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-2">Pet Status</label>
            <select
              {...register("status")}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="available">Available</option>
              <option value="pending">Pending</option>
              <option value="adopted">Adopted</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              {...register("description")}
              placeholder="Tell us about this pet..."
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium mb-2">Image URL</label>
            <Input
              {...register("imageUrl")}
              type="url"
              placeholder="https://example.com/pet.jpg"
            />
            {imageUrl && (
              <div className="mt-3 rounded-lg overflow-hidden border border-border">
                <img
                  src={imageUrl}
                  alt="Pet preview"
                  className="w-full h-48 object-cover"
                  onError={() => toast.error("Failed to load image")}
                />
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="flex-1 bg-accent text-accent-foreground hover:opacity-90"
            >
              {isSubmitting || isLoading ? "Saving..." : "Save Pet"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
