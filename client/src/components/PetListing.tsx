// src/pages/PetListing.tsx
import { useState } from "react";
import { Link } from "wouter";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePets } from "@/hooks/usePets";
import type { PetFilters, PetStatus, Gender } from "@/types";

const STATUS_COLORS: Record<PetStatus, string> = {
  available: "bg-green-100 text-green-800",
  pending:   "bg-yellow-100 text-yellow-800",
  adopted:   "bg-gray-100 text-gray-600",
};

export default function PetListing() {
  const [search,  setSearch]  = useState("");
  const [filters, setFilters] = useState<PetFilters>({ page: 1, limit: 12 });

  const { pets, totalPages, isLoading, error } = usePets(filters);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((f) => ({ ...f, species: search || undefined, page: 1 }));
  };

  const setPage = (page: number) =>
    setFilters((f) => ({ ...f, page }));

  const setStatus = (val: string) =>
    setFilters((f) => ({ ...f, status: val === "all" ? undefined : (val as PetStatus), page: 1 }));

  const setGender = (val: string) =>
    setFilters((f) => ({ ...f, gender: val === "all" ? undefined : (val as Gender), page: 1 }));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Find Your Perfect Pet</h1>

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-3 mb-8">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <Input
            placeholder="Search by species (dog, cat…)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" variant="secondary">
            <Search className="w-4 h-4" />
          </Button>
        </form>

        <Select onValueChange={setStatus} defaultValue="all">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="adopted">Adopted</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={setGender} defaultValue="all">
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any gender</SelectItem>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="unknown">Unknown</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── Error ────────────────────────────────────────────────────────── */}
      {error && (
        <p className="text-center text-destructive mb-6">{error}</p>
      )}

      {/* ── Grid ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoading
          ? Array.from({ length: 12 }).map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full rounded-t-lg" />
                <CardContent className="pt-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))
          : pets.map((pet) => (
              <Link key={pet.id} href={`/pets/${pet.id}`}>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                  <div className="relative">
                    {pet.imageUrl ? (
                      <img
                        src={pet.imageUrl}
                        alt={pet.name}
                        className="h-48 w-full object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="h-48 w-full bg-muted rounded-t-lg flex items-center justify-center text-4xl">
                        🐾
                      </div>
                    )}
                    <Badge className={`absolute top-2 right-2 ${STATUS_COLORS[pet.status]}`}>
                      {pet.status}
                    </Badge>
                  </div>
                  <CardContent className="pt-4">
                    <h3 className="font-semibold text-lg">{pet.name}</h3>
                    <p className="text-muted-foreground text-sm capitalize">
                      {pet.species}{pet.breed ? ` · ${pet.breed}` : ""}
                    </p>
                    {pet.age !== null && (
                      <p className="text-muted-foreground text-sm">
                        {Math.floor(pet.age / 12) > 0
                          ? `${Math.floor(pet.age / 12)}y ${pet.age % 12}m`
                          : `${pet.age} months`}
                      </p>
                    )}
                    {pet.adoptionFee && (
                      <p className="text-sm font-medium mt-1">${pet.adoptionFee}</p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
      </div>

      {/* ── Empty state ──────────────────────────────────────────────────── */}
      {!isLoading && !error && pets.length === 0 && (
        <p className="text-center text-muted-foreground mt-16 text-lg">
          No pets found. Try adjusting your filters.
        </p>
      )}

      {/* ── Pagination ───────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-10">
          <Button
            variant="outline"
            size="sm"
            disabled={filters.page === 1}
            onClick={() => setPage((filters.page ?? 1) - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {filters.page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={filters.page === totalPages}
            onClick={() => setPage((filters.page ?? 1) + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
