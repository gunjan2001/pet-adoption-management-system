// src/hooks/usePets.ts
import { petsApi } from "@/lib/api/pets.api";
import { Pet, PetFilters } from "@/types";
import axios from "axios";
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

/**
 * Returns true for ANY flavour of request cancellation:
 *
 *  - axios.isCancel()     → CancelToken-based (Axios v0 legacy)
 *  - err.code === 'ERR_CANCELED'  → AbortController-based (Axios v1+)
 *  - err.name === 'CanceledError' → same, different property
 *  - err.name === 'AbortError'    → native fetch / some environments
 *  - signal.aborted               → synchronous check as a final backstop
 */
function isCancellation(err: unknown, signal: AbortSignal): boolean {
  if (signal.aborted)        return true;
  if (axios.isCancel(err))   return true;
  if (err instanceof Error) {
    if (err.name === 'CanceledError') return true;
    if (err.name === 'AbortError')    return true;
    if ((err as any).code === 'ERR_CANCELED') return true;
  }
  return false;
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
    const controller = new AbortController();
    const { signal } = controller;

    if (!hasData.current) setIsLoading(true);
    setIsFetching(true);
    setError(null);

    // Parse the stable key back into filters so the effect closure is free of
    // the `filters` object (avoids stale-closure / identity-change issues).
    const parsedFilters = JSON.parse(filtersKey) as PetFilters;

    petsApi
      .getAll(parsedFilters, signal)
      .then(({ data, pagination }) => {
        if (signal.aborted) return;
        setPets(data);
        setTotal(pagination.total);
        setTotalPages(pagination.totalPages);
        hasData.current = true;
      })
      .catch((err: unknown) => {
        // Swallow every variety of intentional cancellation silently.
        if (isCancellation(err, signal)) return;
        
        console.error("usePets fetch error:", err);
        setError((err as any)?.response?.data?.message ?? "Failed to load pets");
      })
      .finally(() => {
        // Don't touch state if this run was aborted — the next run owns state.
        if (signal.aborted) return;
        setIsLoading(false);
        setIsFetching(false);
        setIsWakingUp(false);
      });

    return () => controller.abort();

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

    const controller = new AbortController();
    const { signal } = controller;

    setIsLoading(true);
    setError(null);

    petsApi
      .getById(id)
      .then((data) => {
        if (signal.aborted) return;
        setPet(data);
      })
      .catch((err: unknown) => {
        if (signal.aborted || axios.isCancel(err)) return;
        if (err instanceof Error && (
          err.name === 'CanceledError' ||
          err.name === 'AbortError' ||
          (err as any).code === 'ERR_CANCELED'
        )) return;
        setError((err as any)?.response?.data?.message ?? "Pet not found");
      })
      .finally(() => {
        if (signal.aborted) return;
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [id, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { pet, isLoading, error, refetch };
};