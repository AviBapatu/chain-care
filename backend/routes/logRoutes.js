import express from "express";
import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/accessControl.js";
import { createLog, getAllLogs, deleteLog } from "../controllers/logController.js";

const router = express.Router();
router.use(protect);

router.post("/create", authorizeRoles("patient"), createLog);

router.get("/all", getAllLogs);

router.delete("/delete", authorizeRoles("patient"), deleteLog);

export default router;
