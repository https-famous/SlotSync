import { Router } from "express";
import { getMyAvailability, setAvailability } from "../controllers/availability.controller.js";
import { requireAuth, requireOwner } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/mine", requireAuth, requireOwner, getMyAvailability);
router.put("/", requireAuth, requireOwner, setAvailability);

export default router;