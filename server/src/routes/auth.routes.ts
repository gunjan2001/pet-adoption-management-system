// src/routes/auth.routes.ts
import { Router } from "express";
import { authenticate }          from "../middleware/auth";     // ← no .js
import { validateBody }          from "../middleware/validate"; // ← no .js
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
} from "../validators/schemas"; // ← no .js
import {
  register,
  login,
  getProfile,
  updateProfile,
} from "../controllers/auth.controller"; // ← no .js

const router = Router();

// POST /api/auth/register
router.post("/register", validateBody(registerSchema), register);

// POST /api/auth/login
router.post("/login", validateBody(loginSchema), login);

// GET /api/auth/me
router.get("/me", authenticate, getProfile);

// PATCH /api/auth/me
router.patch("/me", authenticate, validateBody(updateProfileSchema), updateProfile);

export default router;