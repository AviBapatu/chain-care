import express from "express";
import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/accessControl.js";
import { createNote, getAllNotes } from "../controllers/noteController.js";
const router = express.Router();

router.use(protect);

router.post("/create", authorizeRoles("doctor"), createNote);

router.get("/all", getAllNotes);

export default router;
