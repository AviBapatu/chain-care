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

router.post(
  "/request",
  protect,
  authorizeRoles("doctor"),
  sendConnectionRequest
);

router.post(
  "/approve",
  protect,
  authorizeRoles("patient"),
  approveConnectionRequest
);

router.get(
  "/connecteddoctors",
  protect,
  authorizeRoles("patient"),
  getConnectedDoctors
);

router.get(
  "/connectedpatients",
  protect,
  authorizeRoles("doctor"),
  getConnectedPatients
);

router.delete("/disconnect", protect, disconnectConnection);

router.get("/pending", protect, getPendingRequests);

router.delete("/cancel", protect, authorizeRoles("doctor"), cancelRequest);

router.patch(
  "/update-access",
  protect,
  authorizeRoles("patient"),
  updateAccess
);
export default router;
