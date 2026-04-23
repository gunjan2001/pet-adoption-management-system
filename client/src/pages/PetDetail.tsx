// src/pages/PetDetail.tsx (Updated for Cloudinary Media)
import { useAuth } from "@/_core/hooks/useAuth";
import ImageSlider from "@/components/ImageSlider";
import { usePet } from "@/hooks/usePets";
import { adoptionsApi } from "@/lib/api/adoptions.api";
import { getErrorMessage } from "@/lib/errorHandler";
import { ArrowLeft, CheckCircle2, Heart, Home, MapPin } from "lucide-react";
import { useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useLocation, useRoute } from "wouter";

// ── Validation ────────────────────────────────────────────────────────────────
const validateEmail = (email: string): true | string => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? true : "Valid email is required";
};
const validHomeTypes = ["house", "apartment", "condo", "townhouse", "other"];

interface ApplicationForm extends FieldValues {
  fullName: string; email: string; phone: string; address: string;
  homeType?: string; hasYard?: boolean; otherPets?: string;
  experience?: string; reason: string;
}

// ── Shared input styles ───────────────────────────────────────────────────────
const inp = "w-full px-4 py-2.5 border rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-shadow text-sm";
const inpErr = `${inp} border-red-300`;
const inpOk  = `${inp} border-gray-200`;

