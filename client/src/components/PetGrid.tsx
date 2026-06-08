import type { Pet } from '@/types';
import PetCard from './PetCard';

interface Props {
  pets: Pet[];
  isLoading: boolean;
  isFetching: boolean;
  onClearFilters: () => void;
}

export default function PetGrid({ pets, isLoading, isFetching, onClearFilters }: Props) {
  // Skeleton
  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl py-8 pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 p-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-pulse">
              <div className="h-48 bg-amber-50" />
              <div className="p-4 space-y-2">
                <div className="h-5 w-3/4 bg-gray-100 rounded-lg" />
                <div className="h-4 w-1/2 bg-gray-100 rounded-lg" />
                <div className="h-4 w-1/3 bg-gray-100 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl py-8 pt-0">
      {/* Thin refetch progress bar */}
      <div
        className={`absolute -top-3 left-0 right-0 h-0.5 rounded-full bg-amber-400 origin-left transition-all duration-300 ${
          isFetching ? 'opacity-100 animate-pulse' : 'opacity-0'
        }`}
      />
      {isFetching && (
        <div className="absolute inset-0 rounded-2xl bg-white/40 z-10 pointer-events-none" />
      )}

      {pets.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-amber-200">
          <p className="text-5xl mb-4">🐾</p>
          <p className="text-gray-500 text-lg mb-2">No pets match your filters.</p>
          <button onClick={onClearFilters} className="text-amber-600 font-semibold hover:underline text-sm">
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 p-5">
          {pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
      )}
    </div>
  );
}
