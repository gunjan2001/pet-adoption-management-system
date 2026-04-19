// src/lib/errorHandler.ts
// Extracts a human-readable message from any axios or unknown error.
// Import this in pages/components instead of duplicating error logic.

import axios, { AxiosError } from "axios";
import type { ApiError } from "@/types";

/**
 * Returns a user-facing error string from any thrown value.
 *
 * Priority:
 *  1. Backend `message` field from our standard { success: false, message } shape
 *  2. First validation error field message (e.g. "email: Invalid email address")
 *  3. Generic network/timeout message
 *  4. Fallback string
 */
export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (!axios.isAxiosError(error)) {
    if (error instanceof Error) return error.message;
    return fallback;
  }

  const axiosError = error as AxiosError<ApiError>;

  // No response = network/timeout issue
  if (!axiosError.response) {
    if (axiosError.code === "ECONNABORTED") return "Request timed out. Please try again.";
    return "Network error. Please check your connection.";
  }

  const data = axiosError.response.data;

  // Our backend always returns { success: false, message, errors? }
  if (data?.message) return data.message;

  // HTTP status fallbacks
  switch (axiosError.response.status) {
    case 400: return "Invalid request. Please check your input.";
    case 401: return "You are not logged in.";
    case 403: return "You do not have permission to do that.";
    case 404: return "The requested resource was not found.";
    case 409: return "A conflict occurred. Please try again.";
    case 422: return "Validation failed. Please check your input.";
    case 429: return "Too many requests. Please slow down.";
    case 500: return "Server error. Please try again later.";
    default:  return fallback;
  }
}

/**
 * Returns the per-field validation errors array from a 400 response,
 * or an empty array if not available.
 *
 * Usage in a form:
 *   const fieldErrors = getFieldErrors(error);
 *   fieldErrors.forEach(e => setError(e.field, { message: e.message }));
 */
export function getFieldErrors(error: unknown): { field: string; message: string }[] {
  if (!axios.isAxiosError(error)) return [];
  const data = (error as AxiosError<ApiError>).response?.data;
  return data?.errors ?? [];
}
