// src/lib/utils.ts
// Required by every shadcn/ui component — DO NOT DELETE

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes safely, resolving conflicts.
 * Used by every shadcn UI component via `cn("base", conditional && "extra")`.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
