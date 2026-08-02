import { Router } from "express";
import { signup, login, me } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/signup", signup);     // create client account
router.post("/login", login);
router.get("/me", requireAuth, me); // returns user + whether they own a business

export default router;
