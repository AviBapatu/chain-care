import express from "express";
import protect from "../middleware/authMiddleware.js";
import { getProfile, updateProfile } from "../controllers/profileRoutes.js";

const router = express.Router();
router.use(protect);

router.get("/view", getProfile);

router.put("/update", updateProfile);

export default router;
