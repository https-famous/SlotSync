import { Router } from "express";
import {
  listServices,
  createService,
  updateService,
} from "../controllers/service.controller.js";
import { requireAuth, requireOwner } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", listServices); // supports ?category= & ?q= for homepage search
router.post("/", requireAuth, requireOwner, createService);
router.patch("/:id", requireAuth, requireOwner, updateService);

export default router;
