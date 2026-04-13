// src/pages/PetListing.tsx
import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { usePets } from "@/hooks/usePets";
import type { PetStatus } from "@/types";

const LIMIT = 12;

export default function PetListing() {
  // ── Backend filters (sent to API) ──────────────────────────────────────────
  const [species, setSpecies] = useState("");
  const [status,  setStatus]  = useState<PetStatus | "">( "available");

  // ── Client-side filters (applied after fetch) ──────────────────────────────
  const [search, setSearch] = useState("");
  const [breed,  setBreed]  = useState("");
  const [minAge, setMinAge] = useState(0);   // in years
  const [maxAge, setMaxAge] = useState(20);  // in years

  // ── Pagination ─────────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);

  // ── Fetch all matching pets from backend (breed/age/search = client-side) ──
  // High limit so client-side filters + pagination work on the full set.
  const { pets: rawPets, isLoading, error } = usePets({
    limit:   10,
    page:    1,
    species: species  || undefined,
    // status:  (status  || undefined) as PetStatus | undefined,
  });

  // ── Extract unique breeds from fetched pets ────────────────────────────────
  const breeds = useMemo(() => {
    const set = new Set(rawPets.map((p) => p.breed).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [rawPets]);

  // ── Apply client-side filters ─────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q         = search.toLowerCase();
    const minMonths = minAge * 12;
    const maxMonths = maxAge * 12;

    return rawPets.filter((pet) => {
      if (q     && !pet.name.toLowerCase().includes(q))                      return false;
      if (breed && pet.breed !== breed)                                       return false;
      if (pet.age !== null && pet.age !== undefined) {
        if (pet.age < minMonths || pet.age > maxMonths)                      return false;
      }
      return true;
    });
  }, [rawPets, search, breed, minAge, maxAge]);

  // ── Client-side pagination ────────────────────────────────────────────────
  const totalPages  = Math.max(1, Math.ceil(filtered.length / LIMIT));
  const safePage    = Math.min(page, totalPages);
  const paginated   = filtered.slice((safePage - 1) * LIMIT, safePage * LIMIT);

  // Reset to page 1 whenever filters change
  const reset = () => setPage(1);

  // ── Page numbers to show (ellipsis pattern) ───────────────────────────────
  const pageNumbers = useMemo(() => {
    const nums: (number | "…")[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - safePage) <= 1) {
        nums.push(i);
      } else if (nums[nums.length - 1] !== "…") {
        nums.push("…");
      }
    }
    return nums;
  }, [totalPages, safePage]);

  // ── Status badge colour ───────────────────────────────────────────────────
  const statusBadge = (s: PetStatus) =>
    s === "available"
      ? "bg-green-500 text-white"
      : s === "pending"
      ? "bg-yellow-500 text-white"
      : "bg-gray-400 text-white";

  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4">Find Your Perfect Pet</h1>
          <p className="text-lg text-muted-foreground">
            Browse our available pets and start your adoption journey
          </p>
        </div>

        {/* ── Filters ─────────────────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-xl p-6 mb-12 space-y-4">

          {/* Row 1 — Search + Species */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); reset(); }}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <select
              value={species}
              onChange={(e) => { setSpecies(e.target.value); setBreed(""); reset(); }}
              className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Species</option>
              <option value="dog">Dogs</option>
              <option value="cat">Cats</option>
              <option value="rabbit">Rabbits</option>
              <option value="bird">Birds</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Row 2 — Breed + Status */}
          <div className="grid md:grid-cols-2 gap-4">
            <select
              value={breed}
              onChange={(e) => { setBreed(e.target.value); reset(); }}
              className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Breeds</option>
              {breeds.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value as PetStatus | ""); reset(); }}
              className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Statuses</option>
              <option value="available">Available</option>
              <option value="pending">Pending</option>
              <option value="adopted">Adopted</option>
            </select>
          </div>

          {/* Row 3 — Age range (in years) */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Min Age (years)</label>
              <input
                type="number"
                min={0}
                max={20}
                value={minAge}
                onChange={(e) => {
                  const v = Math.min(Number(e.target.value) || 0, maxAge);
                  setMinAge(v);
                  reset();
                }}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Age (years)</label>
              <input
                type="number"
                min={0}
                max={20}
                value={maxAge}
                onChange={(e) => {
                  const v = Math.max(Number(e.target.value) || 20, minAge);
                  setMaxAge(v);
                  reset();
                }}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Active filter count */}
          {filtered.length !== rawPets.length && (
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filtered.length}</span> of{" "}
              {rawPets.length} pets
            </p>
          )}
        </div>

        {/* ── Pet Grid ────────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
                <div className="w-full h-48 bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="h-5 w-3/4 bg-muted rounded" />
                  <div className="h-4 w-1/2 bg-muted rounded" />
                  <div className="h-4 w-full bg-muted rounded" />
                  <div className="h-9 w-full bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>

        ) : error ? (
          <div className="text-center py-16">
            <p className="text-destructive text-lg mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
            >
              Try again
            </button>
          </div>

        ) : paginated.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🐾</p>
            <p className="text-lg text-muted-foreground">
              No pets found. Try adjusting your filters.
            </p>
          </div>

        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {paginated.map((pet) => (
              <Link key={pet.id} href={`/pets/${pet.id}`}>
                <div className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary transition-all duration-300 cursor-pointer h-full flex flex-col">

                  {/* Image */}
                  <div className="relative w-full h-48 bg-muted/30 overflow-hidden flex-shrink-0">
                    {pet.imageUrl ? (
                      <img
                        src={pet.imageUrl}
                        alt={pet.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">
                        🐾
                      </div>
                    )}
                    {/* Status badge */}
                    <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${statusBadge(pet.status)}`}>
                      {pet?.status ? pet.status.charAt(0).toUpperCase() + pet.status.slice(1) : ""}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-4 flex flex-col flex-1 space-y-3">
                    <div>
                      <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                        {pet.name}
                      </h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {pet.breed || pet.species}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        {pet.age != null
                          ? `${Math.floor(pet.age / 12)} yr${Math.floor(pet.age / 12) !== 1 ? "s" : ""} ${pet.age % 12}m`
                          : "Age unknown"}
                      </span>
                      <span className="capitalize">{pet.gender ?? "—"}</span>
                    </div>

                    {pet.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                        {pet.description}
                      </p>
                    )}

                    {pet.adoptionFee && (
                      <p className="text-sm font-semibold text-foreground">
                        Fee: ${pet.adoptionFee}
                      </p>
                    )}

                    <div className="pt-1">
                      <span className="block w-full text-center px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold group-hover:opacity-90 transition-opacity">
                        View Details
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ── Pagination ───────────────────────────────────────────────────── */}
        {!isLoading && totalPages > 1 && paginated.length > 0 && (
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {/* Prev */}
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={safePage === 1}
              className="flex items-center gap-1 px-4 py-2 rounded-lg border border-border text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            {/* Page numbers */}
            {pageNumbers.map((n, i) =>
              n === "…" ? (
                <span key={`dots-${i}`} className="px-2 text-muted-foreground select-none">
                  …
                </span>
              ) : (
                <button
                  key={n}
                  onClick={() => setPage(n as number)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    n === safePage
                      ? "bg-primary text-primary-foreground"
                      : "border border-border hover:bg-muted"
                  }`}
                >
                  {n}
                </button>
              )
            )}

            {/* Next */}
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={safePage === totalPages}
              className="flex items-center gap-1 px-4 py-2 rounded-lg border border-border text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}