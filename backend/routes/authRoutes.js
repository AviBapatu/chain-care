import express from "express";
import {
  checkEmail,
  loginUser,
  registerUser,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

const router = express.Router();

router.post('/check-email', checkEmail)

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token/:id", resetPassword);

export default router;
