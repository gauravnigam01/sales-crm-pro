import express from "express";

import {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  addCustomerNote,
} from "../controllers/customerController.js";

import { protect } from "../middleware/authMiddleware.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = express.Router();

// ======================================
// Customer Routes
// ======================================

// Create Customer
router.post("/", protect, requirePermission("createCustomer"), createCustomer);

// Get All Customers
router.get("/", protect, requirePermission("viewCustomers"), getAllCustomers);

// Get Single Customer
router.get("/:id", protect, requirePermission("viewCustomers"), getCustomerById);

// Update Customer
router.put("/:id", protect, requirePermission("editCustomer"), updateCustomer);

// Delete Customer
router.delete("/:id", protect, requirePermission("deleteCustomer"), deleteCustomer);

// Add Customer Note
router.post("/:id/note", protect, requirePermission("editCustomer"), addCustomerNote);

export default router;
