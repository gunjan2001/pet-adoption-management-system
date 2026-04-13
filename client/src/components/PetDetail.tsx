// src/pages/PetDetail.tsx
import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePet } from "@/hooks/usePets";
import { useAuth } from "@/_core/hooks/useAuth";
import { adoptionsApi } from "@/lib/api/adoptions.api";
import { getErrorMessage } from "@/lib/errorHandler";
import type { CreateApplicationInput } from "@/types";

const STATUS_COLORS = {
  available: "bg-green-100 text-green-800",
  pending:   "bg-yellow-100 text-yellow-800",
  adopted:   "bg-gray-100 text-gray-600",
};

export default function PetDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const { pet, isLoading, error } = usePet(id ? Number(id) : undefined);

  const [showForm,    setShowForm]    = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted,   setSubmitted]   = useState(false);

  const [form, setForm] = useState<Omit<CreateApplicationInput, "petId">>({
    fullName:   user?.name ?? "",
    email:      user?.email ?? "",
    phone:      user?.phone ?? "",
    address:    user?.address ?? "",
    reason:     "",
    homeType:   undefined,
    hasYard:    false,
    otherPets:  "",
    experience: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pet) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await adoptionsApi.submit({ ...form, petId: pet.id });
      setSubmitted(true);
      setShowForm(false);
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-80 w-full rounded-lg mb-6" />
        <Skeleton className="h-8 w-1/3 mb-3" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-destructive text-lg mb-4">{error ?? "Pet not found"}</p>
        <Button variant="outline" onClick={() => navigate("/pets")}>
          Back to listings
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* ── Pet header ────────────────────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div>
          {pet.imageUrl ? (
            <img
              src={pet.imageUrl}
              alt={pet.name}
              className="w-full h-80 object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-80 bg-muted rounded-lg flex items-center justify-center text-6xl">
              🐾
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{pet.name}</h1>
            <Badge className={STATUS_COLORS[pet.status]}>{pet.status}</Badge>
          </div>

          <div className="space-y-1 text-muted-foreground">
            <p><span className="font-medium text-foreground">Species:</span> {pet.species}</p>
            {pet.breed    && <p><span className="font-medium text-foreground">Breed:</span> {pet.breed}</p>}
            {pet.gender   && <p><span className="font-medium text-foreground">Gender:</span> {pet.gender}</p>}
            {pet.age !== null && (
              <p>
                <span className="font-medium text-foreground">Age:</span>{" "}
                {Math.floor((pet.age ?? 0) / 12) > 0
                  ? `${Math.floor((pet.age ?? 0) / 12)} year(s) ${(pet.age ?? 0) % 12} month(s)`
                  : `${pet.age} month(s)`}
              </p>
            )}
            {pet.adoptionFee && (
              <p><span className="font-medium text-foreground">Adoption fee:</span> ${pet.adoptionFee}</p>
            )}
          </div>

          {pet.description && (
            <p className="text-muted-foreground leading-relaxed">{pet.description}</p>
          )}

          {/* ── CTA ──────────────────────────────────────────────────────── */}
          {submitted ? (
            <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-green-800">
              ✅ Application submitted! We'll be in touch soon.
            </div>
          ) : pet.status === "available" ? (
            isAuthenticated && user?.role === "user" ? (
              <Button onClick={() => setShowForm((s) => !s)} className="w-full">
                {showForm ? "Cancel" : "Apply to Adopt"}
              </Button>
            ) : !isAuthenticated ? (
              <Button onClick={() => navigate("/login")} className="w-full">
                Login to Apply
              </Button>
            ) : null
          ) : (
            <p className="text-muted-foreground italic">
              This pet is currently {pet.status} and not accepting applications.
            </p>
          )}
        </div>
      </div>

      {/* ── Adoption Application Form ────────────────────────────────────── */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Adoption Application for {pet.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="fullName">Full name *</Label>
                  <Input id="fullName" name="fullName" value={form.fullName} onChange={handleChange} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input id="phone" name="phone" value={form.phone} onChange={handleChange} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="address">Address *</Label>
                  <Input id="address" name="address" value={form.address} onChange={handleChange} required />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="reason">Why do you want to adopt {pet.name}? * (min 20 characters)</Label>
                <Textarea id="reason" name="reason" value={form.reason} onChange={handleChange} rows={4} required />
              </div>

              <div className="space-y-1">
                <Label htmlFor="experience">Previous pet ownership experience</Label>
                <Textarea id="experience" name="experience" value={form.experience} onChange={handleChange} rows={3} />
              </div>

              <div className="space-y-1">
                <Label htmlFor="otherPets">Do you have other pets?</Label>
                <Input id="otherPets" name="otherPets" value={form.otherPets} onChange={handleChange} />
              </div>

              {submitError && (
                <p className="text-sm text-destructive">{submitError}</p>
              )}

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Submitting…" : "Submit Application"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
