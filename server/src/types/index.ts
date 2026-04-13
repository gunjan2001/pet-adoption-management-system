// src/types/index.ts
import { Request } from "express";
import { User } from "../db/schema";

/**
 * The authenticated user shape attached to req by the authenticate middleware.
 * Strips password and timestamps — only what controllers need.
 */
export type AuthUser = Pick<User, "id" | "name" | "email" | "role" | "phone" | "address">;

/**
 * Express Request extended with the authenticated user.
 * Cast req to AuthRequest inside any protected controller.
 */
export interface AuthRequest extends Request {
  user: AuthUser;
}

/**
 * JWT token payload — what we encode when signing and decode when verifying.
 */
export interface JwtPayload {
  userId: number;
  role:   "user" | "admin";
  iat?:   number;
  exp?:   number;
}

/**
 * Standard paginated response meta returned alongside data arrays.
 */
export interface PaginationMeta {
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
}