export default function PetDetail() {
  const [, params]      = useRoute("/pets/:id");
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const petId = params?.id ? parseInt(params.id, 10) : undefined;
  const { pet, isLoading, error } = usePet(petId);

  const [showForm,  setShowForm]  = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } =
    useForm<ApplicationForm>({
      defaultValues: {
        fullName: user?.name ?? "", email: user?.email ?? "",
        phone: user?.phone ?? "", address: user?.address ?? "",
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

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/60 to-white py-12 md:py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="h-6 w-24 bg-amber-100 rounded-lg mb-8 animate-pulse" />
          <div className="grid md:grid-cols-2 gap-12">
            <div className="aspect-square w-full rounded-3xl bg-amber-100 animate-pulse" />
            <div className="space-y-4 pt-2">
              {[3, 1.5, 1, 1, 0.75].map((w, i) => (
                <div key={i} className={`h-${i === 0 ? 10 : 5} rounded-xl bg-gray-100 animate-pulse`} style={{ width: `${w * 33}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error || !pet) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/60 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">🐾</p>
          <h1 className="text-3xl font-black text-gray-900 mb-4">{error ?? "Pet not found"}</h1>
          <button onClick={() => setLocation("/pets")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-colors shadow-lg shadow-amber-200">
            <ArrowLeft className="w-4 h-4" /> Back to Pets
          </button>
        </div>
      </div>
    );
  }

  const isAvailable = pet.status === "available";
  const statusConfig = {
    available: { bg: "bg-green-100 text-green-800",  dot: "bg-green-500",  label: "Available"  },
    pending:   { bg: "bg-amber-100 text-amber-800",  dot: "bg-amber-500",  label: "Pending"    },
    adopted:   { bg: "bg-gray-100  text-gray-600",   dot: "bg-gray-400",   label: "Adopted"    },
  }[pet.status];

  // Get images from media array, fallback to imageUrl for backward compatibility
  const imageUrls = pet?.images ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/60 to-white">
      <div className="container mx-auto px-4 max-w-6xl py-12 md:py-20">

        {/* ── Back ─────────────────────────────────────────────────────────── */}
        <button onClick={() => setLocation("/pets")}
          className="inline-flex items-center gap-2 mb-8 text-sm font-medium text-gray-500 hover:text-amber-600 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Pets
        </button>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
          {/* ── Image Slider ──────────────────────────────────────────────────────── */}
          <div className="relative">
            {/* Status badge floating on image */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg bg-white/95 backdrop-blur-sm border border-gray-100">
              <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
              <span className="text-gray-900">{statusConfig.label}</span>
            </div>

            {/* Image Slider Component */}
            <ImageSlider images={imageUrls} alt={pet.name} />
          </div>

          {/* ── Info ───────────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-6">
            {/* Name */}
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-1">{pet.name}</h1>
              <p className="text-lg text-gray-500 capitalize">{pet.breed || pet.species}</p>
            </div>

            {/* Stat grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Age",     value: pet.age != null ? `${Math.floor(pet.age/12)}yr ${pet.age%12}m` : "Unknown" },
                { label: "Gender",  value: pet.gender ?? "Unknown", cls: "capitalize" },
                { label: "Species", value: pet.species, cls: "capitalize" },
                pet.adoptionFee
                  ? { label: "Adoption Fee", value: `$${pet.adoptionFee}`, cls: "text-amber-600 font-bold text-xl" }
                  : { label: "Adoption Fee", value: "Free to adopt", cls: "text-green-600 font-semibold" },
              ].map(({ label, value, cls }) => (
                <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{label}</p>
                  <p className={`font-semibold text-gray-900 ${cls ?? ""}`}>{value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {pet.description && (
              <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">About {pet.name}</p>
                <p className="text-gray-700 text-sm leading-relaxed">{pet.description}</p>
              </div>
            )}

            {/* CTA */}
            {submitted ? (
              <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-2xl p-5">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-green-800 mb-1">Application submitted!</p>
                  <p className="text-sm text-green-700">We'll review it and be in touch soon.</p>
                  <button onClick={() => setLocation("/dashboard")}
                    className="mt-2 text-sm font-semibold text-green-700 hover:underline">
                    View my applications →
                  </button>
                </div>
              </div>

            ) : isAvailable ? (
              !showForm ? (
                <button
                  onClick={() => isAuthenticated ? setShowForm(true) : setLocation("/login")}
                  className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-base font-bold shadow-lg shadow-amber-200 hover:shadow-amber-300 transition-all flex items-center justify-center gap-2"
                >
                  <Heart className="w-5 h-5" />
                  {isAuthenticated ? "Apply to Adopt" : "Login to Apply"}
                </button>
              ) : (
                <button onClick={() => setShowForm(false)}
                  className="w-full py-3 rounded-2xl border-2 border-amber-300 text-amber-700 font-semibold hover:bg-amber-50 transition-colors text-sm">
                  ✕ Cancel Application
                </button>
              )
            ) : (
              <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 text-center">
                <p className="text-gray-500 font-medium">
                  {pet.status === "adopted"
                    ? "This pet has already found their forever home 🎉"
                    : "This pet is currently pending adoption"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Application Form ────────────────────────────────────────────────────── */}
        {showForm && isAvailable && (
        <div className="mt-12 bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Form header */}
            <div className="bg-amber-500 px-8 py-6">
              <h2 className="text-xl font-black text-white">Adoption Application</h2>
              <p className="text-amber-100 text-sm mt-1">Applying to adopt <span className="font-bold">{pet.name}</span></p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Full Name *</label>
                  <input {...register("fullName", { required: "Full name is required", minLength: { value: 2, message: "Full name is required" } })}
                    placeholder="Jane Doe" className={errors.fullName ? inpErr : inpOk} />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Email *</label>
                  <input {...register("email", { required: "Valid email is required", validate: validateEmail })}
                    type="email" placeholder="you@example.com" className={errors.email ? inpErr : inpOk} />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Phone *</label>
                  <input {...register("phone", { required: "Valid phone number is required", minLength: { value: 7, message: "Valid phone number is required" } })}
                    placeholder="+1 555 000 0000" className={errors.phone ? inpErr : inpOk} />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Address *</label>
                  <input {...register("address", { required: "Address is required", minLength: { value: 5, message: "Address is required" } })}
                    placeholder="123 Main St, City" className={errors.address ? inpErr : inpOk} />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 items-end">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                    <Home className="inline w-3.5 h-3.5 mr-1" /> Home Type
                  </label>
                  <select {...register("homeType", { validate: (v) => !v || validHomeTypes.includes(v) ? true : "Invalid home type" })}
                    className={inpOk}>
                    <option value="">Select…</option>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="condo">Condo</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <label className="flex items-center gap-3 cursor-pointer pb-2.5">
                  <input type="checkbox" {...register("hasYard")}
                    className="w-5 h-5 rounded-lg border-gray-300 accent-amber-500 cursor-pointer" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Has Yard / Outdoor Space</p>
                    <p className="text-xs text-gray-400">Check if your home has outdoor area</p>
                  </div>
                </label>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  <MapPin className="inline w-3.5 h-3.5 mr-1" /> Other Pets
                </label>
                <textarea {...register("otherPets")} rows={2}
                  placeholder="Do you have other pets? Describe them briefly…"
                  className={inpOk} />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Pet Ownership Experience</label>
                <textarea {...register("experience")} rows={3}
                  placeholder="Tell us about your experience caring for pets…"
                  className={inpOk} />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Why adopt {pet.name}? * <span className="normal-case font-normal text-gray-400">(min 20 chars)</span>
                </label>
                <textarea {...register("reason", {
                  required: "Please explain why you want to adopt (min 20 chars)",
                  minLength: { value: 20, message: "Please explain why you want to adopt (min 20 chars)" },
                })} rows={4}
                  placeholder="Share why you'd love to give this pet a forever home…"
                  className={errors.reason ? inpErr : inpOk} />
                {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason.message}</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={isSubmitting}
                  className="flex-1 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-amber-100">
                  {isSubmitting ? "Submitting…" : "Submit Application"}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
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