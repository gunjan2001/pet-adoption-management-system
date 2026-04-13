// src/middleware/validate.ts
import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

/** Format Zod errors into our standard { field, message } shape */
const formatErrors = (err: ZodError) =>
  err.errors.map((e) => ({
    field:   e.path.join("."),
    message: e.message,
  }));

/**
 * validateBody
 * ────────────
 * Validates req.body against a Zod schema.
 * On failure → 400 with structured error list.
 * On success → replaces req.body with the coerced/parsed value and calls next().
 *
 * Usage:  router.post("/register", validateBody(registerSchema), register)
 */
export const validateBody =
  <T>(schema: ZodSchema<T>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors:  formatErrors(result.error),
      });
      return;
    }

    // Replace body with coerced data (e.g. string → number transforms applied)
    req.body = result.data as typeof req.body;
    next();
  };

/**
 * validateQuery
 * ─────────────
 * Validates req.query against a Zod schema.
 * Useful for pagination and filter params on GET endpoints.
 *
 * Usage:  router.get("/pets", validateQuery(paginationSchema), getAllPets)
 */
export const validateQuery =
  <T>(schema: ZodSchema<T>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Invalid query parameters",
        errors:  formatErrors(result.error),
      });
      return;
    }

    // Cast needed because req.query is typed as ParsedQs (read-only in TS)
    (req as Request & { query: T }).query = result.data as T;
    next();
  };
