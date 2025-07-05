import express from "express";
import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/accessControl.js";
import { uploadMultiple, uploadSingle } from "../middleware/multer.js";
import {
  uploadReportsValidation,
  uploadReportsToDb,
  updateReportValidation,
  updateReportInDb,
  deleteReports,
  viewReports,
} from "../controllers/reportController.js";

const router = express.Router();
router.use(protect);

router.post("/upload/validate", uploadReportsValidation);

router.post(
  "/upload/reports",
  uploadMultiple.array("reports", 5),
  uploadReportsToDb
);

router.get("/all", viewReports);

router.post("/update/validate", updateReportValidation);

router.put("/update/report", uploadSingle.single("report"), updateReportInDb);

router.delete("/delete", authorizeRoles("patient"), deleteReports);

export default router;
