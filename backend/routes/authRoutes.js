import express from "express";
import { register, login } from "../controllers/authController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public Routes
router.post("/register", register);
router.post("/login", login);

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