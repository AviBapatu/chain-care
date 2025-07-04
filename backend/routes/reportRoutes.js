import express from "express";
import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/accessControl.js";
import { uploadMultiple, uploadSingle } from "../middleware/multer.js";
import {
  uploadReports,
  updateReports,
  deleteReports,
  viewReports
} from "../controllers/reportController.js";

const router = express.Router();
router.use(protect);

router.post("/upload", uploadMultiple.array("records", 5), uploadReports);

router.get("/all", viewReports);

router.put("/update", uploadSingle.single("record"), updateReports);

router.delete("/delete", authorizeRoles("patient"), deleteReports);

export default router;
