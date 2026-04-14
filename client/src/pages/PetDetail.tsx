// src/pages/PetDetail.tsx
import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useForm, FieldValues } from "react-hook-form";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { usePet } from "@/hooks/usePets";
import { adoptionsApi } from "@/lib/api/adoptions.api";
import { getErrorMessage } from "@/lib/errorHandler";
import { useAuth } from "@/_core/hooks/useAuth";

// ── Custom validation functions ─────────────────────────────────────────────────
const validateEmail = (email: string): true | string => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? true : "Valid email is required";
};

const validHomeTypes = ["house", "apartment", "condo", "townhouse", "other"];

interface ApplicationForm extends FieldValues {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  homeType?: string;
  hasYard?: boolean;
  otherPets?: string;
  experience?: string;
  reason: string;
}

// ── Shared Tailwind class fragments ───────────────────────────────────────────
const inputBase =
  "w-full px-3 py-2 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors";
const inputNormal  = `${inputBase} border-border`;
const inputError   = `${inputBase} border-red-500 focus:ring-red-400`;
const labelClass   = "block text-sm font-medium mb-1";
const errorClass   = "text-red-500 text-xs mt-1";

export default function PetDetail() {
  const [, params]      = useRoute("/pets/:id");
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const petId = params?.id ? parseInt(params.id, 10) : undefined;
  const { pet, isLoading, error } = usePet(petId);

  const [showForm,  setShowForm]  = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ApplicationForm>({
    defaultValues: {
      fullName:  user?.name    ?? "",
      email:     user?.email   ?? "",
      phone:     user?.phone   ?? "",
      address:   user?.address ?? "",
    },
  });

  const onSubmit = async (data: ApplicationForm) => {
    if (!petId) return;
    try {
      const homeType = data.homeType as "house" | "apartment" | "condo" | "townhouse" | "other" | undefined;
      await adoptionsApi.submit({ petId, ...data, homeType });
      toast.success("Application submitted successfully!");
      reset();
      setShowForm(false);
      setSubmitted(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen py-12 md:py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="aspect-square w-full rounded-xl bg-muted animate-pulse" />
            <div className="space-y-4 pt-2">
              <div className="h-10 w-3/4 rounded bg-muted animate-pulse" />
              <div className="h-5  w-1/2 rounded bg-muted animate-pulse" />
              <div className="h-4  w-full rounded bg-muted animate-pulse" />
              <div className="h-4  w-full rounded bg-muted animate-pulse" />
              <div className="h-4  w-2/3 rounded bg-muted animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Error / not found ───────────────────────────────────────────────────────
  if (error || !pet) {
    return (
      <div className="min-h-screen py-12 md:py-20">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <p className="text-5xl mb-4">🐾</p>
          <h1 className="text-3xl font-bold mb-4">{error ?? "Pet not found"}</h1>
          <button
            onClick={() => setLocation("/pets")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Pets
          </button>
        </div>
      </div>
    );
  }

  const isAvailable  = pet.status === "available";
  const statusLabel  = pet.status === "available" ? "Available"
                     : pet.status === "pending"   ? "Pending"
                     : "Adopted";
  const statusColor  = pet.status === "available" ? "bg-green-500"
                     : pet.status === "pending"   ? "bg-yellow-500"
                     : "bg-gray-400";

  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* ── Back button ─────────────────────────────────────────────────── */}
        <button
          onClick={() => setLocation("/pets")}
          className="inline-flex items-center gap-2 mb-8 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Pets
        </button>

        <div className="grid md:grid-cols-2 gap-12">

          {/* ── Pet image ─────────────────────────────────────────────────── */}
          <div className="relative aspect-square w-full bg-muted/20 rounded-xl overflow-hidden">
            {pet.imageUrl ? (
              <img
                src={pet.imageUrl}
                alt={pet.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">
                🐾
              </div>
            )}
            <span className={`absolute top-4 right-4 px-4 py-1.5 rounded-full text-sm font-semibold text-white ${statusColor}`}>
              {statusLabel}
            </span>
          </div>

          {/* ── Pet info + action ──────────────────────────────────────────── */}
          <div className="space-y-6">

            {/* Name + breed */}
            <div>
              <h1 className="text-4xl md:text-5xl font-black mb-1">{pet.name}</h1>
              <p className="text-lg text-muted-foreground capitalize">
                {pet.breed || pet.species}
              </p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">Age</p>
                <p className="font-semibold">
                  {pet.age != null
                    ? `${Math.floor(pet.age / 12)} yr${Math.floor(pet.age / 12) !== 1 ? "s" : ""} ${pet.age % 12}m`
                    : "Unknown"}
                </p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">Gender</p>
                <p className="font-semibold capitalize">{pet.gender ?? "Unknown"}</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">Species</p>
                <p className="font-semibold capitalize">{pet.species}</p>
              </div>
              {pet.adoptionFee && (
                <div className="bg-card border border-border rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Adoption Fee</p>
                  <p className="text-xl font-bold text-primary">${pet.adoptionFee}</p>
                </div>
              )}
            </div>

            {/* Description */}
            {pet.description && (
              <div>
                <h3 className="font-bold mb-2">About {pet.name}</h3>
                <p className="text-muted-foreground leading-relaxed">{pet.description}</p>
              </div>
            )}

            {/* ── CTA / Form toggle ──────────────────────────────────────── */}
            {submitted ? (
              <div className="rounded-xl bg-green-50 border border-green-200 p-5 text-green-800">
                <p className="font-semibold mb-1">✅ Application submitted!</p>
                <p className="text-sm">We'll review your application and be in touch soon.</p>
                <button
                  onClick={() => setLocation("/dashboard")}
                  className="mt-3 text-sm font-medium underline hover:no-underline"
                >
                  View my applications →
                </button>
              </div>

            ) : isAvailable ? (
              !showForm ? (
                <button
                  onClick={() => isAuthenticated ? setShowForm(true) : setLocation("/login")}
                  className="w-full py-4 rounded-xl bg-primary text-primary-foreground text-base font-semibold hover:opacity-90 transition-opacity"
                >
                  {isAuthenticated ? "Apply to Adopt" : "Login to Apply"}
                </button>
              ) : null /* form rendered below outside the grid cell */
            ) : (
              <div className="rounded-xl bg-card border border-border p-5 text-center">
                <p className="text-muted-foreground font-medium">
                  {pet.status === "adopted"
                    ? "This pet has already been adopted 🎉"
                    : "This pet is currently pending adoption"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Adoption Application Form (full-width below grid) ────────────── */}
        {showForm && isAvailable && !submitted && (
          <div className="mt-12 bg-card border border-border rounded-xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Adoption Application for {pet.name}</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                ✕ Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

              {/* Row 1 — Name + Email */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Full Name *</label>
                  <input
                    {...register("fullName", {
                      required: "Full name is required",
                      minLength: { value: 2, message: "Full name is required" },
                    })}
                    placeholder="Jane Doe"
                    className={errors.fullName ? inputError : inputNormal}
                  />
                  {errors.fullName && <p className={errorClass}>{errors.fullName.message}</p>}
                </div>
                <div>
                  <label className={labelClass}>Email *</label>
                  <input
                    {...register("email", {
                      required: "Valid email is required",
                      validate: validateEmail,
                    })}
                    type="email"
                    placeholder="you@example.com"
                    className={errors.email ? inputError : inputNormal}
                  />
                  {errors.email && <p className={errorClass}>{errors.email.message}</p>}
                </div>
              </div>

              {/* Row 2 — Phone + Address */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Phone *</label>
                  <input
                    {...register("phone", {
                      required: "Valid phone number is required",
                      minLength: { value: 7, message: "Valid phone number is required" },
                    })}
                    placeholder="+1 555 000 0000"
                    className={errors.phone ? inputError : inputNormal}
                  />
                  {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
                </div>
                <div>
                  <label className={labelClass}>Address *</label>
                  <input
                    {...register("address", {
                      required: "Address is required",
                      minLength: { value: 5, message: "Address is required" },
                    })}
                    placeholder="123 Main St, City"
                    className={errors.address ? inputError : inputNormal}
                  />
                  {errors.address && <p className={errorClass}>{errors.address.message}</p>}
                </div>
              </div>

              {/* Row 3 — Home type + Yard */}
              <div className="grid md:grid-cols-2 gap-4 items-end">
                <div>
                  <label className={labelClass}>Home Type</label>
                  <select
                    {...register("homeType", {
                      validate: (value) => !value || validHomeTypes.includes(value) ? true : "Invalid home type",
                    })}
                    className={inputNormal}
                  >
                    <option value="">Select…</option>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="condo">Condo</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 pb-2">
                  <input
                    type="checkbox"
                    {...register("hasYard")}
                    id="hasYard"
                    className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                  />
                  <label htmlFor="hasYard" className="text-sm font-medium cursor-pointer">
                    I have a yard or outdoor space
                  </label>
                </div>
              </div>

              {/* Other pets */}
              <div>
                <label className={labelClass}>Other Pets</label>
                <textarea
                  {...register("otherPets")}
                  rows={2}
                  placeholder="Do you have other pets? Describe them briefly…"
                  className={inputNormal}
                />
              </div>

              {/* Experience */}
              <div>
                <label className={labelClass}>Pet Ownership Experience</label>
                <textarea
                  {...register("experience")}
                  rows={3}
                  placeholder="Tell us about your experience caring for pets…"
                  className={errors.experience ? inputError : inputNormal}
                />
                {errors.experience && <p className={errorClass}>{errors.experience.message}</p>}
              </div>

              {/* Reason */}
              <div>
                <label className={labelClass}>Why do you want to adopt {pet.name}? *</label>
                <textarea
                  {...register("reason", {
                    required: "Please explain why you want to adopt (min 20 chars)",
                    minLength: { value: 20, message: "Please explain why you want to adopt (min 20 chars)" },
                  })}
                  rows={4}
                  placeholder="Please share why you'd like to adopt this pet (min 20 characters)…"
                  className={errors.reason ? inputError : inputNormal}
                />
                {errors.reason && <p className={errorClass}>{errors.reason.message}</p>}
              </div>

              {/* Submit row */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  {isSubmitting ? "Submitting…" : "Submit Application"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 rounded-xl border border-border text-foreground font-semibold hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        )}
      </div>
    </div>
  );
}