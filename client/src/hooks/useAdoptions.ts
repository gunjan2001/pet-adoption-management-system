// src/hooks/useAdoptions.ts
import { useCallback, useEffect, useState } from "react";
import { adoptionsApi } from "../lib/api/adoptions.api.js";
import {
  AdoptionStatus,
  ApplicationWithPet,
  ApplicationWithPetAndApplicant,
} from "../types/index.js";

// ── useMyApplications (user) ─────────────────────────────────────────────────
export interface UseMyApplicationsResult {
  applications: ApplicationWithPet[];
  isLoading:    boolean;
  error:        string | null;
  refetch:      () => void;
}

export const useMyApplications = (): UseMyApplicationsResult => {
  const [applications, setApplications] = useState<ApplicationWithPet[]>([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [tick,         setTick]         = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    adoptionsApi
      .getMine()
      .then((data) => { if (!cancelled) setApplications(data); })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.response?.data?.message ?? "Failed to load applications");
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { applications, isLoading, error, refetch };
};

// ── useAllApplications (admin) ───────────────────────────────────────────────
export interface UseAllApplicationsResult {
  applications: ApplicationWithPetAndApplicant[];
  total:        number;
  totalPages:   number;
  isLoading:    boolean;
  error:        string | null;
  refetch:      () => void;
}

export const useAllApplications = (params: {
  status?: AdoptionStatus;
  page?:   number;
  limit?:  number;
} = {}): UseAllApplicationsResult => {
  const [applications, setApplications] = useState<ApplicationWithPetAndApplicant[]>([]);
  const [total,        setTotal]        = useState(0);
  const [totalPages,   setTotalPages]   = useState(1);
  const [isLoading,    setIsLoading]    = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [tick,         setTick]         = useState(0);

  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    adoptionsApi
      .getAll(JSON.parse(paramsKey))
      .then(({ data, pagination }) => {
        if (cancelled) return;
        setApplications(data);
        setTotal(pagination.total);
        setTotalPages(pagination.totalPages);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.response?.data?.message ?? "Failed to load applications");
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { applications, total, totalPages, isLoading, error, refetch };
};
