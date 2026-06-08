// server/src/routes/ai.routes.ts
import { Router } from "express";
import { naturalLanguageSearch } from "../controllers/ai.controller";

const router = Router();
router.post("/search", naturalLanguageSearch);

export default router;