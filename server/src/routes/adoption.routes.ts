// src/routes/adoption.routes.ts
import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import {
  createApplicationSchema,
  reviewApplicationSchema,
} from "../validators/schemas.js";
import {
  submitApplication,
  getMyApplications,
  getApplicationById,
  getAllApplications,
  reviewApplication,
  withdrawApplication,
} from "../controllers/adoption.controller.js";

const router = Router();

// ── User routes ───────────────────────────────────────────────────────────────
// POST /api/adoptions
router.post(
  "/",
  authenticate,
  authorize("user", "admin"),
  validateBody(createApplicationSchema),
  submitApplication
);

// GET /api/adoptions/my  ← must be defined BEFORE /:id to avoid route clash
router.get("/my", authenticate, getMyApplications);

// GET /api/adoptions/:id
router.get("/:id", authenticate, getApplicationById);

// DELETE /api/adoptions/:id/withdraw
router.delete("/:id/withdraw", authenticate, withdrawApplication);

// ── Admin routes ──────────────────────────────────────────────────────────────
// GET /api/adoptions
router.get("/", authenticate, authorize("admin"), getAllApplications);

// PATCH /api/adoptions/:id/review
router.patch(
  "/:id/review",
  authenticate,
  authorize("admin"),
  validateBody(reviewApplicationSchema),
  reviewApplication
);

export default router;
