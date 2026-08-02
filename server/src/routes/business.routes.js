import { Router } from "express";
import {
  createBusiness,
  getBusinessBySlug,
  updateBusiness,
  listBusinesses,
} from "../controllers/business.controller.js";
import { requireAuth, requireOwner } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", listBusinesses);               // marketplace search/category filter
router.get("/:slug", getBusinessBySlug);        // public business page
router.post("/", requireAuth, createBusiness);  // "List your business" — turns a client into an owner
router.patch("/:id", requireAuth, requireOwner, updateBusiness);

export default router;
