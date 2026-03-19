import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PetListing() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [species, setSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [minAge, setMinAge] = useState(0);
  const [maxAge, setMaxAge] = useState(20);
  const [status, setStatus] = useState<"available" | "adopted" | "pending">("available");
  const limit = 12;

  // Get all pets for breed extraction (only when no breed filter is active)
  const { data: allPets } = trpc.pets.list.useQuery({
    page: 1,
    limit: 1000,
    species,
    status,
  });

  const { data, isLoading } = trpc.pets.list.useQuery({
    page,
    limit,
    search,
    species,
    breed,
    minAge,
    maxAge,
    status,
  });

  // Extract unique breeds from all pets
  const breeds = useMemo(() => {
    if (!allPets?.pets) return [];
    const uniqueBreeds = new Set(allPets.pets.map(p => p.breed).filter(Boolean));
    return Array.from(uniqueBreeds).sort();
  }, [allPets?.pets]);

  // Use filtered data directly from backend
  const filteredPets = useMemo(() => {
    if (!data?.pets) return [];
    return data.pets;
  }, [data?.pets, breed, minAge, maxAge]);

  const totalPages = data?.totalPages || 1;

  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleSpeciesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSpecies(e.target.value);
    setBreed(""); // Reset breed when species changes
    setPage(1);
  };

  const handleBreedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBreed(e.target.value);
    setPage(1);
  };

  const handleMinAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setMinAge(Math.min(value, maxAge));
    setPage(1);
  };

  const handleMaxAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 20;
    setMaxAge(Math.max(value, minAge));
    setPage(1);
  };

  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="container">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4">Find Your Perfect Pet</h1>
          <p className="text-lg text-muted">Browse our available pets and start your adoption journey</p>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-6 mb-12">
          <div className="space-y-4">
            {/* First Row: Search and Species */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Search by name..."
                  value={search}
                  onChange={handleSearch}
                  className="pl-10"
                />
              </div>

              {/* Species Filter */}
              <select
                value={species}
                onChange={handleSpeciesChange}
                className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">All Species</option>
                <option value="dog">Dogs</option>
                <option value="cat">Cats</option>
                <option value="rabbit">Rabbits</option>
                <option value="bird">Birds</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Second Row: Breed and Status */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Breed Filter */}
              <select
                value={breed}
                onChange={handleBreedChange}
                className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">All Breeds</option>
                {breeds.map((b) => (
                  <option key={b || "unknown"} value={b || ""}>
                    {b || "Unknown"}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as "available" | "adopted" | "pending");
                  setPage(1);
                }}
                className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="available">Available</option>
                <option value="pending">Pending</option>
                <option value="adopted">Adopted</option>
              </select>
            </div>

            {/* Third Row: Age Range */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Min Age (years)</label>
                <Input
                  type="number"
                  min="0"
                  max="20"
                  value={minAge}
                  onChange={handleMinAgeChange}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Max Age (years)</label>
                <Input
                  type="number"
                  min="0"
                  max="20"
                  value={maxAge}
                  onChange={handleMaxAgeChange}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pet Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-lg overflow-hidden">
                <Skeleton className="w-full h-48" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredPets && filteredPets.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredPets.map((pet) => (
              <Link key={pet.id} href={`/pets/${pet.id}`}>
                <a className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg hover:border-accent transition-all duration-300">
                  {/* Pet Image */}
                  <div className="relative w-full h-48 bg-muted/20 overflow-hidden">
                    {pet.imageUrl ? (
                      <img
                        src={pet.imageUrl}
                        alt={pet.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        🐾
                      </div>
                    )}
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold">
                      {pet.status === "available" ? "Available" : pet.status === "pending" ? "Pending" : "Adopted"}
                    </div>
                  </div>

                  {/* Pet Info */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="text-lg font-bold text-foreground group-hover:text-accent transition-colors">
                        {pet.name}
                      </h3>
                      <p className="text-sm text-muted">
                        {pet.breed || pet.species}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted">
                        {pet.age ? `${Math.floor(pet.age / 12)} years old` : "Age unknown"}
                      </span>
                      <span className="text-muted capitalize">{pet.gender}</span>
                    </div>

                    {pet.description && (
                      <p className="text-sm text-muted line-clamp-2">
                        {pet.description}
                      </p>
                    )}

                    <Button
                      asChild
                      className="w-full bg-accent text-accent-foreground hover:opacity-90"
                    >
                      <a>View Details</a>
                    </Button>
                  </div>
                </a>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-muted">No pets found. Try adjusting your filters.</p>
          </div>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && filteredPets.length > 0 && (
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={handlePreviousPage}
              disabled={page === 1}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                const isActive = pageNum === page;
                const isNearby = Math.abs(pageNum - page) <= 1;

                if (!isActive && !isNearby && pageNum !== 1 && pageNum !== totalPages) {
                  return null;
                }

                if (pageNum === 2 && page > 3) {
                  return (
                    <span key="dots-1" className="text-muted">
                      ...
                    </span>
                  );
                }

                if (pageNum === totalPages - 1 && page < totalPages - 2) {
                  return (
                    <span key="dots-2" className="text-muted">
                      ...
                    </span>
                  );
                }

                return (
                  <Button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    className={isActive ? "bg-accent text-accent-foreground" : ""}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              onClick={handleNextPage}
              disabled={page === totalPages}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
