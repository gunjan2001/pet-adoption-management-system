import type { Pet, PetStatus } from '@/types';
import { Link } from 'wouter';

const STATUS_BADGE: Record<PetStatus, { bg: string; dot: string; label: string }> = {
  available: { bg: 'bg-green-100 text-green-800', dot: 'bg-green-500', label: 'Available' },
  pending:   { bg: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500', label: 'Pending'   },
  adopted:   { bg: 'bg-gray-100  text-gray-600',  dot: 'bg-gray-400',  label: 'Adopted'   },
};

export default function PetCard({ pet }: { pet: Pet }) {
  const badge = STATUS_BADGE[pet.status];

  return (
    <Link href={`/pets/${pet.id}`}>
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
            <div className="w-full h-full flex items-center justify-center text-5xl">🐾</div>
          )}
          <span className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
            {badge.label}
          </span>
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col flex-1 gap-2">
          <div>
            <h3 className="font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
              {pet.name}
            </h3>
            <p className="text-sm text-gray-500 capitalize">{pet.breed || pet.species}</p>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {pet.age != null
                ? `${Math.floor(pet.age / 12)}yr ${pet.age % 12}m`
                : 'Age unknown'}
            </span>
            <span className="capitalize">{pet.gender ?? '—'}</span>
          </div>

          {pet.description && (
            <p className="text-xs text-gray-400 line-clamp-2 flex-1">{pet.description}</p>
          )}

          <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
            {pet.adoptionFee ? (
              <span className="text-sm font-bold text-amber-600">${pet.adoptionFee}</span>
            ) : (
              <span className="text-xs text-gray-400">No fee listed</span>
            )}
            <span className="text-xs font-semibold text-amber-600 group-hover:underline">View →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
