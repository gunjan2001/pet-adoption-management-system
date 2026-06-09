// server/src/routes/ai.routes.ts
import { Router } from "express";
import { adoptionAssistant, naturalLanguageSearch } from "../controllers/ai.controller";

const router = Router();
router.post("/search", naturalLanguageSearch);
router.post("/adoption-assist", adoptionAssistant);

export default router;