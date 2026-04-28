// src/lib/errorHandler.ts
// Extracts a human-readable message from any axios or unknown error.
// Import this in pages/components instead of duplicating error logic.

import type { ApiError } from "@/types";
import axios, { AxiosError } from "axios";

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

/**
 * Categorize error type for better handling decisions
 */
export type ErrorType = 'network' | 'timeout' | 'not-found' | 'unauthorized' | 'validation' | 'server' | 'unknown';

export interface ErrorInfo {
  type: ErrorType;
  message: string;
  isRetryable: boolean;
  statusCode?: number;
  shouldRedirect?: boolean;
}

export function categorizeError(error: unknown): ErrorInfo {
  if (!axios.isAxiosError(error)) {
    return {
      type: 'unknown',
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      isRetryable: true,
    };
  }

  const axiosError = error as AxiosError<ApiError>;

  // Network error - always retryable
  if (!axiosError.response) {
    if (axiosError.code === 'ECONNABORTED') {
      return {
        type: 'timeout',
        message: 'The request took too long. Please try again.',
        isRetryable: true,
      };
    }
    return {
      type: 'network',
      message: 'Network error. Please check your connection.',
      isRetryable: true,
    };
  }

  const status = axiosError.response.status;
  
  if (status === 404) {
    return {
      type: 'not-found',
      message: 'Resource not found.',
      isRetryable: false,
      statusCode: status,
    };
  }

  if (status === 401 || status === 403) {
    return {
      type: 'unauthorized',
      message: 'Your session has expired. Please log in again.',
      isRetryable: false,
      statusCode: status,
      shouldRedirect: true,
    };
  }

  if (status === 422 || status === 400) {
    return {
      type: 'validation',
      message: 'Invalid request. Please check your filters.',
      isRetryable: false,
      statusCode: status,
    };
  }

  if (status >= 500) {
    return {
      type: 'server',
      message: 'Server error. Our team is notified. Please try again shortly.',
      isRetryable: true,
      statusCode: status,
    };
  }

  return {
    type: 'unknown',
    message: 'An error occurred. Please try again.',
    isRetryable: true,
    statusCode: status,
  };
}
/**
 * Calculate exponential backoff for retries
 */
export function getRetryDelay(attemptNumber: number): number {
  const baseDelay = 1000;
  const maxDelay = 30000;
  const delay = Math.min(baseDelay * Math.pow(2, attemptNumber - 1), maxDelay);
  return delay + Math.random() * 1000; // Add jitter
}
