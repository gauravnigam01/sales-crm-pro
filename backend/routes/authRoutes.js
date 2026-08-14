import express from "express";
import {
  login,
  forgotPassword,
  resetPasswordWithToken,
  getMe,
  updateProfile,
  changePassword,
} from "../controllers/authController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public self-signup is intentionally disabled — only an admin can create
// new accounts, via /api/users/create-caller (Users management).
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPasswordWithToken);

// Profile Routes
router.get("/me", protect, getMe);
router.put("/update-profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

// Protected Test Route (Admin Only)
router.get(
  "/admin-test",
  protect,
  authorize("admin"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Welcome Admin 🎉",
      user: req.user,
    });
  }
);

export default router;