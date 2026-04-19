// src/types/index.ts

// ── Enums ─────────────────────────────────────────────────────────────────────
export type Role            = "user" | "admin";
export type Gender          = "male" | "female" | "unknown";
export type PetStatus       = "available" | "pending" | "adopted";
export type AdoptionStatus  = "pending" | "approved" | "rejected";

// ── User ──────────────────────────────────────────────────────────────────────
export interface User {
  id:          number;
  name:        string | null;
  email:       string | null;
  phone:       string | null;
  address:     string | null;
  role:        Role;
}

// ── Pet ───────────────────────────────────────────────────────────────────────
export interface Pet {
  id:          number;
  name:        string;
  species:     string;
  breed:       string | null;
  age:         number | null;       // age in months
  gender:      Gender | null;
  description: string | null;
  imageUrl:    string | null;
  status:      PetStatus;
  adoptionFee: string | null;       // numeric comes back as string from pg
  createdAt:   string;
  updatedAt:   string;
}

// ── Adoption Application ──────────────────────────────────────────────────────
export interface AdoptionApplication {
  id:         number;
  userId:     number;
  petId:      number;
  status:     AdoptionStatus;
  fullName:   string;
  email:      string;
  phone:      string;
  address:    string;
  homeType:   string | null;
  hasYard:    boolean | null;
  otherPets:  string | null;
  experience: string | null;
  reason:     string | null;
  adminNotes: string | null;
  createdAt:  string;
  updatedAt:  string;
}

// ── API response shapes ───────────────────────────────────────────────────────
export interface PaginationMeta {
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
}

export interface ApiSuccess<T = unknown> {
  success:    true;
  message?:   string;
  data?:      T;
  pagination?: PaginationMeta;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: { field: string; message: string }[];
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

// ── Auth responses ────────────────────────────────────────────────────────────
export interface AuthResponse {
  success: true;
  message: string;
  token:   string;
  user:    User;
}

// ── Joined shapes returned by adoption endpoints ──────────────────────────────
export interface ApplicationWithPet {
  application: AdoptionApplication;
  pet: Pick<Pet, "id" | "name" | "species" | "breed" | "imageUrl" | "status">;
}

export interface ApplicationWithPetAndApplicant extends ApplicationWithPet {
  applicant: Pick<User, "id" | "name" | "email">;
}

// ── Form input types ──────────────────────────────────────────────────────────
export interface RegisterInput {
  name:     string;
  email:    string;
  password: string;
  phone?:   string;
  address?: string;
}

export interface LoginInput {
  email:    string;
  password: string;
}

export interface CreatePetInput {
  name:        string;
  species:     string;
  breed?:      string;
  age?:        number;
  gender?:     Gender;
  description?: string;
  imageUrl?:   string;
  status?:     PetStatus;
  adoptionFee?: number;
}

export interface CreateApplicationInput {
  petId:      number;
  fullName:   string;
  email:      string;
  phone:      string;
  address:    string;
  homeType?:  "house" | "apartment" | "condo" | "townhouse" | "other";
  hasYard?:   boolean;
  otherPets?: string;
  experience?: string;
  reason:     string;
}

export interface PetFilters {
  page?:    number;
  limit?:   number;
  status?:  PetStatus;
  species?: string;
  gender?:  Gender;
  search?:  string;
  breed?:   string;
  minAge?:  number;
  maxAge?:  number;
}
