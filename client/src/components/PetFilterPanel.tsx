import api from '@/lib/api/httpClient';
import type { Gender, PetStatus } from '@/types';
import { Loader2, Sparkles, X } from 'lucide-react';
import { useRef, useState } from 'react';

const inp =
  'w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-shadow text-sm';

interface Props {
  species: string;
  breed: string;
  status: PetStatus | '';
  gender: Gender | '';
  minAge: string;
  maxAge: string;
  onSpeciesChange: (v: string) => void;
  onBreedChange: (v: string) => void;
  onStatusChange: (v: PetStatus | '') => void;
  onGenderClear: () => void;
  onAgeClear: () => void;
  onAIFilters: (filters: Record<string, any>, interpretation: string) => void;
}

export default function PetFilterPanel({
  species,
  breed,
  status,
  gender,
  minAge,
  maxAge,
  onSpeciesChange,
  onBreedChange,
  onStatusChange,
  onGenderClear,
  onAgeClear,
  onAIFilters,
}: Props) {
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const aiInputRef = useRef<HTMLInputElement>(null);

  const activeFilters = [species, breed, status, gender, minAge, maxAge].filter(Boolean).length;

  const handleAISearch = async () => {
    if (!aiQuery.trim() || aiLoading) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await api.post<{
        success: boolean;
        data: { filters: Record<string, any>; interpretation: string };
      }>('/ai/search', { query: aiQuery });
      const { filters, interpretation } = res.data.data;
      onAIFilters(filters, interpretation);
      setAiQuery('');
    } catch {
      setAiError("Couldn't understand that. Try: 'female dog under 2 years'");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-3 shadow-sm space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700">Filters</h2>
      </div>

      {/* Active filter chips */}
      {activeFilters > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {species && (
            <FilterChip label={`Species: ${species.charAt(0).toUpperCase() + species.slice(1)}`} onRemove={() => onSpeciesChange('')} />
          )}
          {breed && (
            <FilterChip label={`Breed: ${breed}`} onRemove={() => onBreedChange('')} />
          )}
          {status && (
            <FilterChip label={`Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`} onRemove={() => onStatusChange('')} />
          )}
          {gender && (
            <FilterChip label={`Gender: ${gender.charAt(0).toUpperCase() + gender.slice(1)}`} onRemove={onGenderClear} />
          )}
          {(minAge || maxAge) && (
            <FilterChip
              label={`Age:${minAge ? ` ≥${minAge}yr` : ''}${maxAge ? ` ≤${maxAge}yr` : ''}`}
              onRemove={onAgeClear}
            />
          )}
        </div>
      )}

      {/* Manual filter inputs */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
            Species
          </label>
          <select value={species} onChange={(e) => onSpeciesChange(e.target.value)} className={inp}>
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
            onChange={(e) => onBreedChange(e.target.value)}
            className={inp}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
            Status
          </label>
          <select value={status} onChange={(e) => onStatusChange(e.target.value as PetStatus | '')} className={inp}>
            <option value="">All Statuses</option>
            <option value="available">Available</option>
            <option value="pending">Pending</option>
            <option value="adopted">Adopted</option>
          </select>
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 pt-1">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-400 whitespace-nowrap">or describe what you're looking for</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      {/* AI search bar */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400 pointer-events-none" />
            <input
              ref={aiInputRef}
              type="text"
              value={aiQuery}
              onChange={(e) => { setAiQuery(e.target.value); setAiError(null); }}
              onKeyDown={(e) => e.key === 'Enter' && handleAISearch()}
              placeholder="e.g. I want a calm female dog under 2 years…"
              disabled={aiLoading}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-shadow text-sm disabled:opacity-60"
            />
          </div>
          <button
            onClick={handleAISearch}
            disabled={aiLoading || !aiQuery.trim()}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
          >
            {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Search
          </button>
        </div>
        {aiError && <p className="text-xs text-red-500 pl-1">{aiError}</p>}
        <div className="flex flex-wrap gap-1.5">
          {['female dog under 2 years', 'senior cat', 'calm male rabbit'].map((ex) => (
            <button
              key={ex}
              onClick={() => { setAiQuery(ex); aiInputRef.current?.focus(); }}
              className="text-xs px-2.5 py-1 bg-gray-100 hover:bg-amber-100 hover:text-amber-700 text-gray-500 rounded-lg transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── FilterChip ────────────────────────────────────────────────────────────────

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold">
      {label}
      <button onClick={onRemove} className="hover:text-amber-600 transition-colors" aria-label={`Remove ${label} filter`}>
        <X className="w-3.5 h-3.5" />
      </button>
    </span>
  );
}
