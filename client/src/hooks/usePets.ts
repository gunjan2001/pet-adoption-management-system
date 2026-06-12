// src/hooks/usePets.ts
import { petsApi } from "@/lib/api/pets.api";
import { Pet, PetFilters } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";

export interface UsePetsResult {
  pets:       Pet[];
  total:      number;
  totalPages: number;
  isLoading:  boolean;
  isFetching: boolean;
  isWakingUp: boolean;
  error:      string | null;
  refetch:    () => void;
}

export const usePets = (filters: PetFilters = {}): UsePetsResult => {
  const [pets,       setPets]       = useState<Pet[]>([]);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading,  setIsLoading]  = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [tick,       setTick]       = useState(0);

  const hasData = useRef(false);

  // Serialise only the plain filter values — never include signal/functions.
  // This is the sole effect dependency; it changes only when filters change.
  const filtersKey = JSON.stringify({
    limit:   filters.limit,
    page:    filters.page,
    species: filters.species,
    breed:   filters.breed,
    status:  filters.status,
    gender:  filters.gender,
    minAge:  filters.minAge,
    maxAge:  filters.maxAge,
  });

  // ── NeonDB cold-start events ──────────────────────────────────────────────
  useEffect(() => {
    const onWaking = () => setIsWakingUp(true);
    const onAwake  = () => setIsWakingUp(false);
    window.addEventListener("db:waking", onWaking);
    window.addEventListener("db:awake",  onAwake);
    return () => {
      window.removeEventListener("db:waking", onWaking);
      window.removeEventListener("db:awake",  onAwake);
    };
  }, []);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!hasData.current) setIsLoading(true);
    setIsFetching(true);
    setError(null);

    // Parse the stable key back into filters so the effect closure is free of
    // the `filters` object (avoids stale-closure / identity-change issues).
    const parsedFilters = JSON.parse(filtersKey) as PetFilters;

    petsApi
      .getAll(parsedFilters)
      .then(({ data, pagination }) => {
        setPets(data);
        setTotal(pagination.total);
        setTotalPages(pagination.totalPages);
        hasData.current = true;
      })
      .catch((err: unknown) => {
        // Silently ignore request cancellations (AbortController / axios CancelToken)
        if ((err as any)?.name === "CanceledError" || (err as any)?.code === "ERR_CANCELED") return;
        console.error("usePets fetch error:", err);
        setError((err as any)?.response?.data?.message ?? "Failed to load pets");
      })
      .finally(() => {
        setIsLoading(false);
        setIsFetching(false);
        setIsWakingUp(false);
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { pets, total, totalPages, isLoading, isFetching, isWakingUp, error, refetch };
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

    setIsLoading(true);
    setError(null);

    petsApi
      .getById(id)
      .then((data) => {
        setPet(data);
      })
      .catch((err: unknown) => {
        setError((err as any)?.response?.data?.message ?? "Pet not found");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { pet, isLoading, error, refetch };
};