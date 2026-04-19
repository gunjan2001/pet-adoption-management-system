// src/routes/pet.routes.ts
import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";       // ← no .js
import { validateBody, validateQuery } from "../middleware/validate"; // ← no .js
import {
  createPetSchema,
  updatePetSchema,
  updatePetStatusSchema,
  paginationSchema,
} from "../validators/schemas";     // ← no .js
import {
  getAllPets,
  getPetById,
  createPet,
  updatePet,
  updatePetStatus,
  deletePet,
} from "../controllers/pet.controller"; // ← no .js

const router = Router();

// ── Public ────────────────────────────────────────────────────────────────────
// GET /api/pets
router.get("/", validateQuery(paginationSchema), getAllPets);

// GET /api/pets/:id
router.get("/:id", getPetById);

// ── Admin only ────────────────────────────────────────────────────────────────
// POST /api/pets
router.post(
  "/",
  authenticate,
  authorize("admin"),
  validateBody(createPetSchema),
  createPet
);

// PATCH /api/pets/:id
router.patch(
  "/:id",
  authenticate,
  authorize("admin"),
  validateBody(updatePetSchema),
  updatePet
);

// PATCH /api/pets/:id/status
router.patch(
  "/:id/status",
  authenticate,
  authorize("admin"),
  validateBody(updatePetStatusSchema),
  updatePetStatus
);

// DELETE /api/pets/:id
router.delete("/:id", authenticate, authorize("admin"), deletePet);

export default router;