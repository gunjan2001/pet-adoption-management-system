// src/routes/auth.routes.ts
import { Router } from "express";
import {
  getProfile,
  login,
  register,
  updateProfile,
} from "../controllers/auth.controller"; // ← no .js
import { googleAuth } from "../controllers/google.auth.controller";
import { authenticate } from "../middleware/auth"; // ← no .js
import { validateBody } from "../middleware/validate"; // ← no .js
import {
  loginSchema,
  registerSchema,
  updateProfileSchema,
} from "../validators/schemas"; // ← no .js

const router = Router();

router.post("/google", googleAuth);

// POST /api/auth/register
router.post("/register", validateBody(registerSchema), register);

// POST /api/auth/login
router.post("/login", validateBody(loginSchema), login);

// GET /api/auth/me
router.get("/me", authenticate, getProfile);

// PATCH /api/auth/me
router.patch("/me", authenticate, validateBody(updateProfileSchema), updateProfile);

export default router;