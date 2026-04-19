// src/lib/api/pets.api.ts
import type {
  Pet,
  CreatePetInput,
  PetFilters,
  PetStatus,
  ApiSuccess,
  PaginationMeta,
} from "@/types";
import api from "./httpClient";

export interface PetsListResponse {
  data:       Pet[];
  pagination: PaginationMeta;
}

export const petsApi = {
  /** Get paginated/filtered list of pets (public) */
  getAll: async (filters: PetFilters = {}): Promise<PetsListResponse> => {
    const res = await api.get<ApiSuccess<Pet[]> & { pagination: PaginationMeta }>(
      "/pets",
      { params: filters }
    );
    return { data: res.data.data ?? [], pagination: res.data.pagination! };
  },

  /** Get a single pet by ID (public) */
  getById: async (id: number): Promise<Pet> => {
    const res = await api.get<ApiSuccess<Pet>>(`/pets/${id}`);
    return res.data.data!;
  },

  /** Create a pet (admin only) */
  create: async (data: CreatePetInput): Promise<Pet> => {
    const res = await api.post<ApiSuccess<Pet>>("/pets", data);
    return res.data.data!;
  },

  /** Update a pet (admin only) */
  update: async (id: number, data: Partial<CreatePetInput>): Promise<Pet> => {
    const res = await api.patch<ApiSuccess<Pet>>(`/pets/${id}`, data);
    return res.data.data!;
  },

  /** Update only the status of a pet (admin only) */
  updateStatus: async (id: number, status: PetStatus): Promise<Pet> => {
    const res = await api.patch<ApiSuccess<Pet>>(`/pets/${id}/status`, { status });
    return res.data.data!;
  },

  /** Delete a pet (admin only) */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/pets/${id}`);
  },
};
