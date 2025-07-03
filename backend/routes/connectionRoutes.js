import express from "express";
import {
  sendConnectionRequest,
  approveConnectionRequest,
  getConnectedDoctors,
  getConnectedPatients,
  disconnectConnection,
  getPendingRequests,
  cancelRequest,
  updateAccess,
} from "../controllers/connectionController.js";
import protect from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/accessControl.js";

const router = express.Router();
router.use(protect);

router.post("/request", authorizeRoles("doctor"), sendConnectionRequest);

router.post("/approve", authorizeRoles("patient"), approveConnectionRequest);

router.get("/connected-doctors", authorizeRoles("patient"), getConnectedDoctors);

router.get(
  "/connected-patients",
  authorizeRoles("doctor"),
  getConnectedPatients
);

router.delete("/disconnect", disconnectConnection);

router.get("/pending", getPendingRequests);

router.delete("/cancel", authorizeRoles("doctor"), cancelRequest);

router.patch("/update-access", authorizeRoles("patient"), updateAccess);

export default router;
