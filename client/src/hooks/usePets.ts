// src/hooks/usePets.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { petsApi } from "@/lib/api/pets.api";
import { Pet, PetFilters } from "@/types";

export interface UsePetsResult {
  pets:       Pet[];
  total:      number;
  totalPages: number;
  isLoading:  boolean;   // true only on FIRST load (no data yet)  → show skeletons
  isFetching: boolean;   // true on EVERY fetch (incl. filter/page) → show subtle overlay
  error:      string | null;
  refetch:    () => void;
}

export const usePets = (filters: PetFilters = {}): UsePetsResult => {
  const [pets,       setPets]       = useState<Pet[]>([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading,  setIsLoading]  = useState(true);  // skeleton on first paint
  const [isFetching, setIsFetching] = useState(false); // subtle indicator on refetch
  const [error,      setError]      = useState<string | null>(null);
  const [tick,       setTick]       = useState(0);

  const filtersKey   = JSON.stringify(filters);
  const hasData      = useRef(false); // tracks whether we've ever received data

  useEffect(() => {
    let cancelled = false;

    // Only show full skeletons when we have no data yet
    if (!hasData.current) {
      setIsLoading(true);
    }
    setIsFetching(true);
    setError(null);

    petsApi
      .getAll(JSON.parse(filtersKey) as PetFilters)
      .then(({ data, pagination }) => {
        if (cancelled) return;
        setPets(data);
        setTotal(pagination.total);
        setTotalPages(pagination.totalPages);
        hasData.current = true;
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.response?.data?.message ?? "Failed to load pets");
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
        setIsFetching(false);
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { pets, total, totalPages, isLoading, isFetching, error, refetch };
};

// ── usePet (single) ──────────────────────────────────────────────────────────
export interface UsePetResult {
  pet:       Pet | null;
  isLoading: boolean;
  error:     string | null;
  refetch:   () => void;
}

export const usePet = (id: number | undefined): UsePetResult => {
  const [pet,       setPet]       = useState<Pet | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [tick,      setTick]      = useState(0);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    petsApi
      .getById(id)
      .then((data) => { if (!cancelled) setPet(data); })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.response?.data?.message ?? "Pet not found");
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [id, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { pet, isLoading, error, refetch };
};
