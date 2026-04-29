// src/pages/PetListing.tsx
import ErrorBoundaryUI from '@/components/ErrorBoundaryUI';
import { usePets } from '@/hooks/usePets';
import type { PetStatus } from '@/types';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'wouter';

const LIMIT = 12;

const STATUS_BADGE: Record<
  PetStatus,
  { bg: string; dot: string; label: string }
> = {
  available: {
    bg: 'bg-green-100  text-green-800',
    dot: 'bg-green-500',
    label: 'Available',
  },
  pending: {
    bg: 'bg-amber-100  text-amber-800',
    dot: 'bg-amber-500',
    label: 'Pending',
  },
  adopted: {
    bg: 'bg-gray-100   text-gray-600',
    dot: 'bg-gray-400',
    label: 'Adopted',
  },
};

const inp =
  'w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-shadow text-sm';

export default function PetListing() {
  const [species, setSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [status, setStatus] = useState<PetStatus | ''>('');
  const [page, setPage] = useState(1);
  const [retryCount, setRetryCount] = useState(0);

  const { pets, totalPages, isLoading, isFetching, error, refetch } = usePets({
    limit: LIMIT,
    page,
    species: species || undefined,
    breed: breed || undefined,
    status: (status as PetStatus) || undefined,
  });

  const pageNumbers = useMemo(() => {
    const nums: (number | '…')[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) nums.push(i);
      else if (nums[nums.length - 1] !== '…') nums.push('…');
    }
    return nums;
  }, [totalPages, page]);

  const activeFilters = [species, breed, status].filter(Boolean).length;

  const clearAll = () => {
    setSpecies('');
    setBreed('');
    setStatus('');
    setPage(1);
    setRetryCount(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/60 to-white mb-5">
      <div className="container mx-auto px-4 max-w-7xl py-12 md:py-15">
        {/* ── Page header ─────────────────────────────────────────────────── */}
        <div className="mb-10">
          <p className="text-amber-600 font-bold text-sm uppercase tracking-widest mb-2">
            Adopt a Pet
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">
            Find Your Perfect Pet
          </h1>
          <p className="text-gray-500 text-lg">
            Browse our available pets and start your adoption journey
          </p>
        </div>

        {/* ── Filter panel ──────────────────────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-3 shadow-sm space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Filters</h2>
            {/* {activeFilters > 0 && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-500 hover:text-red-500 hover:border-red-200 transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Clear All
              </button>
            )} */}
          </div>
          {activeFilters > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {species && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold">
                  Species: {species.charAt(0).toUpperCase() + species.slice(1)}
                  <button
                    onClick={() => {
                      setSpecies('');
                      setPage(1);
                    }}
                    className="hover:text-amber-600 transition-colors"
                    aria-label="Remove species filter"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
              {breed && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold">
                  Breed: {breed}
                  <button
                    onClick={() => {
                      setBreed('');
                      setPage(1);
                    }}
                    className="hover:text-amber-600 transition-colors"
                    aria-label="Remove breed filter"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
              {status && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold">
                  Status: {status.charAt(0).toUpperCase() + status.slice(1)}
                  <button
                    onClick={() => {
                      setStatus('');
                      setPage(1);
                    }}
                    className="hover:text-amber-600 transition-colors"
                    aria-label="Remove status filter"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
            </div>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                Species
              </label>
              <select
                value={species}
                onChange={(e) => {
                  setSpecies(e.target.value);
                  setPage(1);
                }}
                className={inp}
              >
                <option value="">All Species</option>
                <option value="dog">Dogs</option>
                <option value="cat">Cats</option>
                <option value="rabbit">Rabbits</option>
                <option value="bird">Birds</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                Breed
              </label>
              <input
                type="text"
                placeholder="Any breed…"
                value={breed}
                onChange={(e) => {
                  setBreed(e.target.value);
                  setPage(1);
                }}
                className={inp}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as PetStatus | '');
                  setPage(1);
                }}
                className={inp}
              >
                <option value="">All Statuses</option>
                <option value="available">Available</option>
                <option value="pending">Pending</option>
                <option value="adopted">Adopted</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      {error && (
        <ErrorBoundaryUI
          error={error}
          onRetry={() => {
            setRetryCount((prev) => prev + 1);
            refetch();
          }}
          onClearFilters={clearAll}
          isLoading={isLoading}
          retryCount={retryCount}
          maxRetries={3}
        />
      )}

      {/* ── Grid ─────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-pulse"
            >
              <div className="h-48 bg-amber-50" />
              <div className="p-4 space-y-2">
                <div className="h-5 w-3/4 bg-gray-100 rounded-lg" />
                <div className="h-4 w-1/2 bg-gray-100 rounded-lg" />
                <div className="h-4 w-1/3 bg-gray-100 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        !error && (
          <div className="container mx-auto max-w-7xl py-8">
            {/* Thin refetch indicator */}
            <div
              className={`absolute -top-3 left-0 right-0 h-0.5 rounded-full bg-amber-400 origin-left transition-all duration-300 ${isFetching ? 'opacity-100 animate-pulse' : 'opacity-0'}`}
            />
            {isFetching && (
              <div className="absolute inset-0 rounded-2xl bg-white/40 z-10 pointer-events-none" />
            )}

            {pets.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-amber-200">
                <p className="text-5xl mb-4">🐾</p>
                <p className="text-gray-500 text-lg mb-2">
                  No pets match your filters.
                </p>
                <button
                  onClick={clearAll}
                  className="text-amber-600 font-semibold hover:underline text-sm"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 p-5">
                {pets.map((pet) => {
                  const badge = STATUS_BADGE[pet.status];
                  return (
                    <Link key={pet.id} href={`/pets/${pet.id}`}>
                      <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:border-amber-200 transition-all duration-200 cursor-pointer h-full flex flex-col">
                        {/* Image */}
                        <div className="relative h-48 bg-amber-50 overflow-hidden flex-shrink-0">
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
                          {/* Status pill */}
                          <span
                            className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.bg}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}
                            />
                            {badge.label}
                          </span>
                        </div>
                        {/* Info */}
                        <div className="p-4 flex flex-col flex-1 gap-2">
                          <div>
                            <h3 className="font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                              {pet.name}
                            </h3>
                            <p className="text-sm text-gray-500 capitalize">
                              {pet.breed || pet.species}
                            </p>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>
                              {pet.age != null
                                ? `${Math.floor(pet.age / 12)}yr ${pet.age % 12}m`
                                : 'Age unknown'}
                            </span>
                            <span className="capitalize">
                              {pet.gender ?? '—'}
                            </span>
                          </div>
                          {pet.description && (
                            <p className="text-xs text-gray-400 line-clamp-2 flex-1">
                              {pet.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                            {pet.adoptionFee ? (
                              <span className="text-sm font-bold text-amber-600">
                                ${pet.adoptionFee}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">
                                No fee listed
                              </span>
                            )}
                            <span className="text-xs font-semibold text-amber-600 group-hover:underline">
                              View →
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )
      )}

      {/* ── Pagination ───────────────────────────────────────────────────── */}
      {!isLoading && totalPages > 1 && pets.length > 0 && (
        <div className="flex items-center justify-center gap-2 mt-12 flex-wrap">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1 || isFetching}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:border-amber-300 hover:text-amber-600 transition-colors shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>

          {pageNumbers.map((n, i) =>
            n === '…' ? (
              <span key={`d-${i}`} className="px-1 text-gray-400">
                …
              </span>
            ) : (
              <button
                key={n}
                onClick={() => setPage(n as number)}
                disabled={isFetching}
                className={`w-10 h-10 rounded-xl text-sm font-semibold transition-colors shadow-sm ${
                  n === page
                    ? 'bg-amber-500 text-white border border-amber-500'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-amber-300 hover:text-amber-600'
                }`}
              >
                {n}
              </button>
            )
          )}

          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page === totalPages || isFetching}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:border-amber-300 hover:text-amber-600 transition-colors shadow-sm"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
