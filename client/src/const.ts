/// <reference types="vite/client" />
// src/const.ts

export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string) ?? "http://localhost:5000/api";

export const TOKEN_KEY = "pat_token";   // localStorage key for JWT
export const USER_KEY  = "pat_user";    // localStorage key for cached user

export const ROLES = {
  USER:  "user",
  ADMIN: "admin",
} as const;

export const PET_STATUS = {
  AVAILABLE: "available",
  PENDING:   "pending",
  ADOPTED:   "adopted",
} as const;

export const ADOPTION_STATUS = {
  PENDING:  "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export const PET_GENDER = {
  MALE:    "male",
  FEMALE:  "female",
  UNKNOWN: "unknown",
} as const;
