// src/lib/api/adoptions.api.ts
import type {
  AdoptionStatus,
  ApplicationWithPet,
  ApplicationWithPetAndApplicant,
  CreateApplicationInput,
  ApiSuccess,
  PaginationMeta,
} from "@/types";
import api from "./httpClient";

export interface AdminApplicationsResponse {
  data:       ApplicationWithPetAndApplicant[];
  pagination: PaginationMeta;
}

export const adoptionsApi = {
  /** Submit a new adoption application (authenticated user) */
  submit: async (data: CreateApplicationInput): Promise<ApplicationWithPet> => {
    const res = await api.post<ApiSuccess<ApplicationWithPet>>("/adoptions", data);
    return res.data.data!;
  },

  /** Get the logged-in user's own applications */
  getMine: async (): Promise<ApplicationWithPet[]> => {
    const res = await api.get<ApiSuccess<ApplicationWithPet[]>>("/adoptions/my");
    return res.data.data ?? [];
  },

  /** Get a single application by ID (owner or admin) */
  getById: async (id: number): Promise<ApplicationWithPetAndApplicant> => {
    const res = await api.get<ApiSuccess<ApplicationWithPetAndApplicant>>(
      `/adoptions/${id}`
    );
    return res.data.data!;
  },

  /** Withdraw a pending application (owner) */
  withdraw: async (id: number): Promise<void> => {
    await api.delete(`/adoptions/${id}/withdraw`);
  },

  /** Get all applications with pagination (admin only) */
  getAll: async (
    params: { status?: AdoptionStatus; page?: number; limit?: number } = {}
  ): Promise<AdminApplicationsResponse> => {
    const res = await api.get<
      ApiSuccess<ApplicationWithPetAndApplicant[]> & { pagination: PaginationMeta }
    >("/adoptions", { params });
    return { data: res.data.data ?? [], pagination: res.data.pagination! };
  },

  /** Approve or reject an application (admin only) */
  review: async (
    id: number,
    payload: { status: "approved" | "rejected"; adminNotes?: string }
  ): Promise<ApplicationWithPetAndApplicant> => {
    const res = await api.patch<ApiSuccess<ApplicationWithPetAndApplicant>>(
      `/adoptions/${id}/review`,
      payload
    );
    return res.data.data!;
  },
};
