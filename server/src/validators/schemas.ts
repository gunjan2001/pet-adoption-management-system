// src/validators/schemas.ts
import { z } from "zod";

// ── Auth ─────────────────────────────────────────────────────────────────────
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password cannot exceed 72 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  phone: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
});

// ── Pets ─────────────────────────────────────────────────────────────────────
export const createPetSchema = z.object({
  name: z.string().min(1, "Pet name is required").max(255),
  species: z.string().min(1, "Species is required").max(100),
  breed: z.string().max(255).optional(),
  age: z.number().int().nonnegative("Age must be a non-negative integer").optional(),
  gender: z.enum(["male", "female", "unknown"]).optional(),
  description: z.string().max(2000).optional(),
  imageUrl: z.string().url("Invalid image URL").max(500).optional(),
  status: z.enum(["available", "adopted", "pending"]).optional(),
  adoptionFee: z
    .number()
    .nonnegative("Adoption fee cannot be negative")
    .multipleOf(0.01)
    .optional(),
});

export const updatePetSchema = createPetSchema.partial();

export const updatePetStatusSchema = z.object({
  status: z.enum(["available", "adopted", "pending"], {
    required_error: "Status is required",
  }),
});

// ── Adoption Applications ─────────────────────────────────────────────────────
export const createApplicationSchema = z.object({
  petId: z.number().int().positive("Invalid pet ID"),
  fullName: z.string().min(2, "Full name is required").max(255),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(7, "Phone number is too short").max(20, "Phone number is too long"),
  address: z.string().min(5, "Address is required").max(500),
  homeType: z.enum(["house", "apartment", "condo", "townhouse", "other"]).optional(),
  hasYard: z.boolean().optional(),
  otherPets: z.string().max(500).optional(),
  experience: z.string().max(1000).optional(),
  reason: z
    .string()
    .min(20, "Please tell us why you want to adopt (min 20 chars)")
    .max(2000),
});

export const reviewApplicationSchema = z.object({
  status: z.enum(["approved", "rejected"], {
    required_error: "Status must be 'approved' or 'rejected'",
  }),
  adminNotes: z.string().max(1000).optional(),
});

// ── Pagination / Filters ──────────────────────────────────────────────────────
export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 1))
    .pipe(z.number().int().positive()),
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 10))
    .pipe(z.number().int().min(1).max(500)),
  status: z.enum(["available", "adopted", "pending"]).optional(),
  species: z.string().optional(),
  gender: z.enum(["male", "female", "unknown"]).optional(),
  search: z.string().optional(),
  breed: z.string().optional(),
  minAge: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : undefined))
    .pipe(z.number().int().nonnegative().optional()),
  maxAge: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : undefined))
    .pipe(z.number().int().nonnegative().optional()),
});

// ── Inferred TypeScript types from schemas ────────────────────────────────────
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreatePetInput = z.infer<typeof createPetSchema>;
export type UpdatePetInput = z.infer<typeof updatePetSchema>;
export type UpdatePetStatusInput = z.infer<typeof updatePetStatusSchema>;
export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type ReviewApplicationInput = z.infer<typeof reviewApplicationSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
