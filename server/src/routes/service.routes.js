import { Router } from "express";
import {
  listServices,
  listMyServices,
  createService,
  updateService,
} from "../controllers/service.controller.js";
import { requireAuth, requireOwner } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", listServices);                                    // public — homepage search
router.get("/mine", requireAuth, requireOwner, listMyServices);    // owner's own dashboard list
router.post("/", requireAuth, requireOwner, createService);
router.patch("/:id", requireAuth, requireOwner, updateService);

export default router;