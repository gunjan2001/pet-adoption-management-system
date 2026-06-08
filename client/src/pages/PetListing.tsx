// src/pages/PetListing.tsx
import ErrorBoundaryUI from '@/components/ErrorBoundaryUI';
import PetFilterPanel from '@/components/PetFilterPanel';
import PetGrid from '@/components/PetGrid';
import PetPagination from '@/components/PetPagination';
import WakingUpBanner from '@/components/WakingUpBanner';
import { usePets } from '@/hooks/usePets';
import type { Gender, PetStatus } from '@/types';
import { useState } from 'react';
import { toast } from 'sonner';

const LIMIT = 12;

export default function PetListing() {
  const [species, setSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [status, setStatus] = useState<PetStatus | ''>('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [page, setPage] = useState(1);
  const [retryCount, setRetryCount] = useState(0);

  const { pets, totalPages, isLoading, isFetching, isWakingUp, error, refetch } = usePets({
    limit: LIMIT,
    page,
    species: species || undefined,
    breed: breed || undefined,
    status: (status as PetStatus) || undefined,
    gender: (gender as Gender) || undefined,
    minAge: minAge ? Number(minAge) * 12 : undefined,
    maxAge: maxAge ? Number(maxAge) * 12 : undefined,
  });

  const clearAll = () => {
    setSpecies('');
    setBreed('');
    setStatus('');
    setGender('');
    setMinAge('');
    setMaxAge('');
    setPage(1);
    setRetryCount(0);
  };

  const handleAIFilters = (aiFilters: Record<string, any>, interpretation: string) => {
    if ('species' in aiFilters) setSpecies(aiFilters.species ?? '');
    if ('breed' in aiFilters) setBreed(aiFilters.breed ?? '');
    if ('status' in aiFilters) setStatus(aiFilters.status ?? '');
    if ('gender' in aiFilters) setGender(aiFilters.gender ?? '');
    if ('minAge' in aiFilters) setMinAge(aiFilters.minAge != null ? String(aiFilters.minAge / 12) : '');
    if ('maxAge' in aiFilters) setMaxAge(aiFilters.maxAge != null ? String(aiFilters.maxAge / 12) : '');
    setPage(1);
    toast.success(interpretation);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/60 to-white mb-5">
      <div className="container mx-auto px-4 max-w-7xl py-12 md:py-15 md:pb-0">
        {/* Page header */}
        <div className="mb-10">
          <p className="text-amber-600 font-bold text-sm uppercase tracking-widest mb-2">Adopt a Pet</p>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">Find Your Perfect Pet</h1>
          <p className="text-gray-500 text-lg">Browse our available pets and start your adoption journey</p>
        </div>

        <PetFilterPanel
          species={species}
          breed={breed}
          status={status}
          gender={gender}
          minAge={minAge}
          maxAge={maxAge}
          onSpeciesChange={(v) => { setSpecies(v); setPage(1); }}
          onBreedChange={(v) => { setBreed(v); setPage(1); }}
          onStatusChange={(v) => { setStatus(v); setPage(1); }}
          onGenderClear={() => { setGender(''); setPage(1); }}
          onAgeClear={() => { setMinAge(''); setMaxAge(''); setPage(1); }}
          onAIFilters={handleAIFilters}
        />
      </div>

      {isWakingUp && <WakingUpBanner />}

      {!isWakingUp && error && (
        <ErrorBoundaryUI
          error={error}
          onRetry={() => { setRetryCount((p) => p + 1); refetch(); }}
          onClearFilters={clearAll}
          isLoading={isLoading}
          retryCount={retryCount}
          maxRetries={3}
        />
      )}

      {!isWakingUp && !error && (
        <PetGrid
          pets={pets}
          isLoading={isLoading}
          isFetching={isFetching}
          onClearFilters={clearAll}
        />
      )}

      {!isLoading && !isWakingUp && pets.length > 0 && (
        <PetPagination
          page={page}
          totalPages={totalPages}
          isFetching={isFetching}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
