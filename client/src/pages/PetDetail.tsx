import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

const adoptionApplicationSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  address: z.string().min(5, "Address is required"),
  homeType: z.string().optional(),
  hasYard: z.boolean().optional(),
  otherPets: z.string().optional(),
  experience: z.string().min(10, "Please describe your pet experience"),
  reason: z.string().min(20, "Please explain why you want to adopt"),
});

type AdoptionApplicationFormData = z.infer<typeof adoptionApplicationSchema>;

export default function PetDetail() {
  const [, params] = useRoute("/pets/:id");
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const petId = params?.id ? parseInt(params.id) : 0;

  const { data: pet, isLoading: petLoading } = trpc.pets.detail.useQuery({ id: petId });
  const submitApplication = trpc.applications.submit.useMutation();
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AdoptionApplicationFormData>({
    resolver: zodResolver(adoptionApplicationSchema),
    defaultValues: {
      fullName: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
    },
  });

  const onSubmit = async (data: AdoptionApplicationFormData) => {
    try {
      await submitApplication.mutateAsync({
        petId,
        ...data,
      });
      toast.success("Application submitted successfully!");
      reset();
      setShowForm(false);
      setLocation("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit application");
    }
  };

  if (petLoading) {
    return (
      <div className="min-h-screen py-12 md:py-20">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12">
            <Skeleton className="h-96 w-full" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen py-12 md:py-20">
        <div className="container text-center">
          <h1 className="text-3xl font-bold mb-4">Pet not found</h1>
          <Button asChild className="bg-accent text-accent-foreground">
            <a href="/pets">Back to Pets</a>
          </Button>
        </div>
      </div>
    );
  }

  const isAvailable = pet.status === "available";

  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="container">
        {/* Back Button */}
        <Button
          asChild
          variant="ghost"
          className="mb-8 flex items-center gap-2"
        >
          <a href="/pets" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Pets
          </a>
        </Button>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Pet Image */}
          <div className="space-y-4">
            <div className="relative w-full aspect-square bg-muted/20 rounded-lg overflow-hidden">
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
              {/* Status Badge */}
              <div className={`absolute top-4 right-4 px-4 py-2 rounded-full text-sm font-semibold text-white ${
                isAvailable ? "bg-green-500" : pet.status === "pending" ? "bg-yellow-500" : "bg-gray-500"
              }`}>
                {isAvailable ? "Available" : pet.status === "pending" ? "Pending" : "Adopted"}
              </div>
            </div>
          </div>

          {/* Pet Info & Application Form */}
          <div className="space-y-8">
            {/* Pet Information */}
            <div className="space-y-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-black mb-2">{pet.name}</h1>
                <p className="text-lg text-muted">{pet.breed || pet.species}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card border border-border rounded-lg p-4">
                  <p className="text-sm text-muted mb-1">Age</p>
                  <p className="font-semibold">
                    {pet.age ? `${Math.floor(pet.age / 12)} years` : "Unknown"}
                  </p>
                </div>
                <div className="bg-card border border-border rounded-lg p-4">
                  <p className="text-sm text-muted mb-1">Gender</p>
                  <p className="font-semibold capitalize">{pet.gender || "Unknown"}</p>
                </div>
              </div>

              {pet.adoptionFee && (
                <div className="bg-card border border-border rounded-lg p-4">
                  <p className="text-sm text-muted mb-1">Adoption Fee</p>
                  <p className="text-2xl font-bold text-accent">${pet.adoptionFee}</p>
                </div>
              )}

              {pet.description && (
                <div>
                  <h3 className="font-bold mb-2">About {pet.name}</h3>
                  <p className="text-muted leading-relaxed">{pet.description}</p>
                </div>
              )}
            </div>

            {/* Application Form */}
            {isAvailable ? (
              <>
                {!showForm ? (
                  <Button
                    onClick={() => {
                      if (!isAuthenticated) {
                        setLocation("/login")
                      } else {
                        setShowForm(true);
                      }
                    }}
                    className="w-full bg-accent text-accent-foreground hover:opacity-90 text-base font-semibold py-6"
                  >
                    {isAuthenticated ? "Apply to Adopt" : "Login to Apply"}
                  </Button>
                ) : (
                  <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                    <h3 className="font-bold text-lg">Adoption Application</h3>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      {/* Full Name */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Full Name</label>
                        <Input
                          {...register("fullName")}
                          placeholder="Your full name"
                          className={errors.fullName ? "border-red-500" : ""}
                        />
                        {errors.fullName && (
                          <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <Input
                          {...register("email")}
                          type="email"
                          placeholder="your@email.com"
                          className={errors.email ? "border-red-500" : ""}
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                        )}
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Phone</label>
                        <Input
                          {...register("phone")}
                          placeholder="(555) 123-4567"
                          className={errors.phone ? "border-red-500" : ""}
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                        )}
                      </div>

                      {/* Address */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Address</label>
                        <Input
                          {...register("address")}
                          placeholder="Your address"
                          className={errors.address ? "border-red-500" : ""}
                        />
                        {errors.address && (
                          <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                        )}
                      </div>

                      {/* Home Type */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Home Type</label>
                        <select
                          {...register("homeType")}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                        >
                          <option value="">Select...</option>
                          <option value="house">House</option>
                          <option value="apartment">Apartment</option>
                          <option value="condo">Condo</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      {/* Has Yard */}
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          {...register("hasYard")}
                          id="hasYard"
                          className="w-4 h-4 rounded border-border"
                        />
                        <label htmlFor="hasYard" className="text-sm font-medium">
                          I have a yard
                        </label>
                      </div>

                      {/* Other Pets */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Other Pets</label>
                        <textarea
                          {...register("otherPets")}
                          placeholder="Do you have other pets? Describe them..."
                          rows={2}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      </div>

                      {/* Experience */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Pet Experience</label>
                        <textarea
                          {...register("experience")}
                          placeholder="Tell us about your experience with pets..."
                          rows={3}
                          className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent ${
                            errors.experience ? "border-red-500" : "border-border"
                          }`}
                        />
                        {errors.experience && (
                          <p className="text-red-500 text-sm mt-1">{errors.experience.message}</p>
                        )}
                      </div>

                      {/* Reason */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Why do you want to adopt?</label>
                        <textarea
                          {...register("reason")}
                          placeholder="Tell us why you want to adopt this pet..."
                          rows={3}
                          className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent ${
                            errors.reason ? "border-red-500" : "border-border"
                          }`}
                        />
                        {errors.reason && (
                          <p className="text-red-500 text-sm mt-1">{errors.reason.message}</p>
                        )}
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-3 pt-4">
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 bg-accent text-accent-foreground hover:opacity-90"
                        >
                          {isSubmitting ? "Submitting..." : "Submit Application"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowForm(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-card border border-border rounded-lg p-6 text-center">
                <p className="text-lg font-semibold text-muted">
                  {pet.status === "adopted" ? "This pet has been adopted" : "This pet is no longer available"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
