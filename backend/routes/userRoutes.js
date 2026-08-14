import express from "express";
import {
  getAllUsers,
  getMyTeam,
  createCaller,
  updateUser,
  deleteUser,
  changeUserRole,
  changeUserStatus,
  getPermissionMeta,
  getUserPermissions,
  updateUserPermissions,
  applyTemplateToUser,
  resetUserPassword,
} from "../controllers/userController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = express.Router();

// =======================================
// Admin Routes
// =======================================

// Get All Users (admin: everyone. manager: scoped to their own team.)
router.get(
  "/",
  protect,
  authorize("admin", "manager"),
  getAllUsers
);

// Get My Team (manager's own team members + basic stats)
router.get(
  "/my-team",
  protect,
  authorize("admin", "manager"),
  getMyTeam
);

// Get Permission Categories + Templates
router.get(
  "/permission-meta",
  protect,
  getPermissionMeta
);

// Create Caller
router.post(
  "/create-caller",
  protect,
  authorize("admin"),
  createCaller
);

// Update User
router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateUser
);
// Delete User
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteUser
);
// Change User Role
router.put(
  "/:id/change-role",
  protect,
  authorize("admin"),
  changeUserRole
);

// Change User Status
router.put(
  "/:id/change-status",
  protect,
  authorize("admin"),
  changeUserStatus
);

// Get User Permissions
router.get(
  "/:id/permissions",
  protect,
  requirePermission("manageUsers"),
  getUserPermissions
);

// Update User Permissions
router.put(
  "/:id/permissions",
  protect,
  requirePermission("manageUsers"),
  updateUserPermissions
);

// Apply Template To User
router.put(
  "/:id/apply-template",
  protect,
  requirePermission("manageUsers"),
  applyTemplateToUser
);

// Admin Reset Any User's Password
router.put(
  "/:id/reset-password",
  protect,
  authorize("admin"),
  resetUserPassword
);

export default router;
